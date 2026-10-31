# Pivot Pilot — Voice-First AI Career Transition Agent

> *"Turn career ambition into measurable progress."*

**Agentic AI Hackathon 2026** · **Problem Statement:** Career Pivot Coach  
**Demonstration Target Role:** Gen AI Engineer (Junior Level)

---

## 1. Product Overview & Architecture

Pivot Pilot is a voice-first AI career transition agent built to guide technical professionals pivoting into high-demand AI roles. Rather than relying on generic career advice or superficial quizzes, Pivot Pilot benchmarks a candidate's actual resume against **three real-world job descriptions**, isolates concrete skill gaps with grounded citations, synthesizes an actionable **6-week learning curriculum**, recommends verifiable **portfolio projects**, runs high-stakes **voice mock interview rehearsals** evaluated across 4 dimensions, and tracks the candidate's job application pipeline.

### Architectural Stack

- **Frontend:** React 19, TypeScript, Vite 6, Tailwind CSS, Lucide React Icons
- **Backend:** Python 3.10+ / FastAPI, Pydantic V2 data contracts, Uvicorn ASGI
- **AI Engine:** Dual-mode architecture supporting Google Gemini (Gemini 2.5 Flash) and Anthropic Claude (Claude 3.5 Sonnet) with a deterministic offline fallback
- **State & Persistence:** Browser `localStorage` for the hackathon MVP — zero external database dependencies
- **Voice Ingestion:** Native integration with **Wispr Flow** speech dictation

```
Pivot_Pilot/
├── backend/
│   ├── main.py                          # FastAPI server & CORS configuration
│   ├── .env.example                     # Safe environment template
│   ├── test_complete_journey.py         # Full candidate journey regression test
│   ├── test_career_intelligence.py      # Test suite for POST /api/analyze-career
│   ├── test_interview_studio.py         # Test suite for Wispr Flow & 4D scoring
│   ├── test_applications_tracker.py     # Test suite for tracker & analytics
│   ├── test_api.py                      # Integration router test
│   └── routers/
│       ├── career_intelligence.py       # Career analysis engine & 3-JD grounding
│       ├── interview.py                 # Mock Interview Studio (/api & /aps endpoints)
│       ├── applications.py              # Application pipeline & pitch generator
│       ├── analyzer.py                  # Baseline heuristic profile analyzer
│       └── roadmap.py                   # Curriculum blueprints
├── frontend/
│   ├── src/
│   │   ├── types/index.ts               # Complete TypeScript interfaces & schemas
│   │   ├── services/
│   │   │   ├── api.ts                   # Typed API client with dual fallback routes
│   │   │   ├── storage.ts               # LocalStorage management & demo presets
│   │   │   └── adaptivePlanner.ts       # Deterministic adaptive replanner (0 LLM calls)
│   │   ├── views/
│   │   │   ├── ProfileSkillGapsView.tsx # Resume vs. 3 real JDs & coverage matrix
│   │   │   ├── RoadmapProjectsView.tsx  # 6-Week adaptive roadmap & portfolio blueprints
│   │   │   ├── MockInterviewsView.tsx   # HERO FEATURE: Voice-First Mock Interview Studio
│   │   │   └── ProgressApplicationsView.tsx # Job application tracker & analytics
│   │   ├── components/
│   │   │   ├── Navbar.tsx               # Top cockpit nav & adaptive readiness meter
│   │   │   ├── ResumeJdEditorModal.tsx  # Candidate intake & 3-JD editor modal
│   │   │   ├── PitchModal.tsx           # Tailored elevator pitch synthesizer
│   │   │   └── NewProjectModal.tsx      # Custom portfolio project builder
│   │   ├── App.tsx                      # Root state coordinator
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── .env.example                         # Safe root environment variable template
├── .gitignore                           # Excludes .env, secrets, node_modules, build artifacts
├── run_dev.py                           # Concurrent runner for FastAPI & Vite
├── start_backend.bat                    # 1-click Windows backend launcher
├── start_frontend.bat                   # 1-click Windows frontend launcher
├── build_status.md                      # Detailed verification log
└── README.md
```

---

## 2. Four Primary Navigation Sections

### Section 1: Profile & Skill Gaps
- **Target Role Setup:** Demonstrates a transition from *Senior Software / Frontend Engineer* to *Gen AI Engineer*.
- **Three Real Job Description Benchmarks:** Benchmarked against live requirements from **Anthropic** (*Applied AI Systems*), **Cohere** (*Solutions & RAG*), and **Databricks** (*Mosaic AI Applications*).
- **Candidate Status Classifications:** Evaluates requirements strictly as `"demonstrated"`, `"partially demonstrated"`, or `"not evidenced in the resume"` (never assuming missing skills or fabricating credentials).
- **Grounded Evidence Citations:** Highlights direct quote excerpts from the candidate's resume and links them to the exact employer listings.
- **SHA-256 Analysis Caching:** Automatically hashes candidate profile and JD payloads to prevent unnecessary LLM invocations during repeated demonstrations.

