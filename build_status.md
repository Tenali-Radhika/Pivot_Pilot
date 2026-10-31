# Pivot Pilot — Build Status & Architecture Documentation

**Product:** Pivot Pilot  
**Tagline:** *"Turn career ambition into measurable progress."*  
**Event:** Agentic AI Hackathon 2026  
**Problem Statement:** Career Pivot Coach  
**Target Demonstration Role:** Gen AI Engineer (Junior Level)  
**Status:** ✅ Hackathon Judge Review & Cohesion Polish Completed — Production Ready  

---

## Executive Judge Walkthrough Highlights

1. **Immediate Candidate Pivot Triad (0-to-3 Second Rule):**
   - **Candidate's Career Goal:** *Senior Software / Frontend Engineer* -> **Gen AI Engineer** (43% role match).
   - **#1 Critical Skill Gap Spotlight:** *Stateful Multi-Agent Orchestration (LangGraph / StateGraph)* (3/3 target jobs, 100% demand, *Not Evidenced in Resume*).
   - **Recommended Next Action:** *Rehearse Python Microservices & Generators in Mock Interview Studio* with a 1-click launch button.

2. **Hero Feature: Standout Voice Mock Interview Studio:**
   - Real-time speech input with Wispr Flow.
   - **Side-by-Side Spoken Answer Comparison:** Directly contrasts raw spoken speech (conversational fillers highlighted neutrally) against the AI-Cleaned Structured Answer (Core Concept, Technical Execution, Impact) with zero factual hallucinations.
   - **Diagnostic Scorecard Explanation:** Every dimension card (*Structure*, *Technical Depth*, *Relevance*, *Clarity*) explains **why** the score was awarded, what was demonstrated, and what was missing.
   - **Roadmap Adaptive Impact:** Explicitly explains how scores influence the curriculum (e.g. Technical Depth < 3 injects an adaptive drill) with a direct 1-click button to view the injected drill in the Roadmap.

3. **Curriculum & Adaptive Replanning:**
   - 6-Week curriculum with interactive task checkoffs and immediate progress calculation.
   - 3 portfolio project blueprints mapped to gaps.
   - Deterministic adaptive replanning in application code (0 LLM calls).

4. **Job Application Pipeline & Synthetic Baseline:**
   - 6 preloaded sample records visibly badged with `[Synthetic Demo Data]`.
   - Response velocity analytics & job family breakdown.


## 1. System Architecture

```
Pivot_Pilot/
├── backend/
│   ├── main.py                          # FastAPI server registering career intelligence & studio routers
│   ├── test_interview_studio.py         # Dedicated test suite for Wispr Flow dictation evaluation & 4D scoring
│   ├── test_career_intelligence.py      # Test suite for POST /api/analyze-career & 6-week roadmap
│   ├── test_api.py                      # Integration regression tests
│   └── routers/
│       ├── interview.py                 # Mock Interview Studio Engine (POST /api/evaluate-interview & /aps/evaluate-interview)
│       ├── career_intelligence.py       # Profile & Skill Gap Intelligence Engine (POST /api/analyze-career with 6-Week Curriculum)
│       ├── analyzer.py                  # Baseline heuristic analyzer
│       ├── roadmap.py                   # 6-week roadmap & portfolio blueprints
│       └── applications.py              # Application pipeline presets & AI elevator pitch synthesizer
├── frontend/
│   └── src/
│       ├── types/
│       │   └── index.ts                 # Strongly-typed schemas for 6-week objectives, tasks, 4D scores, and history
│       ├── services/
│       │   ├── adaptivePlanner.ts       # Deterministic Adaptive Replanning Engine (Zero LLM calls)
│       │   ├── api.ts                   # Calls POST /api/analyze-career and POST /api/evaluate-interview
│       │   └── storage.ts               # Local storage persistence for tasks, roadmap, and scorecard data
│       ├── views/
│       │   ├── RoadmapProjectsView.tsx  # 6-WEEK ADAPTIVE ROADMAP & 3 GAP-CONNECTED PORTFOLIO PROJECTS
│       │   ├── MockInterviewsView.tsx   # HERO FEATURE: Voice-First AI Mock Interview Studio & Scorecard
│       │   ├── ProfileSkillGapsView.tsx # Grounded Skill Gaps Matrix & 3 Real JDs Benchmark
│       │   └── ProgressApplicationsView.tsx # Applications Pipeline & Career Progression
│       ├── components/
│       │   ├── Navbar.tsx               # Top navigation with live adaptive readiness score
│       │   ├── ResumeJdEditorModal.tsx
│       │   ├── NewProjectModal.tsx
│       │   └── PitchModal.tsx
│       ├── App.tsx                      # Root component coordinating state, caching & tab switching
│       ├── main.tsx
│       └── index.css
├── run_dev.py                           # Concurrent runner for FastAPI & Vite
├── start_backend.bat
├── start_frontend.bat
└── build_status.md
```

