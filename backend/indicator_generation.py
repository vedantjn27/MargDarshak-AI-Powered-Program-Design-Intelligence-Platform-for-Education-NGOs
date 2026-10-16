"""Map AI indicators to user inputs without relying on verbatim JSON keys."""

from presentation import presentable_text


def indicator_items(student_outcomes, practice_changes):
    items = []
    for index, outcome in enumerate(student_outcomes, 1):
        if isinstance(outcome, str) and outcome.strip():
            items.append({"id": f"O{index}", "kind": "student_outcome", "text": outcome})
    practice_index = 0
    for change in practice_changes:
        stakeholder_id = change.get("stakeholder_id")
        if not stakeholder_id:
            continue
        for practice in change.get("desired_practices", []):
            if not isinstance(practice, str) or not practice.strip():
                continue
            practice_index += 1
            items.append({
                "id": f"P{practice_index}",
                "kind": "stakeholder_practice",
                "stakeholder_id": stakeholder_id,
                "text": practice,
            })
    return items


def read_indicators(proposal, items):
    """Accept only indicators attached to a known, unique item ID."""
    valid_ids = {item["id"] for item in items}
    result = {}
    for entry in proposal.get("indicators", []):
        if not isinstance(entry, dict):
            continue
        item_id = str(entry.get("id", "")).strip().upper()
        indicator = presentable_text(entry.get("indicator"))
        if item_id in valid_ids and indicator and item_id not in result:
            result[item_id] = indicator
    return result


def indicators_by_input(items, generated):
    """Restore the public response shape expected by the dashboard."""
    outcome_indicators = {}
    practice_indicators = {}
    for item in items:
        indicator = generated[item["id"]]
        if item["kind"] == "student_outcome":
            outcome_indicators[item["text"]] = indicator
        else:
            practice_indicators.setdefault(item["stakeholder_id"], {})[item["text"]] = indicator
    return outcome_indicators, practice_indicators
