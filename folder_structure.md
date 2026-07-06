# 🗂️ MargDarshak — Folder Structure

> Complete annotated directory tree of the MargDarshak project repository.

---

```
MargDarshak-Shikshalokam/
│
├── 📄 README.md                        # Project overview, architecture, feature set
├── 📄 setup_guide.md                   # Full local + deployment setup instructions
├── 📄 folder_structure.md              # This file — annotated directory guide
├── 📄 features_deep_dive.md            # In-depth feature analysis and impact
├── 📄 requirements.txt                 # Project-level dependency summary
├── 📄 deployment.txt                   # Live deployment URLs (backend + frontend)
├── 📄 instructions.txt                 # Legacy quick-start instructions
├── 📄 setup.txt                        # Legacy detailed setup notes
├── 🖼️ MargDarshak QR.png              # QR code to access live demo
│
├── 📁 frontend/public/assets/          # Documentation & README images
│   ├── 🖼️ margdarshak_dashboard.png   # Dashboard UI screenshot (used in README)
│   ├── 🖼️ margdarshak_architecture.png# System architecture diagram (used in README)
│   ├── 🖼️ margdarshak_workflow.png    # 8-step workflow illustration (used in README)
│   └── 🖼️ margdarshak_impact.png     # Before/after impact illustration (used in README)
│
├── 📁 backend/                         # FastAPI Python backend
│   ├── 🐍 main.py                      # ALL FastAPI routes, models, and logic (65K+ lines)
│   │   ├── Organization Endpoints      #   /organization/ — profile CRUD
│   │   ├── Problem Endpoints           #   /problem/ — definition, refinement, tree
│   │   ├── Outcome Endpoints           #   /outcomes/ — SMART outcome management
│   │   ├── Methodology Endpoints       #   /methodology/ — evidence-based methods
│   │   ├── Theory of Change Endpoints  #   /theory-of-change/ — ToC builder
│   │   ├── Stakeholder Endpoints       #   /stakeholders/ — actor & practice mapping
│   │   ├── Indicator Endpoints         #   /indicators/ — measurement framework
│   │   ├── Quality Endpoints           #   /quality/ — LFA scoring engine
│   │   ├── Export Endpoints            #   /export/ — PDF/Excel/Word/PPT generation
│   │   └── Template Endpoints          #   /templates/ — template library
│   ├── 📄 requirements.txt             # Python dependencies (pip install -r)
│   ├── 📄 .env                         # Environment variables (NOT in git)
│   │   ├── MONGODB_URI                 #   MongoDB connection string
│   │   └── DB_NAME                     #   Database name (margdarshak)
│   └── 📄 .python-version              # Python version specification (3.10+)
│
└── 📁 frontend/                        # Next.js 16 + React 19 frontend
    │
    ├── 📁 app/                         # Next.js App Router root
    │   ├── 📄 layout.tsx               # Root layout — metadata, theme, language providers
    │   ├── 📄 globals.css              # Global styles, CSS variables, Tailwind config
    │   ├── 📄 page.tsx                 # Landing page — hero, features, stats, CTA
    │   │
    │   ├── 📁 dashboard/               # Main application dashboard
    │   │   ├── 📄 page.tsx             # Dashboard overview — progress charts, workflow steps
    │   │   ├── 📄 loading.tsx          # Loading skeleton for dashboard
    │   │   │
    │   │   ├── 📁 organization/        # STEP 1: Organization Setup
    │   │   │   └── 📄 page.tsx         # NGO profile form — geography, theme, scale, maturity
    │   │   │
    │   │   ├── 📁 problem/             # STEP 2: Problem Definition
    │   │   │   └── 📄 page.tsx         # AI-assisted problem statement builder + root cause tree
    │   │   │
    │   │   ├── 📁 outcomes/            # STEP 3: Student Outcomes
    │   │   │   └── 📄 page.tsx         # SMART outcome designer with NEP alignment
    │   │   │
    │   │   ├── 📁 methodology/         # STEP 4: Methodology Selection
    │   │   │   └── 📄 page.tsx         # Evidence-based methodology browser and selector
    │   │   │
    │   │   ├── 📁 theory-of-change/    # STEP 5: Theory of Change Builder
    │   │   │   └── 📄 page.tsx         # Visual ToC builder with Mermaid.js graph rendering
    │   │   │
    │   │   ├── 📁 stakeholders/        # STEP 6: Stakeholder Mapping
    │   │   │   └── 📄 page.tsx         # Actor identification + practice change definition
    │   │   │
    │   │   ├── 📁 indicators/          # STEP 7: Indicator Framework
    │   │   │   └── 📄 page.tsx         # Auto-generated indicators with baseline/target tools
    │   │   │
    │   │   ├── 📁 quality/             # STEP 8: Quality Assurance
    │   │   │   └── 📄 page.tsx         # LFA completeness scoring + design quality feedback
    │   │   │
    │   │   ├── 📁 export/              # STEP 9: Export Reports
    │   │   │   └── 📄 page.tsx         # Multi-format export: PDF, Excel, Word, PowerPoint
    │   │   │
    │   │   ├── 📁 templates/           # Program Design Templates
    │   │   │   └── 📄 page.tsx         # Pre-built LFA template library with ratings
    │   │   │
    │   │   └── 📁 settings/            # Application Settings
    │   │       └── 📄 page.tsx         # User preferences, language, theme
    │   │
    │   └── 📁 api/                     # Next.js API routes (if any)
    │
    ├── 📁 components/                  # Reusable React components
    │   ├── 🧩 language-provider.tsx    # EN/HI multilingual context + translation engine
    │   ├── 🧩 dashboard-layout.tsx     # Sidebar + main content layout wrapper
    │   ├── 🧩 sidebar-nav.tsx          # Step-based sidebar navigation with status indicators
    │   ├── 🧩 header.tsx               # Top header with theme/language switchers
    │   ├── 🧩 background-effects.tsx   # Animated background gradients and effects
    │   ├── 🧩 animated-counter.tsx     # Animated number counter for stats section
    │   ├── 🧩 stat-card.tsx            # Dashboard KPI stat card with trend indicators
    │   ├── 🧩 progress-card.tsx        # Progress tracking card component
    │   ├── 🧩 interactive-card.tsx     # Hover-animated interactive card
    │   ├── 🧩 mermaid-diagram.tsx      # Mermaid.js ToC diagram renderer
    │   ├── 🧩 theme-provider.tsx       # next-themes dark/light mode provider
    │   │
    │   └── 📁 ui/                      # shadcn/ui component library
    │       ├── button.tsx              # Button variants
    │       ├── card.tsx                # Card, CardHeader, CardContent, etc.
    │       ├── dialog.tsx              # Modal dialog
    │       ├── dropdown-menu.tsx       # Dropdown menus
    │       ├── form.tsx                # Form with react-hook-form integration
    │       ├── input.tsx               # Text input
    │       ├── select.tsx              # Select dropdown
    │       ├── progress.tsx            # Progress bar
    │       ├── badge.tsx               # Badge/tag component
    │       ├── tabs.tsx                # Tab navigation
    │       ├── chart.tsx               # Recharts wrapper
    │       ├── toast.tsx               # Toast notifications
    │       └── ...                     # (30+ additional shadcn/ui components)
    │
    ├── 📁 hooks/                       # Custom React hooks
    │   ├── use-mobile.tsx              # Mobile screen detection hook
    │   └── use-toast.ts                # Toast notification hook
    │
    ├── 📁 lib/                         # Utility libraries
    │   ├── utils.ts                    # Utility functions (cn class merging, etc.)
    │   └── store.ts                    # Zustand global state store
    │
    ├── 📁 styles/                      # Additional style files
    │
    ├── 📁 public/                      # Static assets served directly
    │   ├── classroom images            # EdTech background images
    │   └── icons                       # App icons and favicons
    │
    ├── 📄 package.json                 # npm dependencies and scripts
    ├── 📄 tsconfig.json                # TypeScript compiler configuration
    ├── 📄 next.config.mjs              # Next.js configuration
    ├── 📄 postcss.config.mjs           # PostCSS configuration for Tailwind
    ├── 📄 components.json              # shadcn/ui component configuration
    ├── 📄 .env.local                   # Frontend environment variables (NOT in git)
    ├── 📄 .gitignore                   # Git ignore rules
    └── 📄 pnpm-lock.yaml               # Package lock file
```

---

## Key Files Quick Reference

| Need | File |
|------|------|
| Add a new API endpoint | `backend/main.py` |
| Add a new dashboard page | `frontend/app/dashboard/<name>/page.tsx` |
| Modify the landing page | `frontend/app/page.tsx` |
| Add a reusable component | `frontend/components/<name>.tsx` |
| Modify global styles | `frontend/app/globals.css` |
| Add/change translations | `frontend/components/language-provider.tsx` |
| Update global state | `frontend/lib/store.ts` |
| Add UI components (shadcn) | `frontend/components/ui/` |
| Change sidebar navigation | `frontend/components/sidebar-nav.tsx` |
| Modify backend dependencies | `backend/requirements.txt` |

---

> _"From intention to impact — MargDarshak turns ideas into implementable change."_
