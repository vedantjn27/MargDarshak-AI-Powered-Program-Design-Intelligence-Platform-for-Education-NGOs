# Manual test inputs for MargDarshak

Use this guide to test the website from registration through export. All organizations, measurements, and evidence below are **fictional test data**. AI wording can vary; check relevance and presentation rather than exact sentences.

## Before you start

1. Start MongoDB and the backend from `backend` with `.\.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8000` on Windows, or `./.venv/bin/python -m uvicorn main:app --reload --port 8000` on macOS/Linux.
2. Start the frontend from `frontend` with `npm run dev`. Open the local URL shown by Next.js, normally `http://localhost:3000`.
3. Check that `backend/.env` contains your database connection and at least one working AI key. Keep keys out of screenshots, exports, and Git commits. Restart the backend after changing `.env`.
   The frontend proxy defaults to `http://localhost:8000`. If your backend uses another address, set `NEXT_PUBLIC_API_URL` in private `frontend/.env.local` and restart the frontend.
4. Use a fresh browser profile for the first account. Open `/auth` to create an account before registering an organization.

## Authentication and organization isolation

1. Open `/dashboard` in a private window. You should be sent to `/auth`, with no dashboard content visible.
2. Create a test account such as `aravali-test@example.org` with a password of at least eight characters. You should arrive at organization registration.
3. Register the organization in test case A. Sign out from the sidebar, then log in with the same account. Its saved organization profile should return without another registration step.
4. Create a second account in a separate private window. It should start with an empty organization registration page and must not see the first account's data.
5. After the second account registers its own organization, try requesting the first organization's ID through a dashboard URL or API request. The server should return 403.

## New guided workflow checks

- On the workspace, use the five stage cards to reach every existing feature. The program map should fill with saved problem, causes, outcome, methods, practices, and indicators for the current organization and theme.
- Each feature page has a guide with its purpose, immediate task, previous page, and next page. Existing feature tabs remain available within those pages.
- On Problem Definition, compare the original text with the editable AI summary. Choose **Accept edited summary** or **Keep original** before generating the tree. Check that the chosen version appears in the program map.
- On Student Outcomes, inspect the horizontally scrollable action timeline as well as the existing diagram.
- On Indicators, leave **Current measured value** blank once and check that the visualization says **Not measured yet**. After entering a measurement, check the baseline, latest value, target, and full indicator name in the measurement cards.
- On Quality Check, use the top suggested fixes to open the relevant feature page. Repeat this check in Hindi to confirm the links still work.

## Test case A: foundational literacy in Rajasthan

Follow these sections in order. The same fictional program is carried into each feature.

### 1. Registration and dashboard

After signing up, try opening `/dashboard` directly. You should be sent to organization registration. Then enter:

| Registration field | Example input |
| --- | --- |
| Organization name | Aravali Learning Collective Test |
| Maturity level | Growth (2–5 years) |
| Team size | 12 |
| Team expertise | Program Manager: 1; Field Coordinator: 3; Teacher Trainer: 4; Data Analyst: 1 |
| State | Rajasthan |
| District | Udaipur |
| Block | Gogunda |
| Thematic focus | Foundational Literacy & Numeracy (FLN) |
| Schools / students / teachers | 25 / 1,200 / 40 |

Submit the form. The dashboard should show this organization's name and its active FLN theme. Its counts and quality/completeness summary should reflect work actually saved for this organization. Check the AI context or design coach after enough sections have been filled; suggestions should mention the chosen geography, age group, and literacy goal when relevant.

### 2. Problem definition and problem tree

On **Problem Definition**, paste this into the core problem field:

> In the 25 schools supported by Aravali Learning Collective Test in Gogunda block, many Grade 3 children can recognize letters but struggle to read short Hindi paragraphs and explain their meaning. Teachers report that mixed reading levels in one classroom make it difficult to plan appropriate practice for every child. Some children have few age-appropriate texts at home and little opportunity to read with an adult. We need to identify which barriers are most important before choosing an intervention. The figures in this walkthrough are fictional and must be verified with an actual baseline before program use.

- **Affected stakeholders:** Students, Teachers, Parents, School Leaders.
- **Evidence source:** `Internal reading assessment — fictional test data`.
- **Evidence description:** `Illustrative baseline: 35% of 120 sampled Grade 3 children read a short Hindi paragraph with comprehension. Replace with verified assessment results for real use.`

