# Repository structure

The tree below lists source and documentation, not generated install/build output.

```text
MargDarshak-Shikshalokam/
├── README.md                         Product overview and local quick start
├── setup_guide.md                    Configuration, deployment, and troubleshooting
├── PROJECT_OVERVIEW_AND_WORKFLOW.md  Detailed plain-language workflow
├── features_deep_dive.md            Current feature reference
├── MANUAL_TEST_INPUTS.md            Fictional inputs for manual walkthrough
├── folder_structure.md              This map
├── requirements.txt                 Includes backend/requirements.txt
├── deployment.txt                   Recorded deployment URLs
├── setup.txt, instructions.txt       Short pointers to setup_guide.md
├── backend/
│   ├── main.py                       FastAPI routes and app configuration
│   ├── auth_service.py               Sign-up, login, cookies, ownership checks
│   ├── ai_service.py                 RAG retrieval and Mistral/Gemini calls
│   ├── indicator_generation.py       Stable-ID indicator mapping
│   ├── smart_validation.py           SMART outcome checks
│   ├── toc_logic.py                  Theory of Change graph logic
│   ├── methodology_catalog.py        Methodology matching and display
│   ├── template_catalog.py           Starter and saved template logic
│   ├── practice_suggestions.py       Practice-card normalization
│   ├── presentation.py               Readable AI response conversion
│   ├── export_service.py             PDF, PPTX, XLSX, PNG creation
│   ├── export_visuals.py             Charts and diagram visuals for exports
│   ├── assets/                       Fonts and license for export rendering
│   ├── .env.example                  Safe configuration template
│   ├── .python-version               Python 3.11.9 deployment pin
│   ├── .venv/                        Local backend packages (ignored by Git)
│   └── requirements.txt              Canonical Python dependencies
└── frontend/
    ├── app/                          Next.js pages and route handlers
    │   ├── auth/                      Sign-up and login page
    │   ├── api/proxy/[...path]/       Same-origin FastAPI proxy
    │   └── dashboard/                 Feature pages and page guides
    ├── components/                   Dashboard, diagrams, dialogs, and UI controls
    ├── lib/                          API client, store, workflow, presentation
    ├── hooks/                        Reusable React hooks
    ├── public/assets/                README images
    ├── public/covers/                Theme-specific catalog cover images
    ├── package.json                  npm scripts and dependencies
    └── package-lock.json             npm dependency lockfile
```

`backend/.env` and `frontend/.env.local` are private local configuration. `backend/.venv/` contains the isolated local Python packages; this machine created it with Python 3.12.5. `frontend/node_modules/` and `frontend/.next/` are install/build output; Python `__pycache__/` and TypeScript `*.tsbuildinfo` are generated caches. These are ignored by Git. Export files are generated in temporary storage when requested.

See [setup_guide.md](setup_guide.md) for current commands and [features_deep_dive.md](features_deep_dive.md) for what each source module supports.
