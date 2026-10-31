import {
  CandidateProfileInput,
  JobDescriptionInput,
  CareerAnalysisResponse,
  InterviewHistoryItem,
  ApplicationItem,
  RoadmapMilestone,
  PortfolioProject
} from '../types';

const STORAGE_KEYS = {
  CAREER_ANALYSIS: 'pivot_pilot_career_analysis_v2',
  RESUME_INPUT: 'pivot_pilot_resume_input_v2',
  TARGET_ROLE: 'pivot_pilot_target_role_v2',
  JOB_DESCRIPTIONS: 'pivot_pilot_jds_v2',
  INTERVIEW_HISTORY: 'pivot_pilot_interview_history_v2',
  APPLICATIONS: 'pivot_pilot_applications_v2'
};

export const DEMO_RESUME = `ALEX CHEN
San Francisco, CA | alex.chen@example.com | github.com/alexchen-dev

PROFESSIONAL SUMMARY
Senior Software & Frontend Systems Engineer with 5+ years of experience building performant web applications, 
interactive data visualizations, and reliable client-server architectures. Experienced in TypeScript, Node.js, 
Python scripting, RESTful API integrations, and Docker containerization. Proven history optimizing high-traffic 
applications, reducing rendering latency by 42%, and collaborating with distributed backend teams. Currently 
transitioning to Generative AI Engineering with self-directed focus on LLM application development, prompt engineering, 
and basic vector database indexing.

WORK EXPERIENCE
Senior Frontend Systems Engineer | FinPulse Labs (2022 - Present)
- Architected responsive enterprise analytics dashboard in React/TypeScript used by 45,000 daily active financial analysts.
- Built asynchronous state pipelines and WebSocket streaming listeners for real-time market data tickers.
- Authored internal Python scripts for API payload validation, automated regression test runs, and synthetic mock data generation.
- Integrated OpenAI chat completion endpoints into internal customer support dashboard using server-sent events (SSE).
- Containerized frontend microservices using Docker and managed continuous deployment via GitHub Actions CI/CD pipelines.

Software Engineer | NextFlow Systems (2020 - 2022)
- Developed modular UI components and GraphQL client caching layers, improving initial page load time by 35%.
- Maintained unit and integration test coverage above 85% using Jest and Cypress.
- Collaborated with backend engineers to define JSON schema contracts for customer billing and account workflows.

SKILLS & TECHNOLOGIES
Languages & Frameworks: TypeScript, JavaScript, Python (Intermediate), Node.js, React, Next.js, HTML5/CSS3, TailwindCSS.
APIs & Data: REST APIs, GraphQL, WebSockets, PostgreSQL basics, JSON Schema, Redis caching basics.
Tools & DevOps: Docker, Git, GitHub Actions CI/CD, Jest, Vite, Webpack, Postman.
AI Exploration: OpenAI API, Prompt Engineering basics, ChromaDB tutorial sandbox.`;

export const DEMO_JDS: JobDescriptionInput[] = [
  {
    company_name: "Anthropic",
    job_title: "Generative AI Engineer — Applied AI Systems",
    source_url: "https://boards.greenhouse.io/anthropic/jobs/4392812004",
    posting_date: "Illustrative Sample Posting",
    description_text: `Anthropic is hiring a Generative AI Engineer to join our Applied AI Systems team. In this role, you will design, evaluate, and deploy production-grade agentic workflows powered by Claude.
Responsibilities & Requirements:
- Deep experience with LLM orchestration frameworks, stateful multi-agent graphs (such as LangGraph, LlamaIndex, or custom state machines).
- Production expertise implementing hybrid Retrieval-Augmented Generation (RAG) combining dense vector embeddings and lexical sparse search (BM25) with cross-encoder re-ranking.
- Rigorous evaluation methodology: building automated evaluation pipelines using frameworks like Ragas, TruLens, or synthetic golden test sets to measure faithfulness and answer relevance.
- Experience with Python microservices, FastAPI, asynchronous token streaming (SSE), and strict tool-calling schema validation (Pydantic / Instructor).
- Familiarity with vector databases (Pinecone, Qdrant, Chroma) and vector index management (HNSW, quantization).
- Strong background in software reliability: error handling, prompt drift detection, and mitigation of hallucinations in non-deterministic systems.`
  },
  {
    company_name: "Cohere",
    job_title: "Generative AI Solutions & RAG Engineer",
    source_url: "https://jobs.lever.co/cohere/a89b412e-71cf-4d92-91f8-085341203b82",
    posting_date: "Illustrative Sample Posting",
    description_text: `Join Cohere's Enterprise AI Solutions team as a Generative AI Engineer. You will partner with Fortune 500 customers to deploy custom retrieval and generation architectures on high-scale enterprise knowledge bases.
Key Qualifications:
- Hands-on experience engineering advanced RAG architectures: recursive document chunking, metadata enrichment, hybrid search, and Cohere Re-ranker integration.
- Demonstrated capability with vector databases (Qdrant, Pinecone, Milvus) and embedding model selection.
- Proficiency in Python, FastAPI, and asynchronous API design for sub-second streaming inference.
- Practical understanding of prompt engineering, few-shot prompting, and structured output generation (JSON schema enforcement).
- Experience establishing quantitative benchmarking suites for hallucination reduction, recall, and precision.
- Bonus: Experience with agentic tool use, autonomous planning, and human-in-the-loop escalation patterns.`
  },
  {
    company_name: "Databricks",
    job_title: "Staff Generative AI Applications Engineer",
    source_url: "https://databricks.com/company/careers/ai-engineering-59218",
    posting_date: "Illustrative Sample Posting",
    description_text: `Databricks is seeking a Generative AI Applications Engineer to build enterprise Gen AI tools and autonomous agents.
What You'll Do:
- Architect resilient agentic loops with multi-step reasoning, dynamic tool selection, and state persistence.
- Implement and optimize enterprise RAG pipelines over millions of unstructured documents and tabular data.
- Build automated CI/CD evaluation pipelines using MLflow LLM evaluate, Ragas, and synthetic test query generation.
- Write robust Python services utilizing FastAPI, Pydantic, and Docker containers for production cloud deployment.
- Implement guardrails and safety filters (NeMo Guardrails, Llama-Guard) to prevent prompt injection and unauthorized data exfiltration.
- Collaborate with frontend engineers to deliver intuitive, low-latency conversational user interfaces.`
  }
];

