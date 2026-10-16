"""Turn structured or serialized AI text into readable dashboard copy."""

import ast
import json
import re
from typing import Any


def _parsed(value: str) -> Any:
    stripped = value.strip()
    if not (stripped.startswith("{") and stripped.endswith("}")) and not (
        stripped.startswith("[") and stripped.endswith("]")
    ):
        return value
    for parser in (json.loads, ast.literal_eval):
        try:
            parsed = parser(stripped)
            if isinstance(parsed, (dict, list)):
                return parsed
        except (ValueError, SyntaxError, TypeError):
            pass
    return value


def presentable_text(value: Any) -> str:
    """Read the meaningful fields of AI output without exposing object syntax."""
    if value is None:
        return ""
    if isinstance(value, str):
        parsed = _parsed(value)
        if parsed is not value:
            return presentable_text(parsed)
        return re.sub(r"\*\*|__", "", value).strip()
    if isinstance(value, list):
        return "; ".join(part for item in value if (part := presentable_text(item)))
    if isinstance(value, dict):
        primary = next(
            (presentable_text(value[key]) for key in (
                "details", "description", "note", "text", "statement", "label",
                "cause", "effect", "suggestion", "action", "rationale", "name",
            ) if value.get(key)),
            "",
        )
        if not primary:
            primary = "; ".join(
                f"{str(key).replace('_', ' ').capitalize()}: {text}"
                for key, item in value.items()
                if (text := presentable_text(item))
            )
        if value.get("data_type"):
            category = str(value["data_type"]).replace("_", " ").capitalize()
            primary = f"{category}: {primary}" if primary else category
        if value.get("owner"):
            owner = presentable_text(value["owner"]).replace("_", " ").title()
            primary = f"{primary} (Suggested owner: {owner})" if primary else owner
        return primary
    return str(value).strip()


def text_items(values: Any, limit: int = 6) -> list[str]:
    if not isinstance(values, list):
        return []
    return [text for item in values[:limit] if (text := presentable_text(item))]


def normalize_to_shape(value: Any, example: Any) -> Any:
    """Coerce user-facing fields using the JSON shape supplied to the model."""
    if isinstance(example, str):
        return presentable_text(value)
    if isinstance(example, list) and isinstance(value, list) and example:
        return [normalize_to_shape(item, example[0]) for item in value]
    if isinstance(example, dict) and isinstance(value, dict) and example:
        if len(example) == 1 and not any(key in value for key in example):
            sample = next(iter(example.values()))
            return {key: normalize_to_shape(item, sample) for key, item in value.items()}
        return {
            key: normalize_to_shape(item, example[key]) if key in example else item
            for key, item in value.items()
        }
    return value
