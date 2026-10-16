"""Bridge registration focus values and the shared methodology library labels."""

import re

from presentation import presentable_text


LIBRARY_THEMES = {
    "fln": ("fln", "FLN"),
    "career_readiness": ("career_readiness", "Career Readiness"),
    "teacher_development": ("teacher_development", "Teacher Capacity", "Teacher Development"),
    "digital_learning": ("digital_learning", "Digital Learning"),
    "stem": ("stem", "STEM", "STEM Education"),
    "inclusive_education": ("inclusive_education", "Inclusive Education"),
}

STATE_ALIASES = {"uttar pradesh": "up"}


def library_theme_query(focus_areas: list[str]) -> dict:
    labels = []
    for focus in focus_areas:
        labels.extend(LIBRARY_THEMES.get(focus, (focus,)))
    return {"$in": list(dict.fromkeys(labels))}


def geography_matches(method: dict, state: str) -> bool:
    selected = state.strip().lower()
    variants = {selected, STATE_ALIASES.get(selected, selected)}
    catalog = {str(place).strip().lower() for place in method.get("geographies", [])}
    return "all" in catalog or bool(variants & catalog)


def methodology_for_display(method: dict) -> dict:
    result = dict(method)
    result["catalog_name"] = result.get("name", "")
    if not result.get("description"):
        components = [presentable_text(item) for item in result.get("components", []) if presentable_text(item)]
        if components:
            summary = ", ".join(components[:-1]) + (" and " if len(components) > 1 else "") + components[-1]
            result["description"] = f"An approach built around {summary.lower()}."
        else:
            result["description"] = f"Explore the activities and evidence behind {result.get('name', 'this methodology')}."
    return result


def fallback_detail(method: dict, organization: dict) -> dict:
    """Explain a catalog record when the optional AI explanation is unavailable."""
    item = methodology_for_display(method)
    components = [presentable_text(part) for part in item.get("components", [])]
    geography = organization.get("geography") or {}
    location = geography.get("state", "your area")
    documented = ", ".join(item.get("geographies", []))
    risks = [f"Check staffing, cost, and fit before using this approach in {location}."]
    if documented and documented != "all":
        risks.append(f"The catalog lists experience in {documented}; adapt and test the approach locally before scaling.")
    return {
        "summary": item["description"],
        "implementation_steps": [f"Plan and deliver {component.lower()}." for component in components] or ["Define the activities, owners, and resources for this approach."],
        "when_to_use": "Consider this method when its activities address a barrier in your saved problem and support your selected outcome.",
        "resources_needed": ["Confirm staff time, materials, and the budget needed for each activity."],
        "risks": risks,
        "success_measures": ["Record the outcome measure at baseline and follow-up using the same assessment method."],
    }


def short_text(value: object, max_words: int) -> str:
    """Keep complete short sentences where possible and cap long AI prose."""
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
    if kept:
        return kept
    return " ".join(words[:max_words]).rstrip(",;:") + "…"


def compact_methodology_detail(method: dict, organization: dict, ai_detail: dict) -> dict:
    """Return short, method-specific copy and a component-based example flow."""
    fallback = fallback_detail(method, organization)
    detail = ai_detail if isinstance(ai_detail, dict) else {}

    def brief_list(field: str, max_items: int = 3, max_words: int = 18) -> list[str]:
        source = detail.get(field)
        if not isinstance(source, list) or not source:
            source = fallback[field]
        return [item for value in source[:max_items] if (item := short_text(value, max_words))]

    implementation_steps = brief_list("implementation_steps", 5, 17)
    components = [short_text(part, 7) for part in method.get("components", []) if presentable_text(part)]
    component_steps = list(enumerate(components))
    if len(component_steps) > 5:
        component_steps = component_steps[:4] + component_steps[-1:]
    fallback_steps = [short_text(step, 17) for step in fallback["implementation_steps"]]
    workflow = [
        {
            "title": component,
            "example": implementation_steps[index] if index < len(implementation_steps) else (fallback_steps[index] if index < len(fallback_steps) else ""),
        }
        for index, component in component_steps
    ]
    if not workflow:
        workflow = [{"title": f"Step {index + 1}", "example": step} for index, step in enumerate(implementation_steps)]

    risks = brief_list("risks")
    state = (organization.get("geography") or {}).get("state", "")
    documented = ", ".join(str(place) for place in method.get("geographies", []))
    if state and documented and not geography_matches(method, state):
        local_caution = short_text(f"Documented in {documented}; test local fit in {state} before scaling.", 18)
        risks = [local_caution] + [risk for risk in risks if risk != local_caution][:2]

    return {
        "summary": short_text(detail.get("summary") or fallback["summary"], 38),
        "when_to_use": short_text(detail.get("when_to_use") or fallback["when_to_use"], 28),
        "implementation_steps": implementation_steps,
        "workflow": workflow,
        "resources_needed": brief_list("resources_needed"),
        "risks": risks,
        "success_measures": brief_list("success_measures"),
    }
