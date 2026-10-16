# MargDarshak setup guide

This guide describes the current FastAPI backend, Next.js frontend, and account-based organization workflow. Commands below assume you start at the repository root. See [README.md](README.md) for the product workflow.

## Requirements

- Python **3.11 or 3.12** (`backend/.python-version` pins deployment to 3.11.9; this machine's local venv uses 3.12.5)
- Node.js **20.9 or newer** (required by the installed Next.js 16 package) and npm
- A running local MongoDB server or a MongoDB Atlas connection string
- A Mistral API key, Gemini API key, or both for AI-assisted features

The app can start without an AI key, but AI actions will report that assistance is unavailable. Install and run the local backend through `backend/.venv`. This keeps its packages separate from other Python projects.

## 1. Start the backend

In a terminal:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Open `backend/.env` and set `MONGODB_URI` to your database. Set at least one of `MISTRAL_API_KEY` or `GEMINI_API_KEY` to use AI features. The example file also shows model settings, `DB_NAME`, `FRONTEND_ORIGINS`, and `AUTH_COOKIE_SECURE`. Keep the real `.env` private; it is ignored by Git.

```powershell
.\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000
```

The API is at `http://localhost:8000`; Swagger UI is at `http://localhost:8000/docs`. Run from `backend/` so `main.py` loads the local `.env` file.

The commands above use the venv's interpreter directly, so PowerShell activation is unnecessary. On macOS or Linux, create the venv with `python3 -m venv .venv` and use `./.venv/bin/python` in place of `.\.venv\Scripts\python.exe`.

Mistral chat and embeddings are attempted first when configured. The backend tries its configured fallback Mistral model after a model rate limit, and can use Gemini when Mistral is unavailable. Gemini can also run alone. Model availability and API limits depend on your provider account.

## 2. Start the frontend

In a second terminal, from the repository root:

```powershell
cd frontend
npm ci
npm run dev
```

Open `http://localhost:3000`. The frontend calls its own `/api/proxy/...` route, which forwards requests and session cookies to FastAPI. For local development, the proxy defaults to `http://localhost:8000`. If the backend has another URL, put this in `frontend/.env.local` and restart Next.js:

```env
NEXT_PUBLIC_API_URL=http://localhost:8001
```

`frontend/.env.local` stays out of Git. Do not put Mistral or Gemini keys in the frontend environment.

## 3. Verify the workflow

1. Open `/auth` and sign up with an email and a password of at least eight characters.
2. Register an organization and select its thematic focus. The dashboard is available after registration.
3. Enter a problem, review the AI gist, set a student outcome, select a method and stakeholders, build a Theory of Change, generate indicators, and run the quality check.
4. Sign out and log in again. The account should reopen its own organization workspace.
5. Use [MANUAL_TEST_INPUTS.md](MANUAL_TEST_INPUTS.md) for fictional sample data, including a two-account isolation check.

Each account owns one organization. Backend session and ownership checks protect organization API data. The frontend stores a working design snapshot for the active organization and theme in browser state; sign-in remains the source of truth for account access.

## Environment variables

| Location | Variable | Purpose |
| --- | --- | --- |
| `backend/.env` | `MONGODB_URI` | Required MongoDB connection string |
| `backend/.env` | `DB_NAME` | Database name; defaults to `margdarshak` |
| `backend/.env` | `MISTRAL_API_KEY` | Mistral generation and embeddings |
| `backend/.env` | `MISTRAL_MODEL`, `MISTRAL_FALLBACK_MODEL` | Optional Mistral chat model choices |
| `backend/.env` | `GEMINI_API_KEY` | Gemini generation and embeddings fallback |
| `backend/.env` | `GEMINI_MODEL`, `GEMINI_EMBEDDING_MODEL` | Optional Gemini model choices |
| `backend/.env` | `AUTH_COOKIE_SECURE` | Use `false` on local HTTP and `true` on HTTPS deployments |
| `backend/.env` | `FRONTEND_ORIGINS` | Comma-separated allowed frontend origins for direct cross-origin calls |
| `frontend/.env.local` | `NEXT_PUBLIC_API_URL` | URL of FastAPI used by the Next.js proxy; defaults to local port 8000 |

The template is [`backend/.env.example`](backend/.env.example). Replace placeholders only in a private environment file or deployment settings.

## Dependencies and files

- From `backend/`, install or update packages with `.\.venv\Scripts\python.exe -m pip install -r requirements.txt` on Windows, or `./.venv/bin/python -m pip install -r requirements.txt` on macOS/Linux. Verify the environment with the same interpreter and `-m pip check`.
- The root [`requirements.txt`](requirements.txt) includes the canonical backend list. npm dependencies are defined by [`frontend/package.json`](frontend/package.json) and [`frontend/package-lock.json`](frontend/package-lock.json).
- Keep `backend/assets/` and `frontend/public/covers/`: they contain fonts and cover images used by exports and catalog cards.
- `backend/.venv/` is local and ignored by Git. `node_modules/` and `.next/` are frontend install/build output. Python `__pycache__/` and TypeScript `*.tsbuildinfo` are generated and ignored by Git.

## Deploy

### Backend service

Set the service root to `backend`, install with `pip install -r requirements.txt`, and start with:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Set `MONGODB_URI`, `DB_NAME`, and the AI keys you use in the service's private environment settings. Set `AUTH_COOKIE_SECURE=true` for HTTPS. Set `FRONTEND_ORIGINS` to the actual frontend origin if direct cross-origin API calls are needed.

### Frontend service

Set the service root to `frontend`, use npm with the committed lockfile, and set `NEXT_PUBLIC_API_URL` to the deployed FastAPI base URL. Browser requests still go to the same-origin Next.js proxy, which forwards cookies. Build with `npm run build` and run with `npm start` on a Node server, or use your hosting provider's Next.js integration.

The project records example deployment URLs in [deployment.txt](deployment.txt); check the current service state in the hosting dashboard.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| `MONGODB_URI not set` | Create `backend/.env` from the example and start FastAPI from `backend/`. |
| `No module named fastapi` | Use `backend/.venv`'s Python to install and start the backend; a plain `python` may point to another environment. |
| MongoDB connection error | Confirm the server or Atlas connection, credentials, and network access. |
| Sign-up route returns 404 | Open the Next.js app, confirm `/api/proxy/auth/signup` reaches the running FastAPI server, and restart both after configuration changes. |
| API proxy returns 502 | Confirm FastAPI is running and `NEXT_PUBLIC_API_URL` points to it from the Next.js server. |
| AI assistance unavailable | Check the configured provider keys, model names, quota, and backend response. |
| Indicators say an input was missed | Restart the current backend. Indicator responses now use stable short IDs and retry missing items individually. |
| CORS error on a direct backend request | Add the exact frontend origin to `FRONTEND_ORIGINS`. The app normally uses its same-origin proxy. |
| Frontend build fails | Use Node 20.9 or newer, run `npm ci`, then inspect `npm run build` output. |

## Useful commands

```powershell
# From backend/
.\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000

# From frontend/
npm run dev
npm run build
npm start
```