### Section 2: Learning Roadmap & Projects
- **6-Week Structured Curriculum:** Generates weekly objectives, actionable tasks with skill associations, deliverables, and learning resources.
- **Immediate Interactive Progress:** Interactive task completion checkmarks dynamically recompute weekly progress bars and the overall readiness index.
- **Three Gap-Connected Portfolio Projects:**
  1. *Agentic Sentry: Autonomous PR Code Auditor* (LangGraph, state persistence, strict schemas).
  2. *ContextGuard: Enterprise Hybrid RAG with Automated Evals* (Qdrant, BM25, Ragas CI benchmark).
  3. *VoiceFlow AI: Sub-Second Conversational Voice Agent* (FastAPI, SSE streaming, Wispr Flow voice patterns).
- **Deterministic Adaptive Replanning:** 100% deterministic application logic (zero LLM calls). Technical depth scores `< 3` automatically inject prioritized practice drills; repeated weak performance escalates week priority; strong scores reinforce readiness indicators.

### Section 3: Hero Feature — Voice-First AI Mock Interview Studio
- **Junior Engineer Target:** Rehearses foundational and applied questions across 5 core domains: *Python*, *Generative AI*, *RAG*, *Machine Learning*, and *System Design*.
- **Natural Wispr Flow Voice Input:** Candidates dictate their answers naturally using spoken speech. The raw dictated answer is previewed on screen before submission.
- **4-Dimension Scorecard (out of 20):**
  - **Structure** (1–5)
  - **Technical Depth** (1–5)
  - **Relevance** (1–5)
  - **Clarity** (1–5)
- **Fact-Preserving Answer Cleaning:** Strips conversational verbal fillers (`um`, `uh`, `you know`) and outputs two views:
  1. *Cleaned Structured Answer:* Formatted into logical technical bullets (Concept, Execution, Impact).
  2. *Cleaned Fluent Prose:* Fluent conversational prose.
  *Strict rule: Preserves the candidate's original facts and claims without hallucinating technical knowledge.*
- **Fairness & Accent Neutrality:** Evaluates technical substance and reasoning; candidates are never penalized for harmless fillers, speaking tempo, or accents.
- **Contextual Probing:** Probes with 2 follow-up technical questions based directly on the candidate's previous response.
- **Local History:** All questions, original dictations, cleaned answers, and scorecard dimensions persist in `localStorage`.

### Section 4: Progress & Applications Tracker
- **Job Application Pipeline:** Tracks company name, job title, job family, application date, application source, and application status.
- **Supported Statuses:** `applied`, `assessment`, `interview`, `offer`, and `rejected`.
- **Conversion Analytics:** Real-time computation of total applications, responses, interviews, and response rates.
- **Job Family Insights:** Granular breakdown across target job families (*Generative AI & Agents*, *Backend & Cloud Systems*, *Full-Stack AI Engineering*).
- **Synthetic Baseline Disclosure:** Preloaded demo applications are visibly marked with `[Synthetic Demo Data]` badges and disclaimer banners.
- **Tailored AI Elevator Pitch:** 1-click generator creates customized 30-second pitches and cover note hooks for hiring managers.

---

## 3. Wispr Flow Dual Workflow

Wispr Flow plays a central role in both the **user experience** and the **development** of Pivot Pilot:

### 1. In-App Candidate Voice Dictation
- In the Mock Interview Studio, candidates dictate their answers using natural speech via Wispr Flow.
- Wispr Flow dictates directly into the studio's answer input with sub-second latency.
- The candidate reviews their verbatim dictated speech in real time before submitting it for evaluation.
- The backend cleans filler words while rigorously preserving the candidate's factual statements.

### 2. Product Development Voice Companion
- Pivot Pilot was developed with Wispr Flow acting as the voice dictation companion alongside Antigravity.
- Prompt engineering iterations, test scenarios, architectural notes, and mock interview transcripts were dictated naturally using Wispr Flow throughout the hackathon.

---

## 4. Live AI Mode vs. Demo Fallback Mode

Pivot Pilot is built with an intelligent provider detection engine:

| Attribute | Live AI Mode (`gemini` or `anthropic`) | Deterministic Demo Fallback Mode |
| :--- | :--- | :--- |
| **Trigger** | Valid `GEMINI_API_KEY` or `ANTHROPIC_API_KEY` in environment | Neither key configured (or network failure) |
| **Visual Indicator** | Green pill: `LIVE AI ANALYSIS: GEMINI` or `CLAUDE` | Amber pill: `DETERMINISTIC DEMO FALLBACK` |
| **Provider Note** | Identifies the active live model (e.g. `Gemini 2.5 Flash` or `Claude 3.5 Sonnet`) | Explicit note stating that high-fidelity deterministic analysis was used without live API calls |
| **Offline Reliability** | Requires internet & active API credits | 100% offline-ready, instant response, zero latency, no rate limits |
| **Schema Integrity** | Validated via Pydantic V2 models | Validated via Pydantic V2 models |