Submit, then open the refinement and problem tree steps. The refined gist should be shorter and specific to Grade 3 Hindi reading in Gogunda. Suggested stakeholders and evidence should be relevant to literacy and marked as suggestions where unverified. The tree should connect plausible causes, such as mixed reading levels and limited reading practice, to the reading problem and its effects. It should render as a diagram rather than a raw JSON response.

### 3. Student outcomes and timeline

On **Student Outcomes**, enter:

| Field | Example input |
| --- | --- |
| Grade range | Grades 3–5 |
| Outcome statement | Within 18 months, increase the share of participating Grade 3 students in Gogunda who can read and explain a grade-appropriate Hindi paragraph from a fictional test baseline of 35% to 70%, using the same assessment rubric at baseline and endline. |
| Baseline | 35% |
| Target | 70% |
| Timeline | 18 months |

Create the outcome. Check that validation discusses the specific measure, target, and time frame. The timeline should contain actionable stages, such as baseline assessment, teacher preparation, classroom practice, review, and endline assessment. The milestone values and narrative should support the 35% to 70% plan rather than claiming the target has already been achieved.

### 4. Methodology library

On **Methodology**, use the prefilled organization theme and state, or enter:

| Filter | Example input |
| --- | --- |
| Theme | `fln` |
| State | Rajasthan |
| Number of schools | 25 |
| Budget | 15 lakhs |

Select **Find Methodologies**. Open **Explore full method** on a relevant result and read its detailed explanation before choosing it. Select one or two approaches suitable for Grade 3 reading, add the optional custom component `Weekly small-group Hindi reading practice`, and save. Check the **Saved** tab; the selected names and component should remain available. The fit explanation should connect to this organization's focus and scale.

### 5. Theory of Change

On **Theory of Change**, enter at least one item at each level:

| Level | Example input |
| --- | --- |
| Activity | Train 40 teachers to group Grade 3 students by reading level and run three short Hindi reading sessions each week. |
| Output | Teachers deliver three differentiated reading sessions per week in 25 schools and record student participation. |
| Outcome | By month 18, 70% of participating Grade 3 students read and explain a grade-appropriate Hindi paragraph. |
| Impact | More children enter upper primary grades able to learn independently from written material. |

Keep the default activity → output → outcome → impact links, then validate. The preview should label the nodes **A1**, **O1**, **OC1**, and **I1** next to their descriptions. AI suggestions should refer to this reading program and existing node IDs; proposed new steps only appear in the diagram after you add them.

To test branching, add activity **A2**: `Provide level-appropriate Hindi passages to all 25 schools.` Add output **O2**: `Students receive reading passages matched to their current level.` Connect **A2 → O2** and **O2 → OC1**, then validate. The diagram should show two paths converging on **OC1**. Remove **O2 → OC1** and validate again: the status should say **Needs Review** and identify the disconnected path. Restore that connection, then add **A1 → I1**; validation should flag the skipped levels. Remove the direct link and validate once more to return to a structurally valid diagram. A structurally valid result still needs real evidence for its causal assumptions.

### 6. Stakeholders and practice changes

On **Stakeholders**, load the recommended stakeholders for the FLN theme. Select **Teachers**, **Parents**, and **School Leaders** if available, then save the selection. In **Practice Changes**, choose Teachers and enter:

| Practice field | Example input |
| --- | --- |
| Current practice | Most Grade 3 students receive the same reading passage despite different reading levels. |
| Desired practice | Teachers use a short monthly reading check to group students and provide level-appropriate Hindi practice three times per week. |

Choose **Get AI Suggestions**. Check that current and desired practice suggestions appear in readable cards, refer to teachers and reading instruction, and include useful validation feedback. Repeat for Parents with current practice `Reading at home happens irregularly` and desired practice `A family member listens to the child read for 10 minutes on four days each week`. Saved practice changes should feed into indicator generation.

### 7. Indicators, baselines, and visualization

On **Indicators**, select **Generate Indicators** after saving outcomes and practice changes. Expect measures related to reading comprehension and the practices entered, rather than the same indicators for every organization.

In **Set Baselines**, use example values that match each indicator's unit. For a percentage-based reading outcome indicator, try:

| Field | Example input |
| --- | --- |
| Baseline value | 35 |
| Current value | 45 |
| Target value | 70 |
| Start date | 2026-11-01 |
| End date | 2028-04-30 |

For a percentage-based teacher practice indicator, try baseline `20`, current `40`, target `80`, with the same dates. If an indicator is a **count** or **frequency**, use suitable values instead of these percentages. Save and open **Visualize**. For the reading example, progress from baseline toward target is `(45 − 35) / (70 − 35) ≈ 29%`; it should not display 100%. Verify the chart distinguishes baseline and target, and any validation message matches the values entered.

