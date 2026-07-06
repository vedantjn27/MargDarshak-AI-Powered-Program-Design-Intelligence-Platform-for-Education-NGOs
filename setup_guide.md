# ⚙️ MargDarshak — Complete Setup Guide

> **AI-Powered Program Design Platform for Education NGOs**
> Backend: FastAPI (Python) | Frontend: Next.js 16 + React 19 | Database: MongoDB Atlas

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Clone the Repository](#clone-the-repository)
3. [Backend Setup](#backend-setup-fastapi--mongodb)
4. [Frontend Setup](#frontend-setup-nextjs--react)
5. [Running the Full Application](#running-the-full-application)
6. [Environment Variables Reference](#environment-variables-reference)
7. [MongoDB Collections](#mongodb-collections-auto-created)
8. [API Documentation](#api-documentation)
9. [Deployment Guide](#deployment-guide)
10. [Troubleshooting](#troubleshooting)
11. [Useful Commands](#useful-commands)

---

## Prerequisites

Ensure the following are installed before proceeding:

| Requirement | Version | Download |
|------------|---------|----------|
| **Python** | 3.10+ | [python.org](https://www.python.org/downloads/) |
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org/) |
| **npm** | 9+ | Bundled with Node.js |
| **MongoDB** | Local or Atlas | [mongodb.com](https://www.mongodb.com/) |
| **Git** | Any | [git-scm.com](https://git-scm.com/) |

Verify your environment:
```bash
python --version       # Python 3.10+
node --version         # v18+
npm --version          # 9+
git --version
```

---

## Clone the Repository

```bash
git clone https://github.com/vedantjn27/MargDarshak-Shikshalokam.git
cd MargDarshak-Shikshalokam
```

Or download the ZIP and extract it, then navigate to the folder.

---

## Backend Setup (FastAPI + MongoDB)

### Step 1 — Navigate to backend directory
```bash
cd backend
```

### Step 2 — Create a Python virtual environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt when activated.

### Step 3 — Install Python dependencies
```bash
pip install -r requirements.txt
```

### Step 4 — Create the `.env` file

Create a file named `.env` inside the `backend/` directory:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/margdarshak
DB_NAME=margdarshak
```

**For local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/margdarshak
DB_NAME=margdarshak
```

> **Note:** Never commit your `.env` file. It is already in `.gitignore`.

### Step 5 — Run the backend server
```bash
uvicorn main:app --reload --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Application startup complete.
```

- **API Base URL:** `http://localhost:8000`
- **Swagger Docs:** `http://localhost:8000/docs`
- **ReDoc Docs:** `http://localhost:8000/redoc`

---

## Frontend Setup (Next.js + React)

### Step 1 — Open a NEW terminal and navigate to frontend
```bash
cd frontend
```

### Step 2 — Install Node.js dependencies
```bash
npm install
```

If you encounter peer dependency issues:
```bash
npm install --legacy-peer-deps
```

### Step 3 — Create `.env.local` file

Create a file named `.env.local` inside the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For the deployed backend:
```env
NEXT_PUBLIC_API_URL=https://margdarshak-shikshalokam.onrender.com
```

### Step 4 — Start the development server
```bash
npm run dev
```

Expected output:
```
▲ Next.js 16.0.10
  - Local: http://localhost:3000
  - ready started server on 0.0.0.0:3000
```

- **Application URL:** `http://localhost:3000`

---

## Running the Full Application

Open **3 terminals** and run in sequence:

| Terminal | Directory | Command |
|---------|-----------|---------|
| **Terminal 1** | Root or MongoDB | `mongod` *(if local)* or use MongoDB Atlas |
| **Terminal 2** | `backend/` | `uvicorn main:app --reload --port 8000` |
| **Terminal 3** | `frontend/` | `npm run dev` |

Then open `http://localhost:3000` in your browser.

### Verify Everything is Working

- [ ] `http://localhost:8000/docs` — Swagger UI loads
- [ ] `http://localhost:3000` — MargDarshak landing page loads
- [ ] No CORS errors in browser console (F12)
- [ ] Network requests to `localhost:8000` return 200 OK

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.net/` |
| `DB_NAME` | Database name | `margdarshak` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000` |

---

## MongoDB Collections (Auto-Created)

The following collections are created automatically on first run:

| Collection | Purpose |
|-----------|---------|
| `organization_profiles` | NGO organization data |
| `state_context_rules` | Geography-based design rules |
| `ai_context_analysis` | AI analysis results |
| `problem_statements` | NGO problem statements |
| `problem_refinements` | AI-refined problem data |
| `problem_trees` | Root cause analysis trees |
| `ecosystem_problem_patterns` | Pattern library for problems |
| `district_challenges` | District-level challenge data |
| `student_outcomes` | Designed SMART outcomes |
| `competency_frameworks` | Competency references |
| `policy_references` | NEP and curriculum references |
| `methodology_library` | Evidence-based methodologies |
| `selected_methodologies` | Org-selected methodologies |
| `theory_of_change` | ToC models per organization |
| `toc_pattern_library` | Pre-built ToC templates |
| `stakeholder_master` | Master stakeholder database |
| `organization_stakeholders` | Org-level stakeholder maps |
| `practice_master` | Practice change master list |
| `practice_changes` | Org-level practice definitions |
| `indicator_master` | Master indicator library |
| `generated_indicators` | Auto-generated indicators |
| `indicator_targets` | Targets and timelines |
| `lfa_completeness_scores` | Quality and completeness scores |
| `design_quality_feedback` | AI design feedback |
| `lfa_templates` | LFA template library |
| `organization_templates` | Org-specific templates |
| `template_ratings` | Template rating data |
| `export_jobs` | Background export job queue |

---

## API Documentation

Once the backend is running, explore all API endpoints interactively:

- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

Key API endpoint groups:
- `/organization/` — Organization profile CRUD
- `/problem/` — Problem definition and refinement
- `/outcomes/` — Student outcome management
- `/methodology/` — Methodology library
- `/theory-of-change/` — ToC builder endpoints
- `/stakeholders/` — Stakeholder and practice mapping
- `/indicators/` — Indicator framework management
- `/quality/` — LFA scoring and quality checks
- `/export/` — Multi-format document generation
- `/templates/` — Template library access

---

## Deployment Guide

### Backend — Deploy to Render

1. Push backend code to GitHub
2. Go to [render.com](https://render.com) and create a **New Web Service**
3. Connect your GitHub repository
4. Set **Root Directory** to `backend`
5. Set **Build Command:** `pip install -r requirements.txt`
6. Set **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
7. Add environment variables: `MONGODB_URI`, `DB_NAME`
8. Deploy — your API will be live at `https://your-service.onrender.com`

**Live Backend:** `https://margdarshak-shikshalokam.onrender.com`

### Frontend — Deploy to Vercel

1. Push frontend code to GitHub
2. Go to [vercel.com](https://vercel.com) and **Import Project**
3. Select your repository, set **Root Directory** to `frontend`
4. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`
5. Click **Deploy**

**Live Frontend:** `https://marg-darshak-shikshalokam.vercel.app`

---

## Troubleshooting

### Backend Issues

| Error | Solution |
|-------|---------|
| `ModuleNotFoundError` | Ensure venv is activated, run `pip install -r requirements.txt` |
| `MONGODB_URI not set` | Check that `.env` file exists in `backend/` directory |
| `ServerSelectionTimeoutError` | Verify MongoDB URI, check Atlas IP whitelist |
| `Address already in use` | Change port: `uvicorn main:app --reload --port 8001` |
| `CORS blocked` | Ensure backend is running; CORS is pre-configured for all origins |

### Frontend Issues

| Error | Solution |
|-------|---------|
| `npm ERR! ERESOLVE` | Run `npm install --legacy-peer-deps` |
| `Cannot find module` | Delete `node_modules`, run `npm install` again |
| Styles not loading | Ensure `globals.css` is imported in `app/layout.tsx` |
| Build fails | Check `tsconfig.json` and run `npm run lint` |
| API calls failing | Verify `NEXT_PUBLIC_API_URL` in `.env.local` matches backend port |

### MongoDB Issues

| Error | Solution |
|-------|---------|
| Connection refused (local) | Start MongoDB: `net start MongoDB` (Win) or `sudo systemctl start mongod` (Linux) |
| Atlas auth error | Check username/password in connection string |
| IP not whitelisted | Add your IP in MongoDB Atlas → Network Access |

---

## Useful Commands

### Backend
```bash
# Activate virtual environment
venv\Scripts\activate                    # Windows
source venv/bin/activate                 # macOS/Linux

# Run development server
uvicorn main:app --reload --port 8000

# Run on all interfaces (for LAN testing)
uvicorn main:app --host 0.0.0.0 --port 8000

# Check installed packages
pip list

# Update requirements file
pip freeze > requirements.txt

# Deactivate virtual environment
deactivate
```

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Run production build
npm run lint         # Lint check
npm install          # Install dependencies
```

### MongoDB (Local)
```bash
mongosh                         # Open MongoDB shell
show dbs                        # List databases
use margdarshak                 # Switch to app database
show collections                # List collections
db.organization_profiles.find() # View organization data
```

---

## Additional Resources

| Resource | Link |
|---------|------|
| FastAPI Docs | [fastapi.tiangolo.com](https://fastapi.tiangolo.com) |
| Next.js Docs | [nextjs.org/docs](https://nextjs.org/docs) |
| MongoDB Atlas | [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) |
| shadcn/ui | [ui.shadcn.com](https://ui.shadcn.com) |
| Zustand | [github.com/pmndrs/zustand](https://github.com/pmndrs/zustand) |
| Tailwind CSS | [tailwindcss.com](https://tailwindcss.com) |
| Render Deploy | [render.com](https://render.com) |
| Vercel Deploy | [vercel.com](https://vercel.com) |

---

> _"From intention to impact — MargDarshak turns ideas into implementable change."_
