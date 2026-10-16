const API_BASE_URL = "/api/proxy"

interface ApiOptions {
  language?: string
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}, apiOptions: ApiOptions = {}): Promise<T> {
  const { language = "en" } = apiOptions
  const url = `${API_BASE_URL}${endpoint}${endpoint.includes("?") ? "&" : "?"}language=${encodeURIComponent(language)}`


  let response: Response

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

  } catch (networkError: any) {
    console.error("[v0] Network error:", networkError.message)
    throw new Error(`Network error: ${networkError.message}`)
  }

  const responseText = await response.text()

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`
    try {
      const errorData = JSON.parse(responseText)
      errorMessage = errorData.detail || errorData.error || errorMessage
    } catch {
      if (responseText) {
        errorMessage = responseText
      }
    }
    throw new Error(errorMessage)
  }

  if (!responseText) {
    return {} as T
  }

  try {
    return JSON.parse(responseText) as T
  } catch (parseError) {
    throw new Error("Invalid JSON response from server")
  }
}

export interface AuthSession {
  user: { id: string; email: string }
  organization: Organization | null
}

export const authApi = {
  signup: (email: string, password: string) =>
    fetchApi<AuthSession>("/auth/signup", { method: "POST", body: JSON.stringify({ email, password }) }),
  login: (email: string, password: string) =>
    fetchApi<AuthSession>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  me: () => fetchApi<AuthSession>("/auth/me"),
  logout: () => fetchApi<{ message: string }>("/auth/logout", { method: "POST" }),
}

// Organization APIs
export const organizationApi = {
  create: (data: OrganizationCreate, language?: string) =>
    fetchApi<Organization>("/organization/profile", { method: "POST", body: JSON.stringify(data) }, { language }),

  get: (orgId: string, language?: string) => fetchApi<Organization>(`/organization/profile/${orgId}`, {}, { language }),

  getAIContext: (orgId: string, language?: string) =>
    fetchApi<AIContextAnalysis>(`/organization/${orgId}/ai-context`, { method: "POST" }, { language }),
}

// Problem Statement APIs
export const problemApi = {
  create: (data: ProblemStatementCreate, language?: string) =>
    fetchApi<ProblemStatement>("/problem-statement", { method: "POST", body: JSON.stringify(data) }, { language }),

  getByOrg: (orgId: string, language?: string) =>
    fetchApi<ProblemStatement[]>(`/organization/${orgId}/problem-statements`, {}, { language }),

  refine: (problemId: string, language?: string) =>
    fetchApi<ProblemRefinement>(`/problem-statement/${problemId}/ai-refine`, { method: "POST" }, { language }),

  generateTree: (data: ProblemTreeRequest, language?: string) =>
    fetchApi<ProblemTreeResponse>("/problem-tree", { method: "POST", body: JSON.stringify(data) }, { language }),
}

// Student Outcomes APIs
export const outcomesApi = {
  create: (data: StudentOutcomeRequest, language?: string) =>
    fetchApi<StudentOutcomeResponse>("/student-outcomes", { method: "POST", body: JSON.stringify(data) }, { language }),
  validate: (data: SmartValidationRequest, language?: string) =>
    fetchApi<SmartValidation>("/student-outcomes/validate", { method: "POST", body: JSON.stringify(data) }, { language }),
}

// Methodology APIs
export const methodologyApi = {
  getAll: (orgId: string, theme: string, language?: string) => fetchApi<{ count: number; methodologies: any[] }>(`/methodologies?organization_id=${encodeURIComponent(orgId)}&theme=${encodeURIComponent(theme)}`, {}, { language }),
  getSaved: (orgId: string, theme: string, language?: string) => fetchApi<{ selected_methodology_ids: string[]; custom_components: string[] }>(`/organization/${orgId}/methodologies/saved?theme=${encodeURIComponent(theme)}`, {}, { language }),
  getDetail: (orgId: string, name: string, language?: string) => fetchApi<{ name: string; summary: string; implementation_steps: string[]; workflow: { title: string; example: string }[]; when_to_use: string; resources_needed: string[]; risks: string[]; success_measures: string[] }>(`/organization/${orgId}/methodologies/detail?name=${encodeURIComponent(name)}`, {}, { language }),

  filter: (data: MethodologyFilter, language?: string) =>
    fetchApi<MethodologyResponse>("/methodologies", { method: "POST", body: JSON.stringify(data) }, { language }),

  select: (data: SelectMethodologyRequest, language?: string) =>
    fetchApi<{ status: string }>("/methodologies/select", { method: "POST", body: JSON.stringify(data) }, { language }),
}

// Theory of Change APIs
export const tocApi = {
  build: (data: TheoryOfChangeRequest, language?: string) =>
    fetchApi<TheoryOfChangeResponse>("/theory-of-change", { method: "POST", body: JSON.stringify(data) }, { language }),
}

// Stakeholder APIs
export const stakeholderApi = {
  select: (data: StakeholderSelectRequest, language?: string) =>
    fetchApi<StakeholderSelectResponse>(
      "/stakeholders/select",
      { method: "POST", body: JSON.stringify(data) },
      { language },
    ),
  saveSelection: (orgId: string, theme: string, stakeholderIds: string[], language?: string) =>
    fetchApi<{ selected_stakeholders: string[] }>(`/organization/${orgId}/stakeholders`, {
      method: "PUT", body: JSON.stringify({ theme, stakeholder_ids: stakeholderIds }),
    }, { language }),
}

// Practice Change APIs
export const practiceApi = {
  define: (data: PracticeChangeRequest, language?: string) =>
    fetchApi<PracticeChangeResponse>("/practice-change", { method: "POST", body: JSON.stringify(data) }, { language }),
}

// Indicator APIs
export const indicatorApi = {
  autoGenerate: (data: IndicatorGenerationRequest, language?: string) =>
    fetchApi<IndicatorGenerationResponse>(
      "/indicators/auto-generate",
      { method: "POST", body: JSON.stringify(data) },
      { language },
    ),

  setBaseline: (data: BaselineTargetRequest, language?: string) =>
    fetchApi<BaselineTargetResponse>(
      "/indicators/baseline-target",
      { method: "POST", body: JSON.stringify(data) },
      { language },
    ),
}

// LFA APIs
export const lfaApi = {
  getCompleteness: (data: LFACompletenessRequest, language?: string) =>
    fetchApi<LFACompletenessResponse>(
      "/lfa/completeness-score",
      { method: "POST", body: JSON.stringify(data) },
      { language },
    ),

  getQualityFeedback: (data: DesignQualityRequest, language?: string) =>
    fetchApi<DesignQualityResponse>(
      "/lfa/design-quality-feedback",
      { method: "POST", body: JSON.stringify(data) },
      { language },
    ),

  getTemplates: (params?: TemplateFilterParams, language?: string, organizationId?: string) => {
    const queryParams = new URLSearchParams()
    if (params?.theme) queryParams.set("theme", params.theme)
    if (params?.system_level) queryParams.set("system_level", params.system_level)
    if (params?.geography_type) queryParams.set("geography_type", params.geography_type)
    if (organizationId) queryParams.set("organization_id", organizationId)
    const query = queryParams.toString() ? `?${queryParams.toString()}` : ""
    return fetchApi<TemplateListResponse>(`/lfa/templates${query}`, {}, { language })
  },
  getSavedTemplates: (orgId: string, theme: string, language?: string) => fetchApi<TemplateListResponse>(`/organization/${orgId}/templates/saved?theme=${encodeURIComponent(theme)}`, {}, { language }),
  getTemplateDetail: (orgId: string, templateId: string, language?: string) => fetchApi<{ name: string; theme?: string; system_level?: string; overview: string; best_for: string; sections: string[]; section_cards?: { title: string; description: string }[]; workflow?: { title: string; description: string }[]; adaptation_tips: string[] }>(`/organization/${orgId}/templates/detail?template_id=${encodeURIComponent(templateId)}`, {}, { language }),

  forkTemplate: (data: ForkTemplateRequest, language?: string) =>
    fetchApi<{ message: string; template_id: string }>(
      "/lfa/templates/fork",
      { method: "POST", body: JSON.stringify(data) },
      { language },
    ),

  saveTemplate: (data: LFATemplate, language?: string) =>
    fetchApi<{ message: string; template_id: string }>(
      "/lfa/templates/save",
      { method: "POST", body: JSON.stringify(data) },
      { language },
    ),

  shareTemplate: (templateId: string, language?: string) =>
    fetchApi<{ message: string }>(`/lfa/templates/share/${templateId}`, { method: "POST" }, { language }),

  rateTemplate: (data: TemplateRatingRequest, language?: string) =>
    fetchApi<{ message: string }>("/lfa/templates/rate", { method: "POST", body: JSON.stringify(data) }, { language }),
}

// Export APIs
export const exportApi = {
  export: async (data: ExportRequest, language?: string) => {
    const url = `${API_BASE_URL}/export?language=${language || "en"}`

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || "Export failed")
    }

    const contentType = response.headers.get("content-type") || ""
    const blob = await response.blob()

    return new Blob([blob], { type: contentType })
  },
}

// Health Check
export const healthApi = {
  check: (language?: string) =>
    fetchApi<{ status: string; service: string; timestamp: string }>("/health", {}, { language }),
}

export const coachApi = {
  review: (orgId: string, lfaSnapshot: Record<string, any>, language?: string) =>
    fetchApi<{ section: string; headline: string; advice: string; next_action: string; evidence_note: string }>(
      `/organization/${orgId}/design-coach`,
      { method: "POST", body: JSON.stringify({ organization_id: orgId, lfa_snapshot: lfaSnapshot }) },
      { language },
    ),
}

// Types
export interface Organization {
  _id: string
  organization_name: string
  geography: { state: string; district?: string; block?: string }
  thematic_focus: string[]
  maturity_level: string
  reach_metrics?: { schools?: number; students?: number; teachers?: number }
  team_size: number
  team_expertise?: { role: string; count: number }[]
  created_at: string
  updated_at: string
}

export interface OrganizationCreate {
  organization_name: string
  geography: { state: string; district?: string; block?: string }
  thematic_focus: string[]
  maturity_level: string
  reach_metrics?: { schools?: number; students?: number; teachers?: number }
  team_size: number
  team_expertise?: { role: string; count: number }[]
}

export interface AIContextAnalysis {
  organization_id: string
  lfa_recommendation: { template_key: string; rationale: string }
  similar_program_patterns: { pattern_name: string; relevance_reason: string }[]
  potential_challenges: { challenge: string; reason: string }[]
  generated_at: string
}

export interface ProblemStatement {
  _id: string
  organization_id: string
  theme?: string
  core_problem: string
  affected_stakeholders: string[]
  evidence?: { source?: string; description: string; year?: number }[]
  created_at: string
  updated_at: string
}

export interface ProblemStatementCreate {
  organization_id: string
  theme: string
  core_problem: string
  affected_stakeholders: string[]
  evidence?: { source?: string; description: string; year?: number }[]
}

export interface ProblemRefinement {
  problem_statement_id: string
  clarity_score: number
  identified_issues: { issue_type: string; description: string }[]
  refined_problem_statement: string
  suggested_root_causes: { cause: string; rationale: string }[]
  suggested_stakeholders: string[]
  evidence_suggestions: string[]
  generated_at: string
}

export interface ProblemTreeRequest {
  organization_id: string
  state: string
  district: string
  theme: string
  refined_problem_statement: string
  suggested_root_causes: { cause: string; rationale: string }[]
}

export interface ProblemTreeResponse {
  problem_tree: {
    causes: { id: string; label: string }[]
    core_problem: { id: string; label: string }
    effects: { id: string; label: string }[]
  }
  mermaid_diagram: string
  mermaid_preview_url: string
  mermaid_png_url: string
  mermaid_svg_url: string
  validation_feedback: string[]
  ai_suggestions: {
    similar_program_pattern: any
    district_challenges: string[]
  }
}

export interface StudentOutcomeRequest {
  organization_id: string
  theme: string
  state: string
  grade_range: string
  outcome_statement: string
  baseline_value: number
  target_value: number
  timeline_months: number
}

export interface StudentOutcomeResponse {
  smart_validation: SmartValidation
  aligned_competencies: string[]
  policy_references: string[]
  outcome_timeline_diagram: string
  timeline_preview_url: string
  timeline_png_url: string
  timeline_svg_url: string
  outcome_explanation: string
  milestones: { month: number; title: string; action: string; measure: string }[]
  outcome_statement?: string
  baseline?: number
  target?: number
  timeline_months?: number
}

export interface SmartValidationRequest {
  organization_id: string
  theme: string
  outcome_statement: string
  baseline_value: number
  target_value: number
  timeline_months: number
}

export interface SmartValidation {
  smart_score: number
  issues: string[]
  is_valid: boolean
  criteria?: { key: string; passed: boolean; reason: string }[]
  note?: string
}

export interface MethodologyFilter {
  organization_id: string
  theme: string
  state: string
  scale_schools: number
  budget_lakhs: number
}

export interface MethodologyResponse {
  methodologies: {
    name: string
    catalog_name?: string
    description: string
    components: string[]
    geographies: string[]
    budget_range_lakhs: [number, number]
    available_components: { component: string; used_in: string[] }[]
  }[]
  alternatives?: {
    name: string
    catalog_name?: string
    description: string
    components: string[]
    geographies: string[]
    budget_range_lakhs: [number, number]
    filter_note: string
  }[]
}

export interface SelectMethodologyRequest {
  organization_id: string
  theme: string
  selected_methodology_ids: string[]
  custom_components: string[]
}

export interface TheoryOfChangeRequest {
  organization_id: string
  theme: string
  nodes: { id: string; type: string; label: string }[]
  edges: { source: string; target: string }[]
}

export interface TheoryOfChangeResponse {
  is_valid: boolean
  logic_issues: string[]
  ai_suggestions: string[]
  suggestion_cards?: { title: string; action: string; related_node_ids: string[] }[]
  ai_unavailable?: boolean
  mermaid_diagram: string
  mermaid_preview_url: string
  mermaid_png_url: string
  mermaid_svg_url: string
}

export interface StakeholderSelectRequest {
  organization_id: string
  theme: string
}

export interface StakeholderSelectResponse {
  available_stakeholders: { stakeholder_id: string; name: string; themes: string[] }[]
  recommended_stakeholders: string[]
  selected_stakeholders: string[]
}

export interface PracticeChangeRequest {
  organization_id: string
  theme: string
  stakeholder_id: string
  current_practices: string[]
  desired_practices: string[]
}

export interface PracticeChangeResponse {
  ai_suggestions: {
    key_idea?: string
    current_cards?: { title: string; summary: string }[]
    desired_cards?: { title: string; summary: string }[]
    first_step?: string
    suggested_current: string[]
    suggested_desired: string[]
  }
  validation_feedback: string[]
}

export interface IndicatorGenerationRequest {
  organization_id: string
  theme: string
  student_outcomes: string[]
  practice_changes: { stakeholder_id: string; desired_practices: string[] }[]
}

export interface IndicatorGenerationResponse {
  outcome_indicators: Record<string, string>
  practice_indicators: Record<string, Record<string, string>>
}

export interface BaselineTargetRequest {
  organization_id: string
  indicators: {
    indicator_name: string
    baseline_value: number
    current_value?: number | null
    target_value: number
    start_date: string
    end_date: string
  }[]
}

export interface BaselineTargetResponse {
  validations: {
    indicator_name: string
    status: string
    warnings: string[]
  }[]
}

export interface LFACompletenessRequest {
  organization_id: string
  lfa_snapshot: Record<string, any>
}

export interface LFACompletenessResponse {
  completion_percentage: number
  section_breakdown: {
    section: string
    status: string
    score: number
    weight: number
    missing_fields?: string[]
  }[]
  missing_sections: string[]
}

export interface DesignQualityRequest {
  organization_id: string
  lfa_snapshot: Record<string, any>
}

export interface DesignQualityResponse {
  quality_score: number
  feedback_items: {
    area: string
    issue: string
    suggestion: string
    problems?: string[]
    problem?: string
  }[]
}

export interface TemplateFilterParams {
  theme?: string
  system_level?: string
  geography_type?: string
}

export interface TemplateListResponse {
  count: number
  templates: LFATemplate[]
}

export interface LFATemplate {
  template_id: string
  name: string
  theme: string
  system_level: string
  geography_type: string
  applicable_states?: string[]
  description: string
  lfa_structure: Record<string, any>
  created_by: string
  is_public: boolean
  created_at: string
}

export interface ForkTemplateRequest {
  organization_id: string
  template_id: string
  new_name: string
}

export interface TemplateRatingRequest {
  template_id: string
  organization_id: string
  rating: number
}

export interface ExportRequest {
  organization_id: string
  export_type: "LFA_PDF" | "TOC_IMAGE" | "INDICATOR_EXCEL" | "BUDGET_EXCEL" | "PRESENTATION_PPT"
  lfa_snapshot: Record<string, any>
}
