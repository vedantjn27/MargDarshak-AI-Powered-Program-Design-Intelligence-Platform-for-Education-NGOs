# MargDarshak feature reference

This describes the features in the current checkout. For a single story showing how they fit together, read [PROJECT_OVERVIEW_AND_WORKFLOW.md](PROJECT_OVERVIEW_AND_WORKFLOW.md). The fictional inputs in [MANUAL_TEST_INPUTS.md](MANUAL_TEST_INPUTS.md) help you try them.

## 1. Account and organization workspace

**What it does:** A user signs up or logs in, then registers one organization before reaching the dashboard. The profile records its thematic focus, location, scale, and other context. The dashboard can switch between that organization's selected themes.

**Why it matters:** The design should reflect the organization that owns it. FastAPI checks the session and organization ownership before serving protected data. Passwords are hashed; the browser receives an HTTP-only session cookie. The Next.js proxy forwards that cookie to FastAPI.

**Where:** `backend/auth_service.py`, `backend/main.py`, `frontend/app/auth/`, `frontend/components/dashboard-layout.tsx`, and `frontend/app/api/proxy/`.

## 2. Guided dashboard and program map

**What it does:** The dashboard groups work into five stages and shows progress and a visual program map. Each feature page explains its purpose and next step while retaining its own tabs.

**Why it matters:** A first-time program designer can see what has been entered and where the plan is incomplete. The active theme's snapshot is kept in Zustand browser state.

**Where:** `frontend/app/dashboard/page.tsx`, `frontend/components/workflow-guide.tsx`, `frontend/components/program-map.tsx`, and `frontend/lib/store.ts`.

## 3. Problem definition, refinement, and tree

**What it does:** Users describe a problem in detail, review a short AI gist, choose the wording to keep, and build a cause → problem → effect tree. The page also shows possible stakeholders and evidence to verify.

**Why it matters:** A precise problem and visible assumptions help a team investigate causes before choosing an intervention. Suggested evidence is a collection plan, not a claim that evidence already exists.

**Where:** `frontend/app/dashboard/problem/page.tsx`, `backend/main.py`, and `backend/presentation.py`.

## 4. Student outcomes and timeline

**What it does:** Users enter the student change they want. A rule-based SMART check looks for specificity, measurement, realistic framing, relevance, and time bounds. AI proposes a sequence of milestones and the frontend draws a larger visual timeline.

**Why it matters:** Teams can distinguish the intended student result from activities and decide when to assess progress. SMART feedback checks wording and data supplied; it cannot establish that a target is achievable in the field.

**Where:** `backend/smart_validation.py`, `frontend/app/dashboard/outcomes/page.tsx`, and `frontend/components/outcome-timeline.tsx`.

## 5. Methodology library

**What it does:** Users browse methods relevant to the organization's theme, read short full-screen explanations and example workflows, and save selections. The catalog can provide starter entries when the database library is empty.

**Why it matters:** The outcome says what should change; the method says how the team plans to act. Fit notes help compare methods against the organization's problem and capacity.

**Where:** `backend/methodology_catalog.py`, `frontend/app/dashboard/methodology/page.tsx`, and `frontend/components/methodology-detail-dialog.tsx`.

## 6. Stakeholders and practice changes

**What it does:** Users choose people involved in the program and record what they do now and what they should do differently. AI suggestions are shown as compact cards with an action to try.

**Why it matters:** Student change usually depends on repeated actions by teachers, caregivers, school leaders, or other actors. Suggested current practices must be verified locally.

**Where:** `backend/practice_suggestions.py`, `frontend/app/dashboard/stakeholders/page.tsx`, and `frontend/components/practice-suggestion-board.tsx`.

## 7. Theory of Change

**What it does:** Users define labeled activity, output, outcome, and impact nodes and connect them with causal arrows. Structural validation checks graph issues, and AI suggests improvements. The diagram is rendered with Mermaid in the browser.

**Why it matters:** A visible causal story makes gaps and assumptions easier to discuss. A structurally valid diagram is a coherent plan, not proof that the intervention will work.

**Where:** `backend/toc_logic.py`, `frontend/app/dashboard/theory-of-change/page.tsx`, and `frontend/components/toc-suggestion-board.tsx`.

## 8. Indicators, baselines, and targets

**What it does:** AI proposes one measurable indicator for each saved student outcome and desired stakeholder practice. The backend sends short IDs to the model, maps the results back to the original inputs, and retries omitted items. Users then enter a baseline, a real current value if available, a target, and dates. The frontend shows progress only from actual values.

**Why it matters:** Each intended change needs a measure. A blank current value remains unmeasured, and a target is a plan rather than an achieved result.

**Where:** `backend/indicator_generation.py`, `backend/main.py`, and `frontend/app/dashboard/indicators/page.tsx`.

## 9. Quality review and design coach

**What it does:** Completeness checks the entered design sections. Design feedback identifies issues with clarity, measurement, or logic and links to the relevant page. The AI coach proposes one next action grounded in saved work.

**Why it matters:** A plan with a polished diagram may still lack evidence, a baseline, or a link between activities and outcomes. Quality review helps find those gaps before sharing.

**Where:** `backend/main.py`, `frontend/app/dashboard/quality/page.tsx`, and `frontend/app/dashboard/page.tsx`.

## 10. Templates and catalog imagery

**What it does:** Users browse starter templates, read their full-screen detail, fork one under a useful name, and keep that copy in the organization's saved list. The template and methodology cards use thematic cover images.

**Why it matters:** A starter structure reduces blank-page effort but still requires the organization to replace example prompts and check its own facts.

**Where:** `backend/template_catalog.py`, `frontend/app/dashboard/templates/page.tsx`, `frontend/components/template-detail-dialog.tsx`, and `frontend/public/covers/`.

## 11. Export

**What it does:** The export page currently offers an LFA PDF, program PowerPoint, indicator spreadsheet, budget spreadsheet, and Theory of Change PNG. PDF and slides can include program diagrams and charts from the saved design.

**Why it matters:** Teams can review and present the same plan in formats suited to a meeting, analysis, or sharing. The files present readable content rather than raw JSON.

**Where:** `backend/export_service.py`, `backend/export_visuals.py`, `backend/assets/`, and `frontend/app/dashboard/export/page.tsx`.

## 12. English and Hindi

**What it does:** The interface has English and Hindi copy; the backend can translate JSON response values. Export labels and fonts also support Hindi.

**Why it matters:** Colleagues can inspect the design in the language they use most comfortably. Translation quality should still be checked before external publication.

**Where:** `frontend/components/language-provider.tsx`, `backend/main.py`, `backend/export_service.py`, and `backend/assets/`.

## How AI is used

`backend/ai_service.py` retrieves relevant saved and shared records, ranks them by embedding similarity, calls Mistral or Gemini, validates the expected response shape, and returns structured fields. This is retrieval-augmented generation (RAG) over application records; it is not live web research. The guided design coach and page tasks are task-specific agentic behavior with human review, rather than an autonomous multi-agent system.