---

## 2. 6-Week Curriculum & Progress Intelligence

Generated directly by `POST /api/analyze-career` and rendered interactively in `RoadmapProjectsView.tsx`:

- **Week 1: Python Microservices & Structured Tool Outputs**
  - *Objective:* Master asynchronous token streaming and deterministic JSON schema enforcement for LLM tool calling.
  - *Tasks:* FastAPI SSE Streaming Endpoint, Pydantic Schema Validator with Instructor, automated retry loop for JSON decode errors.
  - *Skill Associations:* `Production Python Microservices & Streaming (FastAPI / SSE)`, `Structured Outputs & Strict JSON Schema Tool Calling`.

- **Week 2: Stateful Multi-Agent Loops & Graph Orchestration**
  - *Objective:* Design cyclic multi-agent collaboration graphs with checkpoint persistence and human approvals.
  - *Tasks:* 3-agent collaborative state graph in LangGraph, SQLite/Postgres checkpoint saver, human approval breakpoint.
  - *Skill Association:* `Stateful Multi-Agent Orchestration (LangGraph / StateGraph)`.

- **Week 3: Vector Databases, Hybrid Search & Embeddings**
  - *Objective:* Deploy production vector indexing and integrate dense vector embeddings with lexical BM25.
  - *Tasks:* Qdrant container deployment, hybrid search with Reciprocal Rank Fusion, Cohere cross-encoder re-ranking.
  - *Skill Associations:* `Vector Database Management & Indexing (Qdrant)`, `Hybrid RAG & Vector Search (Dense Embeddings + BM25 + Re-ranking)`.

- **Week 4: Quantitative LLM Evaluation & Ragas Benchmarks**
  - *Objective:* Establish continuous CI evaluation pipelines to measure faithfulness, relevance, and hallucination rates.
  - *Tasks:* Synthesize 50 golden test cases, automated Ragas test harness measuring Answer Faithfulness and Context Recall, GitHub Actions CI evaluation threshold.
  - *Skill Association:* `Quantitative LLM Evaluation & Guardrails (Ragas)`.

- **Week 5: Enterprise Safety Guardrails & Docker Deployment**
  - *Objective:* Harden AI pipelines against prompt injection, enforce data privacy, and package into production containers.
  - *Tasks:* NeMo Guardrails input sanitization, multi-stage Docker containerization, OpenTelemetry tracing.
  - *Skill Associations:* `Safety Guardrails & Prompt Injection Defense`, `Containerization & Cloud CI/CD Deployment`.

- **Week 6: Capstone Project Delivery & Technical Voice Defense**
  - *Objective:* Complete the Capstone PR Code Auditor demo and rehearse high-stakes technical voice interviews.
  - *Tasks:* Publish Capstone GitHub repository with architecture diagrams, complete 5 voice mock interview studio sessions scoring >16/20, deploy live public demo.
  - *Skill Associations:* All core Gen AI Engineer target skills.

---

## 3. Deterministic Adaptive Replanning Engine (`adaptivePlanner.ts`)

Strictly adheres to the requirement: **Zero LLM calls for replanning.**

1. **Low Technical Depth (< 3/5):**
   - Automatically injects an **Adaptive Practice Drill Task** targeting the weak technical area (e.g. `🔥 Adaptive Practice Drill: Master Computational Mechanism for [Category]`).
   - Prioritizes the drill to the top of the relevant week and tags it with the exact interview question and score that triggered it.

2. **Repeated Weak Performance (2+ Low Scores in Same Domain):**
   - Flags the domain with an active alert banner (`🔥 Repeated Weak Performance: X low scores`).
   - Automatically escalates all uncompleted tasks for that week to **Adaptive Priority**.

3. **Performance Improvement (Score >= 15/20 or Technical Depth >= 4/5):**
   - Automatically reflects the improvement in the candidate's program indicators:
     - Boosts the **Adaptive Readiness Score** dynamically.
     - Adds a golden achievement badge (`✨ Reinforced by Recent Interview Score (XX/20)`).
     - Shifts candidate focus toward advanced capstone deliverables.

4. **Interactive Completion & Immediate Progress Updates:**
   - The candidate can click each task checkbox to mark it completed.
   - Weekly progress bar, total task completion count, percentage, and readiness score update **immediately** on screen without reloading.

5. **Full State & History Persistence:**
   - Retains the original baseline roadmap history.
   - Preserves all task completion checkmarks, injected adaptive practice drills, and interview evaluation history in `localStorage`.
   - Refreshes to the exact state seamlessly.

---

## 4. Three Portfolio Projects Directly Mapped to Identified Skill Gaps