### 8. Quality check and dashboard update

Run **Quality Check → Run Analysis** once before completing the workflow and again after sections 2–7. Compare the **Completeness** and **Quality** tabs. Missing sections should be named, the completeness score should change as sections are filled, and a partly complete or weak design should not automatically score 100%. Then return to the dashboard and confirm that counts, scores, and suggestions reflect the saved program.

### 9. Templates

On **Templates**, confirm that a fresh database still shows starter templates for the organization's registered themes. Filter for FLN; the reading and numeracy starters should appear. Each template and methodology card should have a relevant cover illustration with its title clearly readable. Open a template's details and check that the guide fills the screen, shows a short example pathway and non-empty section tiles, and remains readable in Hindi. Choose **Use this template** and name the copy `Gogunda Grade 3 Reading Plan — Test Copy`. Confirm it appears under **Your saved templates** with that name and belongs to the current organization. Test rating only after reading the detail. Sharing a saved copy makes it available to other organizations with the same theme, so use **Share** only when you intend to publish a test copy.

### 10. Export

After filling the program, download every offered type and open the resulting file:

| Export | What to inspect |
| --- | --- |
| LFA Document (PDF) | Designed cover, saved problem tree, outcome target and timeline, delivery map, branched Theory of Change, practice change, indicator chart, readable notes, and no raw JSON text. |
| Theory of Change Diagram (PNG) | Node IDs, actual branching connections, and all saved steps are legible. |
| Indicators Matrix (XLSX) | Indicator names, baseline/current/target values, and dates are in usable spreadsheet cells. |
| Budget Template (XLSX) | Clear cost headings and editable budget rows. |
| Program Presentation (PPTX) | Colorful widescreen slides include the same saved diagrams and charts. Check that text and images are legible in presentation mode. |

The export should reflect the current organization's saved design. A budget template can contain blank amounts for the user to fill; it should still be formatted as a usable spreadsheet.

### 11. Language and settings

Switch the interface to **Hindi** in Settings and revisit the dashboard, AI results, methodology detail, validation, indicators, quality check, template detail, and export page. Check that controls remain usable, visible labels are translated, and AI result cards contain readable Hindi where the feature requests Hindi. Switch back to English and check that saved data is still present.

## Test case B: prove results vary by organization and theme

Open a **separate browser profile** and register another fictional organization so the first profile's locally saved selection does not interfere:

| Registration field | Example input |
| --- | --- |
| Organization name | Coastal Futures Network Test |
| Maturity level | Startup (0–2 years) |
| Team size | 5 |
| State / district / block | Tamil Nadu / Tirunelveli / Palayamkottai |
| Thematic focus | Career Readiness |
| Schools / students / teachers | 8 / 400 / 16 |

Use this second problem statement:

> Grade 9 and 10 students in eight supported schools in Tirunelveli report limited exposure to local careers and rarely practice interviewing, planning further study, or comparing training options. Teachers have little time and few structured career guidance materials. We want to test a school-based career exploration and mentoring program. Any percentages entered below are fictional test values that require a real baseline.

Then use this outcome: `Within 12 months, increase the share of participating Grade 9–10 students who can identify two suitable education or training pathways and explain the entry requirements from a fictional baseline of 25% to 65%.` Set **Grades 9–10**, baseline **25%**, target **65%**, and timeline **12 months**. For practice change, enter current `Teachers rarely discuss local career pathways` and desired `Teachers run one structured career exploration session each month and invite local mentors each term`.

Generate a problem tree, methodologies, stakeholder suggestions, theory of change, and indicators. Compare them with case A: the second organization should see career readiness content, its own saved items, and its own dashboard counts. It should not inherit the reading problem, FLN methods, saved templates, or stakeholder choices from case A. Check that an indicator's target progress follows its entered baseline/current/target values.

## AI fallback check

Once `GEMINI_API_KEY` is set in `backend/.env`, you can confirm fallback without revealing the key: temporarily leave `MISTRAL_API_KEY=` blank, restart the backend, and run an AI action such as problem refinement. It should still return user-facing cards through Gemini. Restore your Mistral value afterward if you want Mistral as the primary provider. If the test fails, inspect the visible error and backend log; both providers have their own quota limits. Never paste either key into a bug report.

## Short issue log template

For each failure, record: **organization**, **active theme**, **page and action**, **inputs used**, **expected behavior**, **actual behavior**, and a screenshot with any personal data or keys removed. This makes it easier to distinguish an AI availability issue from a page or data-scoping issue.
