import type { ProblemRefinement, ProblemTreeResponse, StudentOutcomeResponse } from "./api"

// Older saved designs can contain Python dictionary strings from AI responses.
function parseStructured(value: string): unknown {
  const input = value.trim()
  if (!((input.startsWith("{") && input.endsWith("}")) || (input.startsWith("[") && input.endsWith("]")))) return value
  try { return JSON.parse(input) } catch { /* A previous backend stored Python repr. */ }

  let converted = ""
  for (let index = 0; index < input.length;) {
    const character = input[index]
    if (character === "'" || character === '"') {
      const quote = character
      let content = ""
      index++
      while (index < input.length) {
        if (input[index] === "\\" && index + 1 < input.length) {
          content += input[index + 1]
          index += 2
        } else if (input[index] === quote) {
          index++
          break
        } else {
          content += input[index++]
        }
      }
      converted += JSON.stringify(content)
    } else if (/[A-Za-z]/.test(character)) {
      let word = ""
      while (index < input.length && /[A-Za-z]/.test(input[index])) word += input[index++]
      converted += ({ True: "true", False: "false", None: "null" } as Record<string, string>)[word] || word
    } else {
      converted += character
      index++
    }
  }
  try { return JSON.parse(converted) } catch { return value }
}

const humanize = (value: unknown) => String(value).replace(/_/g, " ").replace(/^./, (letter) => letter.toUpperCase())

export function presentableText(value: unknown, language = "en"): string {
  if (value == null) return ""
  if (typeof value === "string") {
    const parsed = parseStructured(value)
    if (parsed !== value) return presentableText(parsed, language)
    return value.replace(/\*\*|__/g, "").trim()
  }
  if (Array.isArray(value)) return value.map((item) => presentableText(item, language)).filter(Boolean).join("; ")
  if (typeof value === "object") {
    const record = value as Record<string, unknown>
    const preferred = ["details", "description", "note", "text", "statement", "label", "cause", "effect", "suggestion", "action", "rationale", "name"]
    let primary = presentableText(preferred.map((key) => record[key]).find(Boolean), language)
    if (!primary) primary = Object.entries(record).map(([key, item]) => `${humanize(key)}: ${presentableText(item, language)}`).join("; ")
    if (record.data_type) primary = `${humanize(record.data_type)}: ${primary}`
    if (record.owner) primary += ` (${language === "hi" ? "सुझाया गया ज़िम्मेदार व्यक्ति" : "Suggested owner"}: ${humanize(record.owner).replace(/\b\w/g, (letter) => letter.toUpperCase())})`
    return primary
  }
  return String(value)
}

export function normalizeProblemRefinement(value: ProblemRefinement, language = "en"): ProblemRefinement {
  return {
    ...value,
    refined_problem_statement: presentableText(value.refined_problem_statement, language),
    identified_issues: (value.identified_issues || []).map((item) => ({ issue_type: presentableText(item.issue_type, language), description: presentableText(item.description, language) })),
    suggested_root_causes: (value.suggested_root_causes || []).map((item) => ({ cause: presentableText(item.cause, language), rationale: presentableText(item.rationale, language) })),
    suggested_stakeholders: (value.suggested_stakeholders || []).map((item) => presentableText(item, language)),
    evidence_suggestions: (value.evidence_suggestions || []).map((item) => presentableText(item, language)),
  }
}

function encodeBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_")
}

export function normalizeProblemTree(value: ProblemTreeResponse, language = "en"): ProblemTreeResponse {
  const causes = (value.problem_tree.causes || []).map((node) => ({ ...node, label: presentableText(node.label, language) }))
  const core_problem = { ...value.problem_tree.core_problem, label: presentableText(value.problem_tree.core_problem.label, language) }
  const effects = (value.problem_tree.effects || []).map((node) => ({ ...node, label: presentableText(node.label, language) }))
  const clean = (label: string) => {
    const readable = label.replace(/"/g, "'").replace(/\[/g, "(").replace(/\]/g, ")").replace(/\n/g, " ")
    return readable.length <= 100 ? readable : `${readable.slice(0, 97).replace(/\s+\S*$/, "")}…`
  }
  const diagram = [
    "graph LR",
    ...causes.map((node, index) => `C${index + 1}["${clean(node.label)}"] --> P1`),
    `P1["${clean(core_problem.label)}"]`,
    ...effects.map((node, index) => `P1 --> E${index + 1}["${clean(node.label)}"]`),
  ].join("\n")
  return {
    ...value,
    problem_tree: { causes, core_problem, effects },
    validation_feedback: (value.validation_feedback || []).map((item) => presentableText(item, language)),
    ai_suggestions: {
      ...value.ai_suggestions,
      district_challenges: (value.ai_suggestions?.district_challenges || []).map((item) => presentableText(item, language)),
    },
    mermaid_diagram: diagram,
    mermaid_preview_url: `https://mermaid.live/edit#${encodeBase64Url(JSON.stringify({ code: diagram, mermaid: { theme: "default" } }))}`,
    mermaid_png_url: `https://mermaid.ink/img/${encodeBase64Url(diagram)}?type=png`,
    mermaid_svg_url: `https://mermaid.ink/img/${encodeBase64Url(diagram)}?type=svg`,
  }
}

export function normalizeOutcomeTimeline(value: StudentOutcomeResponse, language = "en"): StudentOutcomeResponse {
  const milestones = (value.milestones || []).map((item) => ({
    ...item,
    title: presentableText(item.title, language),
    action: presentableText(item.action, language),
    measure: presentableText(item.measure, language),
  }))
  // Keep the original dates while replacing labels in diagrams saved by older versions.
  const diagram = value.outcome_timeline_diagram.replace(/^(\s*).*?(\s+:m(\d+),[^\n]*)$/gm, (line, indent, suffix, index) => {
    const title = milestones[Number(index)]?.title
    return title ? `${indent}${title.replace(/:/g, " ").replace(/\n/g, " ").slice(0, 65)}${suffix}` : line
  })
  const normalized = { ...value, milestones, outcome_explanation: presentableText(value.outcome_explanation, language), outcome_timeline_diagram: diagram }
  if (diagram === value.outcome_timeline_diagram) return normalized
  return {
    ...normalized,
    timeline_preview_url: `https://mermaid.live/edit#${encodeBase64Url(JSON.stringify({ code: diagram, mermaid: { theme: "default" } }))}`,
    timeline_png_url: `https://mermaid.ink/img/${encodeBase64Url(diagram)}?type=png`,
    timeline_svg_url: `https://mermaid.ink/img/${encodeBase64Url(diagram)}?type=svg`,
  }
}