1. **Agentic Sentry: Autonomous PR Code Auditor** (Capstone · 2.5 Weeks)
   - *Connected Skill Gaps:* `Stateful Multi-Agent Orchestration (LangGraph)`, `Structured Outputs & Strict JSON Schema Tool Calling`, `Containerization & Cloud CI/CD`.
   - *Architecture:* FastAPI Webhook, 3-Agent StateGraph (Security, Profiler, Linter), Pydantic review comments, human approval reaction gate.
   - *Verification:* Submit PR with intentional SQL concatenation; verify agent intercepts, comments, and suggests fix in <15s.

2. **ContextGuard: Enterprise Hybrid RAG with Automated Evals** (Advanced · 2 Weeks)
   - *Connected Skill Gaps:* `Hybrid RAG & Vector Search`, `Quantitative LLM Evaluation (Ragas)`, `Vector Database Management (Qdrant)`.
   - *Architecture:* Lexical BM25 + dense Qdrant vectors, Cohere cross-encoder reranker, automated Ragas CI evaluation harness.
   - *Verification:* Query complex 10-K filing questions; verify citation accuracy and automated Ragas report showing >92% faithfulness.

3. **VoiceFlow AI: Sub-Second Conversational Voice Agent** (Intermediate · 1.5 Weeks)
   - *Connected Skill Gaps:* `Production Python Microservices & Streaming (FastAPI / SSE)`, `Structured Outputs`, `Safety Guardrails`.
   - *Architecture:* Real-time SSE token streaming, Web Speech API integration, Pydantic function calling dispatch, input sanitization guardrails.
   - *Verification:* Conduct live voice dialogue booking an appointment with zero manual typing and sub-500ms voice turnaround.

---

## 5. Job Application Tracker & Pipeline Analytics (`ProgressApplicationsView.tsx`)

A functional job application tracker with conversion analytics and tailored AI pitch generation:

1. **Application Attributes Supported:**
   - **Company Name** (e.g. Anthropic Systems Labs, Databricks Mosaic AI, Cognition Vector AI)
   - **Job Title** (e.g. AI Solutions & Agentic Engineer, Autonomous Workflow Engineer)
   - **Job Family** (e.g. `Generative AI & Agents`, `Backend & Cloud Systems`, `Machine Learning & Data`, `Full-Stack AI Engineering`)
   - **Application Date** (`YYYY-MM-DD`)
   - **Application Source** (e.g. `LinkedIn`, `Company Careers`, `Referral`, `Wellfound`, `Direct Pitch`)
   - **Application Status** (`applied`, `assessment`, `interview`, `offer`, `rejected`) with color-coded badges and on-the-fly status updates
   - **Notes & Interview Context**

2. **Conversion Analytics & Insights by Job Family:**
   - **Total Applications Tracked** (e.g., 6 baseline records)
   - **Employer Responses Count** (moved past initial `applied` status)
   - **Active Interviews & Offers Count** (at `interview` or `offer` stage)
   - **Overall Response Rate %** with animated progress meter
   - **Insights by Job Family**: Visual cards breaking down response rate %, total applications, and interview traction across `Generative AI & Agents`, `Backend & Cloud Systems`, and `Full-Stack AI Engineering`.

3. **Prominent Synthetic Demo Data Disclaimers:**
   - Preloaded applications are explicitly flagged with `[Synthetic Demo Data]` badges.
   - User-added applications receive `[Custom User Record]` badges.
   - Prominent disclaimer banner explicitly states that sample records and conversion metrics are a synthetic baseline for demonstration and do not represent real employer outcomes or statistically reliable predictive hiring models.

4. **Persistence & User Actions:**
   - Add new custom application form with validation.
   - In-place status dropdowns that update immediately and persist to browser `localStorage`.
   - Filter by status (`All`, `Applied`, `Assessment`, `Interview`, `Offer`, `Rejected`) and job family.
   - Fast full-text search across companies, roles, notes, and sources.
   - "Generate AI Pitch" button for tailored 30-second elevator pitches and cover note hooks.
   - Quick "Reset Samples" button to restore synthetic benchmark records.

---

## 6. Verification & Automated Test Results

- `python -m backend.test_applications_tracker` -> **PASS**: Validates 6 sample applications, all required attributes, synthetic marking, analytics math, and pitch synthesis.
- `python -m backend.test_career_intelligence` -> **PASS**: 6-week curriculum, 3 real JDs, 8 skills, Pydantic constraints, SHA-256 caching.
- `python -m backend.test_interview_studio` -> **PASS**: Wispr Flow dictation handling, 4D scoring, fact-preserving answer cleaning, gap linkage.
- `python -m backend.test_api` -> **PASS**: End-to-end regression across all backend routers.
- `npm run build --prefix frontend` -> **PASS**: 2,069 modules transformed, 0 TypeScript errors.
