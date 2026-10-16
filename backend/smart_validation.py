"""Transparent checks for the wording and numeric structure of SMART outcomes."""

import math
import re


THEME_TERMS = {
    "fln": ("read", "reading", "literacy", "paragraph", "letter", "hindi", "numeracy", "math", "number", "पढ़", "साक्षर", "गणित"),
    "career_readiness": ("career", "employment", "job", "vocational", "workplace", "internship", "करियर", "रोजगार"),
    "teacher_development": ("teacher", "teaching", "instruction", "pedagogy", "classroom", "coaching", "शिक्षक", "पढ़ान"),
    "digital_learning": ("digital", "online", "device", "technology", "computer", "internet", "डिजिटल", "कंप्यूटर"),
    "stem": ("science", "technology", "engineering", "math", "numeracy", "experiment", "विज्ञान", "गणित"),
    "inclusive_education": ("inclusion", "inclusive", "disability", "access", "participation", "equity", "समावेश", "दिव्यांग"),
}

GROUP = re.compile(r"\b(student|students|child|children|learner|learners|teacher|teachers|pupil|pupils|youth|school|schools|parent|parents)\b|छात्र|बच्च|विद्यार्थ|शिक्षक|विद्यालय", re.I)
ACTION = re.compile(r"\b(read|write|explain|solve|demonstrate|complete|identify|attend|graduate|transition|calculate|achieve|perform|use|practice)\b|पढ़|लिख|समझ|हल|पूरा|पहचान|उत्तीर्ण|गणना|प्राप्त", re.I)
MEASURE = re.compile(r"%|\b(percent|percentage|share|proportion|rate|number|count|score|rubric|assessment|test|attendance|fluency|minutes|hours)\b|प्रतिशत|हिस्सा|अनुपात|अंक|माप|आकलन|परीक्षण", re.I)
DECREASE = re.compile(r"\b(reduce|decrease|lower|cut|drop|decline)\b|कम|घट", re.I)
TIME = re.compile(r"\b(\d+(?:\.\d+)?)\s*(months?|years?)\b|(\d+(?:\.\d+)?)\s*(महीन\S*|माह|वर्ष|साल)", re.I)
STOPWORDS = {"students", "student", "children", "child", "teachers", "teacher", "school", "schools", "grade", "within", "increase", "decrease", "from", "with", "using", "into", "that", "this", "will", "their", "have", "many", "participating"}


def _problem_overlap(outcome: str, problem: str) -> bool:
    problem_words = {word for word in re.findall(r"[a-z]{4,}", problem.lower()) if word not in STOPWORDS}
    outcome_words = set(re.findall(r"[a-z]{4,}", outcome.lower()))
    return bool(problem_words & outcome_words)


def _theme_match(statement: str, theme: str) -> bool:
    lower = statement.lower()
    return any(
        bool(re.search(rf"\b{re.escape(term)}\b", lower)) if term.isascii() else term in lower
        for term in THEME_TERMS.get(theme, ())
    )


def validate_smart_outcome(outcome: str, baseline: float, target: float, timeline: int, theme: str = "", problem: str = "") -> dict:
    """Assess whether a goal is well formed; this does not prove target feasibility."""
    statement = outcome.strip()
    valid_numbers = all(math.isfinite(value) and 0 <= value <= 100 for value in (baseline, target))
    specific = len(statement.split()) >= 8 and bool(GROUP.search(statement) and ACTION.search(statement))
    measurable = valid_numbers and bool(MEASURE.search(statement))
    improving = baseline > target if DECREASE.search(statement) else target > baseline
    monthly_change = abs(target - baseline) / timeline if timeline > 0 else float("inf")
    achievable = valid_numbers and improving and timeline > 0 and monthly_change <= 10
    relevant = bool(
        _theme_match(statement, theme)
        or (problem and _problem_overlap(statement, problem))
    ) if theme in THEME_TERMS or problem else True
    time_matches = list(TIME.finditer(statement))
    stated_months = []
    for match in time_matches:
        amount = float(match.group(1) or match.group(3))
        unit = (match.group(2) or match.group(4)).lower()
        stated_months.append(amount * 12 if unit.startswith("year") or unit in {"वर्ष", "साल"} else amount)
    time_bound = timeline > 0 and (not stated_months or any(abs(months - timeline) < 0.1 for months in stated_months))

    criteria = [
        {"key": "specific", "passed": specific, "reason": "The statement identifies a group and an observable skill or action." if specific else "Name the people affected and the skill or action they will demonstrate."},
        {"key": "measurable", "passed": measurable, "reason": "The statement names a measure and the baseline and target are valid percentages." if measurable else "Name the measure (for example, the share passing the same reading assessment) and enter percentages from 0 to 100."},
        {"key": "achievable", "passed": achievable, "reason": f"The target changes by {abs(target - baseline):g} percentage points over {timeline} months; check feasibility against a verified baseline and resources." if achievable else "Set an improving target within 0–100% and review whether the planned pace is feasible."},
        {"key": "relevant", "passed": relevant, "reason": "The outcome connects to the organization's focus or saved problem." if relevant else "Connect the outcome to this organization's selected focus or saved problem."},
        {"key": "time_bound", "passed": time_bound, "reason": f"The plan has a consistent {timeline}-month timeframe." if time_bound else "Set a positive timeline and make it match any timeframe written in the statement."},
    ]
    score = sum(item["passed"] for item in criteria)
    return {
        "smart_score": score,
        "issues": [item["reason"] for item in criteria if not item["passed"]],
        "is_valid": score == 5,
        "criteria": criteria,
        "note": "SMART checks the clarity of the goal. Verify the baseline and target feasibility before using the plan.",
    }