export const SYNTHETIC_SAMPLE_APPLICATIONS: ApplicationItem[] = [
  {
    id: "app-synthetic-1",
    company: "Anthropic Systems Labs",
    role: "AI Solutions & Agentic Engineer",
    job_family: "Generative AI & Agents",
    date_applied: "2026-10-18",
    source: "Referral",
    status: "interview",
    is_synthetic: true,
    location: "San Francisco / Remote",
    salary_range: "$185,000 - $220,000",
    match_score: 88,
    notes: "Technical round scheduled: 45-min Voice & System Design session on LangGraph workflows, tool reliability, and SSE streaming.",
    key_requirements_met: ["Python/FastAPI", "Agentic orchestration", "Streaming UX", "Wispr Flow voice input patterns"],
    missing_requirements: ["Distributed Ray / Kubernetes experience"],
    stage: "Technical Interview"
  },
  {
    id: "app-synthetic-2",
    company: "Cognition Vector AI",
    role: "Autonomous Workflow Engineer",
    job_family: "Generative AI & Agents",
    date_applied: "2026-10-22",
    source: "Company Careers",
    status: "assessment",
    is_synthetic: true,
    location: "New York / Hybrid",
    salary_range: "$175,000 - $210,000",
    match_score: 82,
    notes: "Take-home assessment received: Build deterministic evaluator using Pydantic output validation and fallback mechanisms.",
    key_requirements_met: ["Multi-agent state machines", "Pydantic validation", "TypeScript/Node"],
    missing_requirements: ["Fine-tuning small language models"],
    stage: "Screening"
  },
  {
    id: "app-synthetic-3",
    company: "Databricks Mosaic AI",
    role: "Staff Generative AI Applications Engineer",
    job_family: "Generative AI & Agents",
    date_applied: "2026-10-12",
    source: "Wellfound",
    status: "offer",
    is_synthetic: true,
    location: "San Francisco, CA / Remote",
    salary_range: "$195,000 - $235,000",
    match_score: 92,
    notes: "Formal offer extended following 4-round interview loop. Base $205k + equity package. Evaluating decision timeline.",
    key_requirements_met: ["Hybrid RAG architectures", "Vector search", "FastAPI production microservices", "Client-side telemetry"],
    missing_requirements: [],
    stage: "Offer"
  },
  {
    id: "app-synthetic-4",
    company: "ScaleOps Intelligence",
    role: "AI Platform Systems Engineer",
    job_family: "Backend & Cloud Systems",
    date_applied: "2026-10-25",
    source: "LinkedIn",
    status: "applied",
    is_synthetic: true,
    location: "Remote (US / Canada)",
    salary_range: "$170,000 - $200,000",
    match_score: 78,
    notes: "Application submitted with tailored elevator pitch highlighting full-stack observability and API rate limit protection.",
    key_requirements_met: ["System architecture", "FastAPI microservices", "Containerization"],
    missing_requirements: ["Kubernetes operator authoring"],
    stage: "Applied"
  },
  {
    id: "app-synthetic-5",
    company: "Linear Dynamics Labs",
    role: "Full-Stack AI Application Engineer",
    job_family: "Full-Stack AI Engineering",
    date_applied: "2026-10-08",
    source: "Direct Pitch",
    status: "interview",
    is_synthetic: true,
    location: "Seattle, WA / Remote",
    salary_range: "$180,000 - $215,000",
    match_score: 90,
    notes: "Hiring Manager screen completed with high commendation on portfolio projects. Advancing to team architectural pairing.",
    key_requirements_met: ["WebSockets/SSE", "LangGraph", "Vector DB integration", "Strict schema generation"],
    missing_requirements: [],
    stage: "Technical Interview"
  },
  {
    id: "app-synthetic-6",
    company: "Helix Core Infrastructure",
    role: "Distributed Systems Backend Engineer",
    job_family: "Backend & Cloud Systems",
    date_applied: "2026-09-28",
    source: "LinkedIn",
    status: "rejected",
    is_synthetic: true,
    location: "Austin, TX / Hybrid",
    salary_range: "$165,000 - $190,000",
    match_score: 72,
    notes: "Automated rejection after resume screen. Role required 5+ years of C++ / low-level networking kernels.",
    key_requirements_met: ["Python systems programming", "Linux fundamentals"],
    missing_requirements: ["Low-level C++ / kernel bypass networking"],
    stage: "Rejected"
  }
];