*Secrets Security Rule:* API keys remain **strictly in backend environment variables**. They are never rendered in frontend HTML, never saved to browser storage, and never logged in console outputs.

---

## 5. Synthetic Application Baseline Disclosure

- All preloaded applications in the Progress & Applications view are seeded from a synthetic demonstration baseline.
- Every preloaded card carries an explicit amber badge: `[Synthetic Demo Data]`.
- User-added applications receive an emerald badge: `[Custom User Record]`.
- An explicit disclaimer note clarifies:
  > *"Preloaded sample records are illustrative examples configured to demonstrate stage conversion tracking and do not represent real employer job applications, actual hiring decisions, or statistically predictive outcomes for any candidate."*

---

## 6. Installation & Quick Start

### Prerequisites
- Python 3.10, 3.11, 3.12, or 3.13
- Node.js 18+ and npm

### Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. *(Optional)* Add your Gemini or Anthropic API key to `.env`:
   ```env
   # Optional: Set either key to enable live AI mode
   GEMINI_API_KEY=your_gemini_api_key_here
   # or
   ANTHROPIC_API_KEY=your_anthropic_api_key_here

   PORT=8000
   HOST=127.0.0.1
   ```
   *If omitted, Pivot Pilot automatically operates in its high-fidelity deterministic demo fallback mode.*

---

### Starting the Application

#### Option A: Unified Launcher (Recommended)
Run both backend and frontend concurrently in a single terminal:
```bash
python run_dev.py
```

#### Option B: Individual Service Launchers

**1. Start the FastAPI Backend:**
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
- Swagger API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

**2. Start the Vite Frontend:**
```bash
npm run dev --prefix frontend
```
- Web Application: [http://localhost:5173](http://localhost:5173)

*Windows users can also double-click `start_backend.bat` and `start_frontend.bat`.*

---

## 7. Automated Test Suites & Verification

Pivot Pilot includes dedicated regression test suites:

```bash
# 1. Complete end-to-end candidate journey validation:
python -m backend.test_complete_journey

# 2. Career intelligence & 6-week roadmap schema test:
python -m backend.test_career_intelligence

# 3. Voice interview studio & 4D evaluation test:
python -m backend.test_interview_studio

# 4. Job application tracker & analytics test:
python -m backend.test_applications_tracker

# 5. Frontend TypeScript & Vite production build:
npm run build --prefix frontend
```

---

## 8. Working Features & Current Limitations

### Working Features
- ✅ **Resume Intake & Target Role Customization:** Edit candidate resume, target role, and 3 job descriptions with 1-click demo resets.
- ✅ **Career Skill Gap Analysis (`POST /api/analyze-career`):** 8 skills evaluated across 3 real JDs with grounded resume citations and status constraints.
- ✅ **SHA-256 Request Caching:** Instant repeated analysis runs with zero duplicate model calls.
- ✅ **6-Week Curriculum:** Interactive weekly tasks, skill associations, and instant progress recalculation upon checkoff.
- ✅ **3 Portfolio Project Blueprints:** Architectural specs, tech stacks, verification criteria, and copyable resume bullets.
- ✅ **Deterministic Adaptive Replanning:** Automatically injects practice drills for low technical depth (< 3/5) without LLM calls.
- ✅ **Voice-First Mock Interview Studio:** Wispr Flow dictation field, sample dictation toggle, 4D scorecard (/20), and contextual follow-ups.
- ✅ **Dual Evaluate Endpoints:** Registered both `POST /api/evaluate-interview` and `POST /aps/evaluate-interview`.
- ✅ **Fact-Preserving Speech Cleaning:** Converts raw spoken speech to structured bullets and fluent prose without hallucinating facts.
- ✅ **Job Application Tracker:** CRUD application management, status updates, job family analytics, and AI elevator pitches.
- ✅ **Local Storage Persistence:** 100% browser persistence across all tabs and page reloads.

### Current Limitations
- **Browser Audio Synthesis:** Relies on the browser's native `window.speechSynthesis` API for reading interview questions aloud; voice timbre varies by operating system.
- **Microphone Hardware Permissions:** In browser environments where microphone access is blocked or restricted, candidates can use the sample dictation generator or paste Wispr Flow transcripts directly.
- **Hackathon State Scope:** Uses browser `localStorage` intentionally for hackathon simplicity and zero-configuration demonstration rather than a multi-tenant cloud SQL database.
