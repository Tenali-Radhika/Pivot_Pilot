from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

router = APIRouter(prefix="/api/applications", tags=["applications"])

class ApplicationItem(BaseModel):
    id: str
    company: str
    role: str
    job_family: str
    date_applied: str
    source: str
    status: str = Field(description="applied, assessment, interview, offer, or rejected")
    is_synthetic: bool = True
    location: str = "Remote"
    salary_range: str = "$175,000 - $215,000"
    match_score: int = 85
    notes: str = ""
    key_requirements_met: List[str] = Field(default_factory=list)
    missing_requirements: List[str] = Field(default_factory=list)
    stage: Optional[str] = None

class PitchRequest(BaseModel):
    company: str
    role: str
    current_role: str = "Senior Frontend Engineer"
    candidate_strengths: List[str] = ["Real-time state", "FastAPI agent workflows", "Hybrid RAG"]

class PitchResponse(BaseModel):
    elevator_pitch: str
    key_selling_points: List[str]
    cover_note_hook: str

# 6 Sample Preloaded Applications visibly marked as synthetic demo data
SAMPLE_APPLICATIONS: List[ApplicationItem] = [
    ApplicationItem(
        id="app-synthetic-1",
        company="Anthropic Systems Labs",
        role="AI Solutions & Agentic Engineer",
        job_family="Generative AI & Agents",
        date_applied="2026-10-18",
        source="Referral",
        status="interview",
        is_synthetic=True,
        location="San Francisco / Remote",
        salary_range="$185,000 - $220,000",
        match_score=88,
        notes="Technical round scheduled: 45-min Voice & System Design session on LangGraph workflows, tool reliability, and SSE streaming.",
        key_requirements_met=["Python/FastAPI", "Agentic orchestration", "Streaming UX", "Wispr Flow voice input patterns"],
        missing_requirements=["Distributed Ray / Kubernetes experience"],
        stage="Technical Interview"
    ),
    ApplicationItem(
        id="app-synthetic-2",
        company="Cognition Vector AI",
        role="Autonomous Workflow Engineer",
        job_family="Generative AI & Agents",
        date_applied="2026-10-22",
        source="Company Careers",
        status="assessment",
        is_synthetic=True,
        location="New York / Hybrid",
        salary_range="$175,000 - $210,000",
        match_score=82,
        notes="Take-home assessment received: Build deterministic evaluator using Pydantic output validation and fallback mechanisms.",
        key_requirements_met=["Multi-agent state machines", "Pydantic validation", "TypeScript/Node"],
        missing_requirements=["Fine-tuning small language models"],
        stage="Screening"
    ),
    ApplicationItem(
        id="app-synthetic-3",
        company="Databricks Mosaic AI",
        role="Staff Generative AI Applications Engineer",
        job_family="Generative AI & Agents",
        date_applied="2026-10-12",
        source="Wellfound",
        status="offer",
        is_synthetic=True,
        location="San Francisco, CA / Remote",
        salary_range="$195,000 - $235,000",
        match_score=92,
        notes="Formal offer extended following 4-round interview loop. Base $205k + equity package. Evaluating decision timeline.",
        key_requirements_met=["Hybrid RAG architectures", "Vector search", "FastAPI production microservices", "Client-side telemetry"],
        missing_requirements=[],
        stage="Offer"
    ),
    ApplicationItem(
        id="app-synthetic-4",
        company="ScaleOps Intelligence",
        role="AI Platform Systems Engineer",
        job_family="Backend & Cloud Systems",
        date_applied="2026-10-25",
        source="LinkedIn",
        status="applied",
        is_synthetic=True,
        location="Remote (US / Canada)",
        salary_range="$170,000 - $200,000",
        match_score=78,
        notes="Application submitted with tailored elevator pitch highlighting full-stack observability and API rate limit protection.",
        key_requirements_met=["System architecture", "FastAPI microservices", "Containerization"],
        missing_requirements=["Kubernetes operator authoring"],
        stage="Applied"
    ),
    ApplicationItem(
        id="app-synthetic-5",
        company="Linear Dynamics Labs",
        role="Full-Stack AI Application Engineer",
        job_family="Full-Stack AI Engineering",
        date_applied="2026-10-08",
        source="Direct Pitch",
        status="interview",
        is_synthetic=True,
        location="Seattle, WA / Remote",
        salary_range="$180,000 - $215,000",
        match_score=90,
        notes="Hiring Manager screen completed with high commendation on portfolio projects. Advancing to team architectural pairing.",
        key_requirements_met=["WebSockets/SSE", "LangGraph", "Vector DB integration", "Strict schema generation"],
        missing_requirements=[],
        stage="Technical Interview"
    ),
    ApplicationItem(
        id="app-synthetic-6",
        company="Helix Core Infrastructure",
        role="Distributed Systems Backend Engineer",
        job_family="Backend & Cloud Systems",
        date_applied="2026-09-28",
        source="LinkedIn",
        status="rejected",
        is_synthetic=True,
        location="Austin, TX / Hybrid",
        salary_range="$165,000 - $190,000",
        match_score=72,
        notes="Automated rejection after resume screen. Role required 5+ years of C++ / low-level networking kernels.",
        key_requirements_met=["Python systems programming", "Linux fundamentals"],
        missing_requirements=["Low-level C++ / kernel bypass networking"],
        stage="Rejected"
    )
]

@router.get("/presets", response_model=List[ApplicationItem])
def get_preset_applications():
    """Returns 6 preloaded sample applications visibly marked as synthetic demo data."""
    return SAMPLE_APPLICATIONS

@router.post("/tailor-pitch", response_model=PitchResponse)
def tailor_pitch(req: PitchRequest):
    pitch = (
        f"\"With over 5 years architecting high-performance client applications, I bring a unique dual advantage to {req.company}: "
        f"I don't just build autonomous agent workflows in Python and LangGraph—I know how to deliver them into responsive, "
        f"deterministic user experiences that users actually trust. I've designed production agent systems with human-in-the-loop checkpoints, "
        f"hybrid RAG retrieval, and real-time streaming, and I'm eager to help {req.company} scale your {req.role} initiatives.\""
    )
    return PitchResponse(
        elevator_pitch=pitch,
        key_selling_points=[
            f"Bridges the gap between AI backend primitives and seamless user experience for {req.company}.",
            "Demonstrated portfolio code with state machines, hybrid retrieval, and automated Ragas evaluation.",
            "Proven track record of transitioning complex algorithmic concepts into intuitive client interfaces."
        ],
        cover_note_hook=(
            f"I was inspired by {req.company}'s work in generative AI systems. Having transitioned from full-stack architecture "
            f"to agentic engineering, I understand firsthand how to turn non-deterministic LLMs into reliable enterprise products."
        )
    )