export const storageService = {
  getResumeText(): string {
    return localStorage.getItem(STORAGE_KEYS.RESUME_INPUT) || DEMO_RESUME;
  },

  saveResumeText(text: string): void {
    localStorage.setItem(STORAGE_KEYS.RESUME_INPUT, text);
  },

  getTargetRole(): string {
    return localStorage.getItem(STORAGE_KEYS.TARGET_ROLE) || "Gen AI Engineer";
  },

  saveTargetRole(role: string): void {
    localStorage.setItem(STORAGE_KEYS.TARGET_ROLE, role);
  },

  getJobDescriptions(): JobDescriptionInput[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.JOB_DESCRIPTIONS);
      return data ? JSON.parse(data) : DEMO_JDS;
    } catch {
      return DEMO_JDS;
    }
  },

  saveJobDescriptions(jds: JobDescriptionInput[]): void {
    localStorage.setItem(STORAGE_KEYS.JOB_DESCRIPTIONS, JSON.stringify(jds));
  },

  getCareerAnalysis(): CareerAnalysisResponse | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CAREER_ANALYSIS);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveCareerAnalysis(analysis: CareerAnalysisResponse): void {
    localStorage.setItem(STORAGE_KEYS.CAREER_ANALYSIS, JSON.stringify(analysis));
  },

  getCompletedTasks(): Record<string, boolean> {
    try {
      const data = localStorage.getItem('pivot_pilot_completed_tasks_v1');
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  },

  saveCompletedTasks(map: Record<string, boolean>): void {
    localStorage.setItem('pivot_pilot_completed_tasks_v1', JSON.stringify(map));
  },

  getStudioHistory(): import('../types').StudioHistoryEntry[] {
    try {
      const data = localStorage.getItem('pivot_pilot_studio_history_v1');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveStudioHistoryEntry(entry: import('../types').StudioHistoryEntry): import('../types').StudioHistoryEntry[] {
    const current = this.getStudioHistory();
    const updated = [entry, ...current];
    localStorage.setItem('pivot_pilot_studio_history_v1', JSON.stringify(updated));
    return updated;
  },

  clearStudioHistory(): void {
    localStorage.removeItem('pivot_pilot_studio_history_v1');
  },

  getInterviewHistory(): InterviewHistoryItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INTERVIEW_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveInterviewAttempt(item: InterviewHistoryItem): InterviewHistoryItem[] {
    const history = this.getInterviewHistory();
    const updated = [item, ...history];
    localStorage.setItem(STORAGE_KEYS.INTERVIEW_HISTORY, JSON.stringify(updated));
    return updated;
  },

  clearInterviewHistory(): void {
    localStorage.removeItem(STORAGE_KEYS.INTERVIEW_HISTORY);
  },

  getApplications(): ApplicationItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (!parsed[0].job_family || !parsed[0].status) {
            this.saveApplications(SYNTHETIC_SAMPLE_APPLICATIONS);
            return SYNTHETIC_SAMPLE_APPLICATIONS;
          }
          return parsed;
        }
      }
      return SYNTHETIC_SAMPLE_APPLICATIONS;
    } catch {
      return SYNTHETIC_SAMPLE_APPLICATIONS;
    }
  },

  saveApplications(apps: ApplicationItem[]): void {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
  },

  resetApplicationsToSynthetic(): ApplicationItem[] {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(SYNTHETIC_SAMPLE_APPLICATIONS));
    return SYNTHETIC_SAMPLE_APPLICATIONS;
  },

  resetToDemoData(): void {
    localStorage.removeItem(STORAGE_KEYS.CAREER_ANALYSIS);
    localStorage.setItem(STORAGE_KEYS.RESUME_INPUT, DEMO_RESUME);
    localStorage.setItem(STORAGE_KEYS.TARGET_ROLE, "Gen AI Engineer");
    localStorage.setItem(STORAGE_KEYS.JOB_DESCRIPTIONS, JSON.stringify(DEMO_JDS));
  }
};
