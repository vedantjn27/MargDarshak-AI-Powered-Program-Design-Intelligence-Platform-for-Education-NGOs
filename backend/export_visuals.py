"""Draw program-specific diagrams for PDF and PowerPoint without remote services."""

from io import BytesIO
from pathlib import Path

import matplotlib
from PIL import Image, ImageDraw, ImageFont

from presentation import presentable_text


NAVY = "#081a29"
PANEL = "#102b3c"
TEAL = "#17b7a4"
GOLD = "#f4ba5b"
CORAL = "#f17d68"
VIOLET = "#ad9af7"
WHITE = "#f7fbfc"
MUTED = "#bed0d9"


def _font(size: int, language: str = "en", bold: bool = False):
    if language == "hi":
        path = Path(__file__).parent / "assets" / "NotoSansDevanagari.ttf"
        return ImageFont.truetype(str(path), size, layout_engine=ImageFont.Layout.RAQM)
    filename = "DejaVuSans-Bold.ttf" if bold else "DejaVuSans.ttf"
    path = Path(matplotlib.get_data_path()) / "fonts" / "ttf" / filename
    return ImageFont.truetype(str(path), size)


def _canvas(height=820):
    image = Image.new("RGB", (1600, height), NAVY)
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((32, 28, 1568, height - 28), radius=32, outline="#315064", width=2)
    return image, draw


