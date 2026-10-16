"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type {
  Organization,
  ProblemStatement,
  ProblemRefinement,
  ProblemTreeResponse,
  StudentOutcomeResponse,
  SmartValidation,
  TheoryOfChangeResponse,
} from "./api"

interface LFASnapshot {
  organization_profile?: {
    organization_id?: string
    theme?: string
    geography?: { state: string; district?: string }
    scale?: number
  }
  problem_definition?: {
    core_problem?: string
    affected_group?: string[]
    ai_review_status?: "accepted" | "discarded" | "pending"
  }
  problem_tree?: {
    root_causes?: string[]
    core_problem?: string
    effects?: string[]
  }
  outcomes?: {
    smart_outcomes?: string[]
    outcome_statement?: string
    baseline_value?: number
    target_value?: number
    timeline_months?: number
    milestones?: any[]
  }
  methodology?: {
    interventions?: string[]
    selected?: string[]
    custom_components?: string[]
  }
  theory_of_change?: {
    activities?: string[]
    outputs?: string[]
    outcomes?: string[]
    impact?: string[]
    nodes?: { id: string; type: string; label: string }[]
    edges?: { source: string; target: string }[]
    is_valid?: boolean
  }
  measurement?: {
    indicators?: string[]
    targets?: any[]
  }
  stakeholders?: string[]
  practice_changes?: Record<string, any>
  indicators?: Record<string, any>
  indicator_baselines?: any[]
}

interface ThemeDesign {
  lfaSnapshot: LFASnapshot
  problemStatements: ProblemStatement[]
  currentRefinement: ProblemRefinement | null
  problemTree: ProblemTreeResponse | null
  studentOutcomes: StudentOutcomeResponse[]
  theoryOfChange: TheoryOfChangeResponse | null
}

const organizationSection = (org: Organization, theme: string): LFASnapshot => ({
  organization_profile: {
    organization_id: org._id,
    theme,
    geography: org.geography,
    scale: org.reach_metrics?.schools,
  },
})

interface AppState {
  // Current organization
  currentOrganization: Organization | null
  setCurrentOrganization: (org: Organization | null) => void
  activeTheme: string | null
  setActiveTheme: (theme: string) => void
  designsByTheme: Record<string, ThemeDesign>

  // Problem statements
  problemStatements: ProblemStatement[]
  setProblemStatements: (statements: ProblemStatement[]) => void
  addProblemStatement: (statement: ProblemStatement) => void

  // Current refinement
  currentRefinement: ProblemRefinement | null
  setCurrentRefinement: (refinement: ProblemRefinement | null) => void

  // Problem tree
  problemTree: ProblemTreeResponse | null
  setProblemTree: (tree: ProblemTreeResponse | null) => void

  // Student outcomes
  studentOutcomes: StudentOutcomeResponse[]
  addStudentOutcome: (outcome: StudentOutcomeResponse) => void
  updateLatestOutcomeValidation: (validation: SmartValidation) => void

  // Theory of Change
  theoryOfChange: TheoryOfChangeResponse | null
  setTheoryOfChange: (toc: TheoryOfChangeResponse | null) => void

  // LFA Snapshot for completeness tracking
  lfaSnapshot: LFASnapshot
  updateLFASnapshot: (section: keyof LFASnapshot, data: any) => void

  // Reset all
  resetState: () => void
}

const initialState = {
  currentOrganization: null,
  activeTheme: null,
  designsByTheme: {},
  problemStatements: [],
  currentRefinement: null,
  problemTree: null,
  studentOutcomes: [],
  theoryOfChange: null,
  lfaSnapshot: {},
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      setCurrentOrganization: (org) => set((state) =>
        state.currentOrganization?._id === org?._id
          ? { currentOrganization: org }
          : { ...initialState, currentOrganization: org, activeTheme: org?.thematic_focus[0] || null, lfaSnapshot: org ? organizationSection(org, org.thematic_focus[0]) : {} },
      ),
      setActiveTheme: (theme) => set((state) => {
        const org = state.currentOrganization
        if (!org?.thematic_focus.includes(theme)) return state
        const previousTheme = state.activeTheme || org.thematic_focus[0]
        if (previousTheme === theme) return state
        const saved = state.designsByTheme[theme]
        return {
          designsByTheme: {
            ...state.designsByTheme,
            [previousTheme]: {
              lfaSnapshot: state.lfaSnapshot,
              problemStatements: state.problemStatements,
              currentRefinement: state.currentRefinement,
              problemTree: state.problemTree,
              studentOutcomes: state.studentOutcomes,
              theoryOfChange: state.theoryOfChange,
            },
          },
          activeTheme: theme,
          lfaSnapshot: saved?.lfaSnapshot || organizationSection(org, theme),
          problemStatements: saved?.problemStatements || [],
          currentRefinement: saved?.currentRefinement || null,
          problemTree: saved?.problemTree || null,
          studentOutcomes: saved?.studentOutcomes || [],
          theoryOfChange: saved?.theoryOfChange || null,
        }
      }),

      setProblemStatements: (statements) => set({ problemStatements: statements }),
      addProblemStatement: (statement) =>
        set((state) => ({ problemStatements: [...state.problemStatements, statement] })),

      setCurrentRefinement: (refinement) => set({ currentRefinement: refinement }),

      setProblemTree: (tree) => set({ problemTree: tree }),

      addStudentOutcome: (outcome) => set((state) => ({ studentOutcomes: [...state.studentOutcomes, outcome] })),
      updateLatestOutcomeValidation: (validation) => set((state) => ({
        studentOutcomes: state.studentOutcomes.map((outcome, index) =>
          index === state.studentOutcomes.length - 1 ? { ...outcome, smart_validation: validation } : outcome,
        ),
      })),

      setTheoryOfChange: (toc) => set({ theoryOfChange: toc }),

      updateLFASnapshot: (section, data) =>
        set((state) => ({
          lfaSnapshot: { ...state.lfaSnapshot, [section]: data },
        })),

      resetState: () => set(initialState),
    }),
    {
      name: "margdarshak-storage",
    },
  ),
)
