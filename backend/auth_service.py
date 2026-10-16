"""Password login and server-side organization access control."""

import base64
import binascii
import hashlib
import hmac
import os
import re
import secrets
from datetime import datetime, timedelta, timezone

from bson import ObjectId
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from pymongo.errors import DuplicateKeyError


COOKIE_NAME = "md_session"
SESSION_DAYS = 14
PASSWORD_ITERATIONS = 600_000
EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


class Credentials(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=8, max_length=128)


def normalize_email(value: str) -> str:
    email = value.strip().lower()
    if not EMAIL_PATTERN.fullmatch(email):
        raise HTTPException(422, "Enter a valid email address.")
    return email


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PASSWORD_ITERATIONS)
    return "pbkdf2_sha256$%d$%s$%s" % (
        PASSWORD_ITERATIONS,
        base64.b64encode(salt).decode("ascii"),
        base64.b64encode(digest).decode("ascii"),
    )


def verify_password(password: str, saved: str) -> bool:
    try:
        algorithm, iterations, salt, digest = saved.split("$")
        if algorithm != "pbkdf2_sha256" or not 100_000 <= int(iterations) <= 2_000_000:
            return False
        actual = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), base64.b64decode(salt), int(iterations))
        return hmac.compare_digest(actual, base64.b64decode(digest))
    except (ValueError, TypeError, binascii.Error):
        return False


def public_organization(db, user: dict):
    org_id = user.get("organization_id")
    if not org_id or not ObjectId.is_valid(org_id):
        return None
    organization = db.organization_profiles.find_one({"_id": ObjectId(org_id), "owner_user_id": str(user["_id"])})
    if not organization:
        return None
    organization["_id"] = str(organization["_id"])
    organization.pop("owner_user_id", None)
    return organization


def install_auth(app: FastAPI, db) -> None:
    users = db["users"]
    sessions = db["auth_sessions"]

    def ensure_indexes():
        users.create_index("email", unique=True)
        sessions.create_index("token_hash", unique=True)
        sessions.create_index("expires_at", expireAfterSeconds=0)

    def issue_session(user: dict, response: Response):
        token = secrets.token_urlsafe(32)
        sessions.insert_one({
            "token_hash": hashlib.sha256(token.encode("ascii")).hexdigest(),
            "user_id": user["_id"],
            "expires_at": datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS),
        })
        response.set_cookie(
            COOKIE_NAME, token, max_age=SESSION_DAYS * 86400, httponly=True,
            secure=os.getenv("AUTH_COOKIE_SECURE", "false").lower() == "true",
            samesite="strict", path="/",
        )

    def auth_result(user: dict):
        return {"user": {"id": str(user["_id"]), "email": user["email"]}, "organization": public_organization(db, user)}

    @app.post("/auth/signup")
    def signup(payload: Credentials, response: Response):
        ensure_indexes()
        email = normalize_email(payload.email)
        if users.find_one({"email": email}, {"_id": 1}):
            raise HTTPException(409, "An account with this email already exists.")
        user = {"email": email, "password_hash": hash_password(payload.password), "organization_id": None, "created_at": datetime.now(timezone.utc)}
        try:
            user["_id"] = users.insert_one(user).inserted_id
        except DuplicateKeyError as exc:
            raise HTTPException(409, "An account with this email already exists.") from exc
        issue_session(user, response)
        return auth_result(user)

    @app.post("/auth/login")
    def login(payload: Credentials, response: Response):
        ensure_indexes()
        email = normalize_email(payload.email)
        user = users.find_one({"email": email})
        if not user or not verify_password(payload.password, user.get("password_hash", "")):
            raise HTTPException(401, "Email or password is incorrect.")
        issue_session(user, response)
        return auth_result(user)

    @app.get("/auth/me")
    def me(request: Request):
        return auth_result(request.state.user)

    @app.post("/auth/logout")
    def logout(request: Request, response: Response):
        token = request.cookies.get(COOKIE_NAME, "")
        if token:
            sessions.delete_one({"token_hash": hashlib.sha256(token.encode("ascii")).hexdigest()})
        response.delete_cookie(COOKIE_NAME, path="/")
        return {"message": "Signed out."}

    @app.middleware("http")
    async def authenticate_and_authorize(request: Request, call_next):
        path = request.url.path
        if path in ("/health", "/openapi.json", "/docs", "/redoc", "/auth/signup", "/auth/login") or path.startswith("/docs/"):
            return await call_next(request)

        token = request.cookies.get(COOKIE_NAME, "")
        session = sessions.find_one({"token_hash": hashlib.sha256(token.encode("ascii")).hexdigest()}) if token else None
        if not session or session["expires_at"].replace(tzinfo=timezone.utc) <= datetime.now(timezone.utc):
            return JSONResponse({"detail": "Sign in to continue."}, status_code=401)
        user = users.find_one({"_id": session["user_id"]})
        if not user:
            return JSONResponse({"detail": "Sign in to continue."}, status_code=401)
        request.state.user = user

        if path.startswith("/auth/"):
            return await call_next(request)
        if path == "/organization/profile" and request.method == "POST":
            if user.get("organization_id"):
                return JSONResponse({"detail": "This account already has an organization."}, status_code=409)
            return await call_next(request)

        organization = public_organization(db, user)
        if not organization:
            return JSONResponse({"detail": "Register your organization first."}, status_code=403)
        org_id = organization["_id"]
        parts = [part for part in path.split("/") if part]
        requested_ids = []
        if len(parts) >= 3 and parts[:2] == ["organization", "profile"]:
            requested_ids.append(parts[2])
        elif len(parts) >= 2 and parts[0] == "organization":
            requested_ids.append(parts[1])
        for name in ("organization_id", "org_id"):
            if request.query_params.get(name):
                requested_ids.append(request.query_params[name])
        if request.method in ("POST", "PUT", "PATCH", "DELETE") and "application/json" in request.headers.get("content-type", ""):
            try:
                payload = await request.json()
            except ValueError:
                payload = {}
            if isinstance(payload, dict):
                for name in ("organization_id", "created_by"):
                    if payload.get(name):
                        requested_ids.append(str(payload[name]))
        if any(item != org_id for item in requested_ids):
            return JSONResponse({"detail": "You cannot access another organization's data."}, status_code=403)

        if len(parts) >= 3 and parts[0] == "problem-statement" and parts[-1] == "ai-refine":
            problem = db.problem_statements.find_one({"_id": ObjectId(parts[1])}) if ObjectId.is_valid(parts[1]) else None
            if not problem or problem.get("organization_id") != org_id:
                return JSONResponse({"detail": "Problem statement not found."}, status_code=404)
        if len(parts) >= 4 and parts[:3] == ["lfa", "templates", "share"]:
            template = db.organization_templates.find_one({"template_id": parts[3], "created_by": org_id})
            if not template:
                return JSONResponse({"detail": "Template not found."}, status_code=404)

        return await call_next(request)
