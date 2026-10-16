"""Structural Theory of Change checks and readable, edge-driven diagrams."""

import html
from typing import Any

import networkx as nx

from presentation import presentable_text


LEVELS = ("activity", "output", "outcome", "impact")


def validate_toc(nodes: list[dict], edges: list[dict]) -> list[str]:
    issues = []
    ids = [str(node.get("id", "")) for node in nodes]
    if len(ids) != len(set(ids)):
        issues.append("Two nodes share the same ID. Give each step a unique ID.")
    node_map = {str(node.get("id", "")): node for node in nodes}

    for node in nodes:
        node_id = str(node.get("id", ""))
        if not node_id.strip() or not str(node.get("label", "")).strip():
            issues.append(f"Complete the ID and description for node {node_id or '(unnamed)'}.")
        if node.get("type") not in LEVELS:
            issues.append(f"Node {node_id or '(unnamed)'} needs a valid level: activity, output, outcome, or impact.")

    present_levels = {node.get("type") for node in nodes}
    for level in LEVELS:
        if level not in present_levels:
            issues.append(f"Add at least one {level}.")

    graph = nx.DiGraph()
    graph.add_nodes_from(node_map)
    seen_edges = set()
    for edge in edges:
        source, target = str(edge.get("source", "")), str(edge.get("target", ""))
        if (source, target) in seen_edges:
            issues.append(f"Connection {source} → {target} is repeated.")
            continue
        seen_edges.add((source, target))
        if source not in node_map or target not in node_map:
            issues.append(f"Connection {source} → {target} refers to a missing node.")
            continue
        graph.add_edge(source, target)
        source_level, target_level = node_map[source].get("type"), node_map[target].get("type")
        if source_level in LEVELS and target_level in LEVELS and LEVELS.index(target_level) != LEVELS.index(source_level) + 1:
            issues.append(f"Connect {source} ({source_level}) to the next level, not {target} ({target_level}).")

    if not edges:
        issues.append("Connect the steps from activities through outputs and outcomes to impact.")
    if not nx.is_directed_acyclic_graph(graph):
        issues.append("The diagram contains a loop. Remove a backward connection.")

    activities = [node["id"] for node in nodes if node.get("type") == "activity" and node.get("id") in graph]
    impacts = [node["id"] for node in nodes if node.get("type") == "impact" and node.get("id") in graph]
    if activities and impacts:
        for node in nodes:
            node_id = node.get("id")
            if node_id not in graph:
                continue
            from_activity = any(nx.has_path(graph, start, node_id) for start in activities)
            to_impact = any(nx.has_path(graph, node_id, end) for end in impacts)
            if not from_activity or not to_impact:
                issues.append(f"Node {node_id} is outside a complete activity-to-impact path. Connect or remove it.")

    return list(dict.fromkeys(issues))


def _short_label(value: Any, max_words: int = 16) -> str:
    words = " ".join(presentable_text(value).split()).split()
    readable = " ".join(words[:max_words]) + ("…" if len(words) > max_words else "")
    return html.escape(readable, quote=False).replace('"', "'")


def toc_mermaid(nodes: list[dict], edges: list[dict], language: str = "en") -> str:
    """Use the submitted graph. Safe internal IDs keep arbitrary user text in labels."""
    identifiers = {}
    for index, node in enumerate(nodes):
        identifiers.setdefault(node["id"], f"N{index + 1}")
    lines = [
        "flowchart LR",
        "classDef activity fill:#e0f2fe,stroke:#0284c7,color:#082f49,stroke-width:2px",
        "classDef output fill:#ccfbf1,stroke:#0d9488,color:#042f2e,stroke-width:2px",
        "classDef outcome fill:#ede9fe,stroke:#7c3aed,color:#2e1065,stroke-width:2px",
        "classDef impact fill:#fef3c7,stroke:#d97706,color:#451a03,stroke-width:2px",
    ]
    drawn = set()
    for node in nodes:
        node_id = node["id"]
        if node_id in drawn:
            continue
        drawn.add(node_id)
        internal = identifiers[node_id]
        level = node.get("type", "activity")
        hindi_levels = {"activity": "गतिविधि", "output": "आउटपुट", "outcome": "परिणाम", "impact": "प्रभाव"}
        name = hindi_levels.get(level, level.capitalize()) if language == "hi" else level.capitalize()
        label = _short_label(node.get("label", ""))
        lines.append(f'{internal}["{html.escape(node_id)} · {name}<br/>{label}"]')
        lines.append(f"class {internal} {level if level in LEVELS else 'activity'}")
    for edge in edges:
        source, target = identifiers.get(edge.get("source")), identifiers.get(edge.get("target"))
        if source and target:
            lines.append(f"{source} --> {target}")
    return "\n".join(lines)


def suggestion_cards(review: dict, node_ids: set[str]) -> list[dict]:
    values = review.get("suggestions", []) if isinstance(review, dict) else []
    if not isinstance(values, list):
        return []
    cards = []
    for index, value in enumerate(values[:5]):
        if isinstance(value, dict):
            title = _plain_short(value.get("title"), 6)
            action = _plain_short(value.get("action") or value.get("suggestion"), 27)
            related = value.get("related_node_ids", [])
        else:
            title = "Improve the pathway"
            action = _plain_short(value, 27)
            related = []
        if not action:
            continue
        if not isinstance(related, list):
            related = []
        cards.append({
            "title": title or f"Idea {index + 1}",
            "action": action,
            "related_node_ids": [item for item in related if isinstance(item, str) and item in node_ids][:3],
        })
    return cards


def _plain_short(value: Any, max_words: int) -> str:
    words = " ".join(presentable_text(value).split()).split()
    return " ".join(words[:max_words]).rstrip(",;:") + ("…" if len(words) > max_words else "")
