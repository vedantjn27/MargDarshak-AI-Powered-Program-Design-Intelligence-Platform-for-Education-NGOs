"""Starter LFA templates available even before a community library is populated.

These are planning scaffolds, not claims about a program's results or evidence.
"""

from datetime import datetime, timezone

from methodology_catalog import LIBRARY_THEMES, short_text
from presentation import presentable_text


TEMPLATE_ID_PREFIX = "starter_"
_CREATED_AT = datetime(2025, 1, 1, tzinfo=timezone.utc)


def canonical_theme(value: str) -> str:
    """Map older library labels to the registration theme keys."""
    normalized = str(value or "").strip().casefold()
    for key, aliases in LIBRARY_THEMES.items():
        if normalized in {alias.casefold() for alias in aliases}:
            return key
    return str(value or "")


_STARTERS = (
    (
        "fln_reading",
        "Grade 3 Reading Improvement Plan",
        "fln",
        "school",
        "Plan reading checks, level-appropriate practice, and follow-up for primary learners.",
        "Schools planning a structured literacy program for children with mixed reading levels.",
        ("Reading barrier and learner group", "Reading outcome and assessment rubric", "Teacher practice and reading materials", "Monthly checks and follow-up"),
    ),
    (
        "fln_numeracy",
        "Foundational Numeracy Plan",
        "fln",
        "school",
        "Map early numeracy gaps to classroom practice and simple, repeatable assessments.",
        "Primary school teams improving number sense or basic arithmetic.",
        ("Numeracy gap and starting level", "Target skill and assessment", "Practice sequence and teacher support", "Progress checks and response"),
    ),
    (
        "career_pathways",
        "Student Career Pathways Plan",
        "career_readiness",
        "school",
        "Connect career exploration, mentoring, and practical readiness skills to student outcomes.",
        "Schools and youth programs building career awareness and transition support.",
        ("Student aspirations and barriers", "Career readiness outcome", "Mentoring and exposure activities", "Participation and transition measures"),
    ),
    (
        "teacher_coaching",
        "Teacher Coaching Cycle",
        "teacher_development",
        "block",
        "Set out observation, coaching, classroom practice, and review in one improvement cycle.",
        "Teams supporting teachers across several schools.",
        ("Teaching practice to improve", "Coaching and observation cycle", "Classroom change expected", "Evidence of adoption and learner response"),
    ),
    (
        "digital_access",
        "Digital Learning Access Plan",
        "digital_learning",
        "school",
        "Plan device access, teacher support, accessible content, and checks on actual use.",
        "Programs introducing or improving digital learning in schools.",
        ("Access and connectivity barriers", "Learning purpose of the tool", "Teacher support and content", "Usage, inclusion, and learning checks"),
    ),
    (
        "stem_inquiry",
        "STEM Inquiry Learning Plan",
        "stem",
        "school",
        "Turn hands-on investigations into measurable reasoning and problem-solving outcomes.",
        "Schools planning practical science, technology, engineering, or mathematics activities.",
        ("Inquiry skill and learner group", "Materials and facilitator preparation", "Investigation activities", "Evidence of reasoning and participation"),
    ),
    (
        "inclusive_classroom",
        "Inclusive Classroom Support Plan",
        "inclusive_education",
        "school",
        "Identify participation barriers and plan accessible teaching, support, and monitoring.",
        "Teams improving classroom participation for learners with different support needs.",
        ("Learner barriers and accessibility", "Support and classroom adaptations", "Participation outcome", "Feedback from learners and caregivers"),
    ),
)


def starter_templates() -> list[dict]:
    templates = []
    for slug, name, theme, level, description, best_for, sections in _STARTERS:
        templates.append({
            "template_id": f"{TEMPLATE_ID_PREFIX}{slug}",
            "name": name,
            "theme": theme,
            "system_level": level,
            "geography_type": "generic",
            "applicable_states": [],
            "description": description,
            "best_for": best_for,
            "lfa_structure": {
                "sections": list(sections),
                "problem": "Describe the barrier using locally verified evidence.",
                "outcome": "Define one measurable change for the target group and timeframe.",
                "outputs": "List the services or materials the program will deliver.",
                "activities": "List the work, owners, and timing needed for each output.",
                "indicators": "Record baseline, target, data source, and review date.",
                "assumptions": "State what needs to hold true for the pathway to work.",
            },
            "created_by": "system",
            "is_public": True,
            "created_at": _CREATED_AT,
        })
    return templates


def available_templates(records: list[dict], focus_areas: list[str] | None = None,
                        theme: str | None = None, system_level: str | None = None,
                        geography_type: str | None = None) -> list[dict]:
    """Merge public records with starters and apply organization-specific filters."""
    allowed = {canonical_theme(item) for item in focus_areas} if focus_areas is not None else None
    requested = canonical_theme(theme) if theme else None
    unique = {}
    for record in [*records, *starter_templates()]:
        if not record.get("is_public"):
            continue
        template_theme = canonical_theme(record.get("theme", ""))
        if allowed is not None and template_theme not in allowed:
            continue
        if requested and template_theme != requested:
            continue
        if system_level and record.get("system_level") != system_level:
            continue
        if geography_type and record.get("geography_type") != geography_type:
            continue
        normalized = dict(record)
        normalized.pop("_id", None)
        normalized["theme"] = template_theme
        unique.setdefault(normalized["template_id"], normalized)
    return list(unique.values())


