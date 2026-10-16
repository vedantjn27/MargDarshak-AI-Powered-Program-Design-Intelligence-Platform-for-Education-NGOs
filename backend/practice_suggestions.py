"""Shape practice-change AI output into concise dashboard cards."""

import re
from typing import Any

from presentation import presentable_text


def brief(value: Any, max_words: int) -> str:
    readable = " ".join(presentable_text(value).split())
    words = readable.split()
    if len(words) <= max_words:
        return readable
    sentences = re.split(r"(?<=[.!?])\s+", readable)
    kept = ""
    for sentence in sentences:
        candidate = f"{kept} {sentence}".strip()
        if len(candidate.split()) > max_words:
            break
        kept = candidate
    return kept or " ".join(words[:max_words]).rstrip(",;:") + "…"


def _cards(proposal: dict, field: str, legacy_field: str) -> list[dict[str, str]]:
    values = proposal.get(field)
    if not isinstance(values, list) or not values:
        values = proposal.get(legacy_field, [])
    if not isinstance(values, list):
        return []
    cards = []
    for index, value in enumerate(values[:5]):
        if isinstance(value, dict):
            title = brief(value.get("title", ""), 5)
            summary = brief(value.get("summary") or value.get("detail") or value.get("description"), 19)
        else:
            readable = presentable_text(value)
            heading, separator, rest = readable.partition(":")
            title = brief(heading, 5) if separator and len(heading.split()) <= 6 else ""
            summary = brief(rest if title else readable, 19)
        if not summary:
            continue
        cards.append({"title": title or f"Idea {index + 1}", "summary": summary})
    return cards


def normalize_practice_suggestions(proposal: dict, desired_practices: list[str]) -> dict:
    current = _cards(proposal, "current_cards", "suggested_current")
    desired = _cards(proposal, "desired_cards", "suggested_desired")
    first_desired = desired_practices[0] if desired_practices else ""
    key_idea = brief(proposal.get("key_idea") or first_desired, 13)
    first_step = brief(proposal.get("first_step") or (desired[0]["summary"] if desired else first_desired), 18)
    return {
        "key_idea": key_idea,
        "current_cards": current,
        "desired_cards": desired,
        "first_step": first_step,
        "suggested_current": [card["summary"] for card in current],
        "suggested_desired": [card["summary"] for card in desired],
    }
