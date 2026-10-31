from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

router = APIRouter(prefix="/api/roadmap", tags=["roadmap"])

class RoadmapMilestone(BaseModel):
    id: str
    phase: int
    title: str
    timeline: str
    status: str  # completed, in-progress, upcoming
    description: str
    key_deliverables: List[str]
    recommended_resources: List[Dict[str, str]]

class PortfolioProject(BaseModel):
    id: str
    title: str
    difficulty: str  # Intermediate, Advanced, Capstone
    duration: str
    pitch: str
    architecture: List[str]
    tech_stack: List[str]
    features: List[str]
    resume_bullet: str
    demo_objective: str
    completed: bool = False

class RoadmapResponse(BaseModel):
    target_role: str
    estimated_weeks: int
    phases: List[RoadmapMilestone]
    portfolio_projects: List[PortfolioProject]

@router.get("/current", response_model=RoadmapResponse)
@router.post("/generate", response_model=RoadmapResponse)
def get_roadmap(target_role: str = "AI Solutions & Agentic Engineer"):
    phases = [
        RoadmapMilestone(
            id="phase-1",
            phase=1,
            title="AI Systems Foundation & Structured Outputs",
            timeline="Weeks 1 - 2",
            status="completed",
            description="Bridge the gap between frontend REST APIs and non-deterministic LLM primitives. Master function calling and JSON schema guarantees.",
            key_deliverables=[
                "Implement strict schema validation with Pydantic and Instructor",
                "Construct error-handling retry loops for rate limits and JSON decode failures",
                "Deploy a low-latency streaming endpoint using SSE and FastAPI"
            ],
            recommended_resources=[
                {"title": "DeepLearning.AI: Functions & Tools in LLMs", "type": "Course", "url": "https://deeplearning.ai"},
                {"title": "FastAPI Real-time Streaming Patterns", "type": "Documentation", "url": "https://fastapi.tiangolo.com"}
            ]
        ),
        RoadmapMilestone(
            id="phase-2",
            phase=2,
            title="Multi-Agent Systems & StateGraph Orchestration",
            timeline="Weeks 3 - 5",
            status="in-progress",
            description="Move beyond linear prompts. Build stateful multi-agent workflows with cyclic graphs, branch merging, and dynamic tool routing.",
            key_deliverables=[
                "Build a LangGraph state machine with 3 distinct collaborative agents",
                "Implement persistent memory checkpoints and session rollbacks",
                "Add Human-in-the-Loop approval gate for destructive tool execution"
            ],
            recommended_resources=[
                {"title": "LangGraph Production Handbook", "type": "Guide", "url": "https://langchain-ai.github.io/langgraph"},
                {"title": "Anthropic: Building Effective Agents", "type": "Whitepaper", "url": "https://www.anthropic.com/research/building-effective-agents"}
            ]
        ),
        RoadmapMilestone(
            id="phase-3",
            phase=3,
            title="Hybrid RAG, Vector Search & Synthetic Evaluation",
            timeline="Weeks 6 - 8",
            status="upcoming",
            description="Scale context windows responsibly with hybrid sparse/dense retrieval, cross-encoder re-ranking, and automated evaluation metrics.",
            key_deliverables=[
                "Implement chunking strategies (semantic chunking + parent-child retrieval)",
                "Integrate reciprocal rank fusion (BM25 + Qdrant / Pinecone vectors)",
                "Set up continuous CI evaluation tracking Answer Faithfulness and Context Recall with Ragas"
            ],
            recommended_resources=[
                {"title": "Advanced RAG Techniques with LlamaIndex", "type": "Tutorial", "url": "https://docs.llamaindex.ai"},
                {"title": "Ragas: Evaluation Framework for RAG Pipelines", "type": "Framework", "url": "https://ragas.io"}
            ]
        ),
        RoadmapMilestone(
            id="phase-4",
            phase=4,
            title="Production Capstone, Voice Dictation & Market Launch",
            timeline="Weeks 9 - 10",
            status="upcoming",
            description="Deliver a polished, public-facing autonomous AI product. Fine-tune your voice narrative for high-stakes technical interviews.",
            key_deliverables=[
                "Deploy high-performance full-stack agent with end-to-end telemetry and token cost metrics",
                "Publish interactive open-source demo repository with architecture diagrams and benchmarks",
                "Pass 5 mock voice interviews with >85% STAR and Technical Depth scores"
            ],
            recommended_resources=[
                {"title": "OpenAI Swarm & Production Latency Optimizations", "type": "Cookbook", "url": "https://github.com/openai/swarm"},
                {"title": "Pivot Pilot Voice Mock Interview Module", "type": "Internal Simulator", "url": "#interviews"}
            ]
        )
    ]

    portfolio_projects = [
        PortfolioProject(
            id="proj-1",
            title="Agentic Code Auditor & Security Sentry",
            difficulty="Capstone",
            duration="2 Weeks",
            pitch="Autonomous GitHub Bot that intercepts Pull Requests, computes AST dependency graphs, executes security checks via specialized agents, and proposes inline diffs.",
            architecture=[
                "FastAPI Webhook listener for GitHub PR events",
                "LangGraph Multi-Agent Team (Security Auditor, Performance Profiler, Linter)",
                "Vector store containing repo architecture principles and style guide",
                "Automated PR comment generator with verified diff syntax"
            ],
            tech_stack=["Python", "FastAPI", "LangGraph", "GitHub API", "Qdrant", "Docker"],
            features=[
                "Multi-agent collaborative debate to eliminate false-positive security warnings",
                "Human-in-the-loop review mechanism via GitHub Reactions",
                "Sub-5-second execution using parallel agent sub-graphs"
            ],
            resume_bullet="Engineered an autonomous multi-agent code auditor using LangGraph and FastAPI, reducing PR review latency by 65% and intercepting 40+ synthetic security vulnerabilities.",
            demo_objective="Demonstrate live on screen: create a PR with an intentional SQL injection vulnerability and watch the agent intercept, comment, and suggest the exact parameterized fix.",
            completed=False
        ),
        PortfolioProject(
            id="proj-2",
            title="ContextGuard: Hybrid Enterprise RAG with Evals",
            difficulty="Advanced",
            duration="10 Days",
            pitch="High-fidelity financial document retrieval system with hybrid BM25 + dense vector search, cross-encoder re-ranking, and automated Ragas benchmark reports.",
            architecture=[
                "Semantic document chunker with table and metadata preservation",
                "Hybrid search engine combining lexical BM25 with dense embeddings",
                "Cohere Re-ranker stage for top-5 precision boosting",
                "Automated test harness comparing accuracy across 100 benchmark queries"
            ],
            tech_stack=["Python", "ChromaDB / Pinecone", "FastAPI", "Ragas", "React", "TailwindCSS"],
            features=[
                "Interactive evaluation dashboard showing Faithfulness, Answer Relevance, and Context Precision",
                "Visual citation viewer highlighting original PDF coordinates",
                "Zero-hallucination threshold with automatic uncertainty escalation"
            ],
            resume_bullet="Architected enterprise hybrid RAG engine with reciprocal rank fusion and automated Ragas evaluation suite, attaining 94% answer faithfulness on complex quarterly SEC 10-K filings.",
            demo_objective="Upload a 50-page financial filing, ask multi-step financial questions, and show the exact source attribution alongside continuous evaluation metrics.",
            completed=False
        ),
        PortfolioProject(
            id="proj-3",
            title="VoiceFlow: Conversational Voice-First Customer AI",
            difficulty="Intermediate",
            duration="1 Week",
            pitch="Sub-second latency voice assistant with real-time speech recognition, structured tool execution, and voice synthesis feedback.",
            architecture=[
                "Web Speech / Audio streaming frontend with live speech waveform",
                "Low-latency streaming FastAPI gateway with function-calling dispatch",
                "External API mock integration (Order status, calendar scheduling)",
                "Interruption handling and conversational state management"
            ],
            tech_stack=["React", "TypeScript", "FastAPI", "Web Speech API", "TailwindCSS"],
            features=[
                "Real-time voice turn-taking with live acoustic transcription",
                "Instant tool execution for real-world transaction handling",
                "STAR scoring rubric evaluation for conversational clarity"
            ],
            resume_bullet="Developed sub-second voice-first AI agent leveraging browser Web Speech APIs and streaming FastAPI endpoints, providing seamless natural language transaction dispatch.",
            demo_objective="Conduct a live voice booking conversation without typing a single character.",
            completed=True
        )
    ]

    return RoadmapResponse(
        target_role=target_role,
        estimated_weeks=10,
        phases=phases,
        portfolio_projects=portfolio_projects
    )