_THEME_GUIDES = {
    "fln": {
        "best_for": "Primary school teams improving foundational reading or numeracy.",
        "workflow": ("Check learning levels", "Set a learning goal", "Plan suitable practice", "Review progress"),
        "sections": ("Learners and learning gap", "Measurable learning outcome", "Teaching and practice plan", "Assessment and evidence"),
    },
    "career_readiness": {
        "best_for": "School and youth teams supporting career exploration and transitions.",
        "workflow": ("Understand aspirations", "Choose a readiness goal", "Plan exposure and support", "Track next steps"),
        "sections": ("Learner aspirations and barriers", "Readiness outcome", "Exposure and mentoring plan", "Participation and transition evidence"),
    },
    "teacher_development": {
        "best_for": "Teams planning coaching and practice support for teachers.",
        "workflow": ("Observe current practice", "Choose a teaching goal", "Coach and rehearse", "Review classroom change"),
        "sections": ("Teaching practice to improve", "Expected classroom change", "Coaching and support plan", "Observation and learner evidence"),
    },
    "digital_learning": {
        "best_for": "School teams introducing digital tools with a clear learning purpose.",
        "workflow": ("Check access", "Choose a learning goal", "Plan content and support", "Review use and learning"),
        "sections": ("Access and learning need", "Learning outcome", "Tool and teacher support", "Use and learning evidence"),
    },
    "stem": {
        "best_for": "School teams planning hands-on STEM inquiry and reasoning.",
        "workflow": ("Identify a skill gap", "Set an inquiry goal", "Plan investigations", "Review student work"),
        "sections": ("Learner skill gap", "Inquiry outcome", "Investigation plan", "Work samples and assessment"),
    },
    "inclusive_education": {
        "best_for": "Teams improving access and participation for learners with varied needs.",
        "workflow": ("Identify barriers", "Set a participation goal", "Adapt teaching and support", "Listen and review"),
        "sections": ("Participation barriers", "Inclusion outcome", "Classroom adaptations", "Learner and caregiver feedback"),
    },
}

_SECTION_PURPOSES = (
    "Describe who is affected and check the need with local evidence.",
    "Define the change you want to see, including a measure and timeframe.",
    "List the activities, materials, people, and timing needed to deliver it.",
    "Record baseline, target, data source, and review date.",
)


def _section_cards(structure: dict, guide: dict) -> list[dict]:
    raw_sections = structure.get("sections") if isinstance(structure, dict) else None
    cards = []
    if isinstance(raw_sections, list):
        for index, section in enumerate(raw_sections[:6]):
            if isinstance(section, dict):
                title = presentable_text(section.get("title") or section.get("name"))
                description = presentable_text(section.get("description") or section.get("details"))
            else:
                title = presentable_text(section)
                description = ""
            if title:
                cards.append({
                    "title": short_text(title, 8),
                    "description": short_text(description, 24) if description else _SECTION_PURPOSES[min(index, 3)],
                })
    if not cards and isinstance(structure, dict):
        for key, value in structure.items():
            if key == "sections" or value in (None, "", [], {}):
                continue
            title = str(key).replace("_", " ").title()
            description = short_text(value, 24)
            if description:
                cards.append({"title": title, "description": description})
            if len(cards) == 4:
                break
    if not cards:
        cards = [
            {"title": title, "description": _SECTION_PURPOSES[index]}
            for index, title in enumerate(guide["sections"])
        ]
    return cards


def template_detail(template: dict, organization: dict) -> dict:
    """Give every template a concise and useful full-screen guide without AI."""
    theme = canonical_theme(template.get("theme", ""))
    guide = _THEME_GUIDES.get(theme, {
        "best_for": "Teams planning a measurable program in this focus area.",
        "workflow": ("Understand the need", "Set an outcome", "Plan delivery", "Measure change"),
        "sections": ("Need and target group", "Outcome", "Activities and outputs", "Indicators and evidence"),
    })
    structure = template.get("lfa_structure") or {}
    cards = _section_cards(structure, guide)
    org_name = organization.get("organization_name") or "your organization"
    return {
        "name": template.get("name", "Template"),
        "theme": theme,
        "system_level": template.get("system_level", ""),
        "overview": short_text(template.get("description") or "A planning guide for this focus area.", 32),
        "best_for": short_text(template.get("best_for") or guide["best_for"], 24),
        "sections": [card["title"] for card in cards],
        "section_cards": cards,
        "workflow": [{"title": title, "description": _SECTION_PURPOSES[index]} for index, title in enumerate(guide["workflow"])],
        "adaptation_tips": [
            f"Add {org_name}'s real learners, locations, and delivery team.",
            "Set baselines and targets using verified local evidence.",
            "Review the plan with the people who will deliver it.",
        ],
    }