def _text(draw, value, x, y, width, *, size=26, color=WHITE, lines=3, language="en", bold=False,
          max_height=None, min_size=15):
    content = presentable_text(value).strip()
    if not content:
        return y
    def wrap(font):
        rows, row = [], ""
        for word in content.split():
            if draw.textlength(word, font=font) > width:
                if row:
                    rows.append(row)
                    row = ""
                piece = ""
                for character in word:
                    if piece and draw.textlength(piece + character, font=font) > width:
                        rows.append(piece)
                        piece = character
                    else:
                        piece += character
                row = piece
                continue
            candidate = f"{row} {word}".strip()
            if row and draw.textlength(candidate, font=font) > width:
                rows.append(row)
                row = word
            else:
                row = candidate
        if row:
            rows.append(row)
        return rows

    chosen = size
    for candidate_size in range(size, min(size, min_size) - 1, -1):
        candidate_font = _font(candidate_size, language, bold)
        candidate_rows = wrap(candidate_font)
        line_height = int(candidate_size * 1.38)
        height_limit = max(1, int(max_height // line_height)) if max_height is not None else lines
        if len(candidate_rows) <= min(lines, height_limit):
            chosen = candidate_size
            break
        chosen = candidate_size
    font = _font(chosen, language, bold)
    line_height = int(chosen * 1.38)
    height_limit = max(1, int(max_height // line_height)) if max_height is not None else lines
    rows = wrap(font)
    visible_rows = min(lines, height_limit)
    if len(rows) > visible_rows:
        rows = rows[:visible_rows]
        while rows[-1] and draw.textlength(rows[-1] + "…", font=font) > width:
            rows[-1] = rows[-1][:-1]
        rows[-1] += "…"
    for row in rows:
        draw.text((x, y), row, font=font, fill=color)
        y += line_height
    return y


def _heading(draw, english, hindi, language):
    _text(draw, hindi if language == "hi" else english, 70, 70, 1450, size=42, bold=True, language=language)
    draw.rounded_rectangle((70, 142, 300, 151), radius=4, fill=TEAL)


def _card(draw, box, title, body, accent, language, *, small=False):
    x1, y1, x2, y2 = box
    draw.rounded_rectangle(box, radius=24, fill=PANEL, outline="#315064", width=2)
    draw.rounded_rectangle((x1, y1, x1 + 9, y2), radius=4, fill=accent)
    body_top = y1 + (52 if small else 62)
    body_height = max(18, y2 - body_top - 12)
    _text(draw, title, x1 + 26, y1 + 16, x2 - x1 - 52, size=23 if small else 27,
          color=accent, lines=1, language=language, bold=True, max_height=32, min_size=16)
    _text(draw, body, x1 + 26, body_top, x2 - x1 - 52, size=21 if small else 23,
          color=WHITE, lines=max(1, body_height // 18), language=language,
          max_height=body_height, min_size=15)


def _arrow(draw, start, end, color=TEAL):
    draw.line((start, end), fill=color, width=6)
    x, y = end
    draw.polygon([(x, y), (x - 18, y - 10), (x - 18, y + 10)], fill=color)


def _png(image):
    buffer = BytesIO()
    image.save(buffer, format="PNG", optimize=True)
    return buffer.getvalue()


def problem_tree(snapshot, language="en"):
    tree = snapshot.get("problem_tree") or {}
    core = presentable_text(tree.get("core_problem"))
    causes = [presentable_text(item) for item in tree.get("root_causes", []) if presentable_text(item)]
    effects = [presentable_text(item) for item in tree.get("effects", []) if presentable_text(item)]
    if not core and not causes and not effects:
        return None
    count = max(1, len(causes), len(effects))
    height = max(580, 270 + count * 145)
    image, draw = _canvas(height)
    _heading(draw, "Problem tree", "समस्या वृक्ष", language)
    labels = ("Root causes", "Core problem", "Effects") if language == "en" else ("मूल कारण", "मुख्य समस्या", "प्रभाव")
    for label, x in zip(labels, (70, 600, 1130)):
        _text(draw, label, x, 172, 380, size=26, color=MUTED, bold=True, language=language)
    core_y = 245 + ((count - 1) * 145) // 2
    cause_boxes = [(70, 235 + index * 145, 465, 345 + index * 145) for index in range(len(causes))]
    effect_boxes = [(1130, 235 + index * 145, 1525, 345 + index * 145) for index in range(len(effects))]
    for box in cause_boxes:
        _arrow(draw, (box[2], (box[1] + box[3]) // 2), (595, core_y + 58), TEAL)
    for box in effect_boxes:
        _arrow(draw, (1005, core_y + 58), (box[0], (box[1] + box[3]) // 2), GOLD)
    for index, (box, item) in enumerate(zip(cause_boxes, causes), 1):
        _card(draw, box, f"{index:02d}", item, TEAL, language, small=True)
    _card(draw, (595, core_y, 1005, core_y + 116), labels[1], core or "—", CORAL, language, small=True)
    for index, (box, item) in enumerate(zip(effect_boxes, effects), 1):
        _card(draw, box, f"{index:02d}", item, GOLD, language, small=True)
    return _png(image)


def theory_of_change(snapshot, language="en"):
    toc = snapshot.get("theory_of_change") or {}
    nodes = toc.get("nodes") or []
    edges = list(toc.get("edges") or [])
    if not nodes:
        nodes = []
        for kind, prefix in (("activity", "A"), ("output", "O"), ("outcome", "OC"), ("impact", "I")):
            for index, label in enumerate(toc.get(kind + "s" if kind != "impact" else "impact", []), 1):
                nodes.append({"id": f"{prefix}{index}", "type": kind, "label": label})
        for left, right in (("activity", "output"), ("output", "outcome"), ("outcome", "impact")):
            edges += [{"source": a["id"], "target": b["id"]} for a in nodes if a["type"] == left for b in nodes if b["type"] == right]
    if not nodes:
        return None
    levels = ("activity", "output", "outcome", "impact")
    names = ("Activities", "Outputs", "Outcomes", "Impact") if language == "en" else ("गतिविधियाँ", "आउटपुट", "परिणाम", "प्रभाव")
    grouped = {level: [node for node in nodes if node.get("type") == level] for level in levels}
    height = max(590, 270 + 155 * max(len(items) for items in grouped.values()))
    image, draw = _canvas(height)
    _heading(draw, "Theory of Change", "परिवर्तन का सिद्धांत", language)
    x_positions = (70, 455, 840, 1225)
    colors = (TEAL, GOLD, VIOLET, CORAL)
    boxes = {}
    for x, level, items, name in zip(x_positions, levels, grouped.values(), names):
        _text(draw, name, x, 171, 315, size=25, color=MUTED, bold=True, language=language)
        for index, node in enumerate(items):
            box = (x, 220 + index * 155, x + 305, 350 + index * 155)
            boxes[str(node.get("id"))] = box
    for edge in edges:
        left = boxes.get(str(edge.get("source")))
        right = boxes.get(str(edge.get("target")))
        if left and right:
            _arrow(draw, (left[2], (left[1] + left[3]) // 2), (right[0], (right[1] + right[3]) // 2), "#628fa0")
    for level, items, color in zip(levels, grouped.values(), colors):
        for node in items:
            box = boxes.get(str(node.get("id")))
            if box:
                _card(draw, box, str(node.get("id", "")), node.get("label", ""), color, language, small=True)
    return _png(image)


def outcome_timeline(snapshot, language="en"):
    outcomes = snapshot.get("outcomes") or {}
    milestones = [item for item in outcomes.get("milestones", []) if isinstance(item, dict)]
    if not milestones:
        return None
    height = max(600, 270 + len(milestones) * 126)
    image, draw = _canvas(height)
    _heading(draw, "Outcome timeline", "परिणाम समयरेखा", language)
    draw.line((137, 218, 137, height - 95), fill=TEAL, width=7)
    for index, item in enumerate(milestones):
        y = 205 + index * 126
        draw.ellipse((119, y + 38, 155, y + 74), fill=GOLD)
        month = item.get("month", index + 1)
        label = f"Month {month}" if language == "en" else f"महीना {month}"
        body = " — ".join(filter(None, [presentable_text(item.get("action")), presentable_text(item.get("measure"))]))
        _card(draw, (210, y, 1525, y + 112), label + " · " + presentable_text(item.get("title")), body, GOLD, language, small=True)
    return _png(image)


def outcome_ambition(snapshot, language="en"):
    outcome = snapshot.get("outcomes") or {}
    baseline, target = outcome.get("baseline_value"), outcome.get("target_value")
    try:
        baseline, target = float(baseline), float(target)
    except (TypeError, ValueError):
        return None
    image, draw = _canvas(565)
    _heading(draw, "Outcome ambition", "परिणाम लक्ष्य", language)
    label = outcome.get("outcome_statement") or (outcome.get("smart_outcomes") or [""])[0]
    _text(draw, label, 80, 190, 1440, size=28, color=WHITE, lines=2, language=language, bold=True)
    base_title = "Baseline" if language == "en" else "आधार रेखा"
    target_title = "Target" if language == "en" else "लक्ष्य"
    _card(draw, (95, 320, 650, 475), base_title, f"{baseline:g}", VIOLET, language)
    _arrow(draw, (700, 398), (900, 398), TEAL)
    _card(draw, (950, 320, 1505, 475), target_title, f"{target:g}", GOLD, language)
    return _png(image)


def delivery_map(snapshot, language="en"):
    methods = (snapshot.get("methodology") or {}).get("selected") or []
    people = snapshot.get("stakeholders") or []
    outcome = (snapshot.get("outcomes") or {}).get("outcome_statement")
    if not methods and not people:
        return None
    image, draw = _canvas(620)
    _heading(draw, "Delivery at a glance", "कार्यक्रम एक नज़र में", language)
    titles = ("Methods", "People involved", "Intended outcome") if language == "en" else ("कार्यपद्धतियाँ", "जुड़े हुए लोग", "अपेक्षित परिणाम")
    _card(draw, (70, 220, 550, 515), titles[0], presentable_text(methods) or "—", TEAL, language)
    _card(draw, (560, 220, 1040, 515), titles[1], presentable_text(people) or "—", VIOLET, language)
    _card(draw, (1050, 220, 1530, 515), titles[2], outcome or "—", GOLD, language)
    return _png(image)


def indicator_chart(snapshot, language="en"):
    rows = [item for item in snapshot.get("indicator_baselines", []) if isinstance(item, dict)]
    if not rows:
        return None
    height = max(550, 210 + len(rows) * 116)
    image, draw = _canvas(height)
    _heading(draw, "Indicators and targets", "संकेतक और लक्ष्य", language)
    x_start, x_end = 570, 1480
    for index, item in enumerate(rows):
        y = 210 + index * 116
        name = presentable_text(item.get("indicator_name", f"Indicator {index + 1}"))
        _text(draw, name, 75, y + 4, 465, size=22, language=language, lines=2, bold=True)
        def number(value):
            try:
                return float(value) if value is not None and value != "" else None
            except (ValueError, TypeError):
                return None
        baseline, current, target = [number(item.get(key)) for key in ("baseline_value", "current_value", "target_value")]
        maximum = max(1.0, *(abs(value) for value in (baseline, current, target) if value is not None))
        for offset, value, color, label in ((0, baseline, VIOLET, "Base"), (30, current, TEAL, "Now"), (60, target, GOLD, "Target")):
            draw.rounded_rectangle((x_start, y + offset, x_end, y + offset + 18), radius=8, fill="#264454")
            if value is not None:
                width = max(5, int((x_end - x_start) * max(0, value) / maximum))
                draw.rounded_rectangle((x_start, y + offset, x_start + width, y + offset + 18), radius=8, fill=color)
            note = f"{label} {value:g}" if value is not None else f"{label} —"
            _text(draw, note, x_start + 8, y + offset - 3, 380, size=16, color=WHITE, lines=1)
    return _png(image)


def practice_change(snapshot, language="en"):
    practices = snapshot.get("practice_changes") or {}
    if not isinstance(practices, dict) or not practices:
        return None
    items = [(name, values) for name, values in practices.items() if isinstance(values, dict)]
    if not items:
        return None
    height = max(610, 245 + len(items) * 175)
    image, draw = _canvas(height)
    _heading(draw, "Practice changes", "अभ्यास में बदलाव", language)
    for index, (name, values) in enumerate(items):
        y = 198 + index * 175
        current = values.get("current") or values.get("current_practices") or []
        desired = values.get("desired") or values.get("desired_practices") or []
        _text(draw, name.replace("_", " "), 72, y, 1450, size=22, color=GOLD, lines=1, bold=True, language=language)
        _arrow(draw, (755, y + 95), (835, y + 95))
        _card(draw, (70, y + 35, 750, y + 155), "Current" if language == "en" else "अभी", presentable_text(current), CORAL, language, small=True)
        _card(draw, (835, y + 35, 1525, y + 155), "Desired" if language == "en" else "लक्ष्य", presentable_text(desired), TEAL, language, small=True)
    return _png(image)


def available_visuals(snapshot, language="en"):
    candidates = (
        ("Problem tree" if language == "en" else "समस्या वृक्ष", problem_tree),
        ("Outcome ambition" if language == "en" else "परिणाम लक्ष्य", outcome_ambition),
        ("Outcome timeline" if language == "en" else "परिणाम समयरेखा", outcome_timeline),
        ("Delivery map" if language == "en" else "कार्यक्रम मानचित्र", delivery_map),
        ("Theory of Change" if language == "en" else "परिवर्तन का सिद्धांत", theory_of_change),
        ("Practice changes" if language == "en" else "अभ्यास में बदलाव", practice_change),
        ("Indicator chart" if language == "en" else "संकेतक चार्ट", indicator_chart),
    )
    return [(title, figure) for title, render in candidates if (figure := render(snapshot, language))]


def visual_notes(snapshot, title, language="en"):
    """Short, readable facts to accompany diagram pages in the PDF."""
    if title in {"Problem tree", "समस्या वृक्ष"}:
        tree = snapshot.get("problem_tree") or {}
        return [presentable_text(tree.get("core_problem")), *[presentable_text(item) for item in (tree.get("root_causes") or [])[:2]]]
    if title in {"Outcome ambition", "परिणाम लक्ष्य"}:
        outcome = snapshot.get("outcomes") or {}
        return [presentable_text(outcome.get("outcome_statement")),
                f"{outcome.get('baseline_value')} → {outcome.get('target_value')}" if outcome.get("baseline_value") is not None and outcome.get("target_value") is not None else ""]
    if title in {"Outcome timeline", "परिणाम समयरेखा"}:
        return [f"M{item.get('month', '?')} · {presentable_text(item.get('title'))}: {presentable_text(item.get('action'))}"
                for item in ((snapshot.get("outcomes") or {}).get("milestones") or [])[:3] if isinstance(item, dict)]
    if title in {"Delivery map", "कार्यक्रम मानचित्र"}:
        return [presentable_text(item) for item in ((snapshot.get("methodology") or {}).get("selected") or [])[:2]] + [presentable_text(item) for item in (snapshot.get("stakeholders") or [])[:1]]
    if title in {"Theory of Change", "परिवर्तन का सिद्धांत"}:
        return [f"{item.get('id', '')} · {presentable_text(item.get('label'))}" for item in ((snapshot.get("theory_of_change") or {}).get("nodes") or [])[:3]]
    if title in {"Practice changes", "अभ्यास में बदलाव"}:
        return [f"{name.replace('_', ' ')}: {presentable_text(values.get('desired') or values.get('desired_practices'))}"
                for name, values in list((snapshot.get("practice_changes") or {}).items())[:3] if isinstance(values, dict)]
    if title in {"Indicator chart", "संकेतक चार्ट"}:
        return [f"{presentable_text(item.get('indicator_name'))}: {item.get('baseline_value')} / {item.get('current_value') if item.get('current_value') is not None else '—'} / {item.get('target_value')}"
                for item in (snapshot.get("indicator_baselines") or [])[:3] if isinstance(item, dict)]
    return []
