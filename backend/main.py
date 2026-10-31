import os
from pathlib import Path

# Reliably load .env from root and backend directories before any routes are loaded
try:
    from dotenv import load_dotenv
    # 1. Project root .env
    root_env = Path(__file__).resolve().parent.parent / ".env"
    if root_env.exists():
        load_dotenv(dotenv_path=root_env, override=False)

    # 2. backend/.env
    backend_env = Path(__file__).resolve().parent / ".env"
    if backend_env.exists():
        load_dotenv(dotenv_path=backend_env, override=False)

    # 3. Current working directory fallback
    load_dotenv(override=False)
except ImportError:
    pass

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import analyzer, roadmap, interview, applications, career_intelligence

app = FastAPI(
    title="Pivot Pilot API",
    description="Agentic Career Pivot Coach API for the Agentic AI Hackathon 2026. Turn career ambition into measurable progress.",
    version="1.0.0"
)

# Configure CORS so Vite React frontend can communicate seamlessly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(career_intelligence.router)
app.include_router(analyzer.router)
app.include_router(roadmap.router)
app.include_router(interview.router)
app.include_router(applications.router)

@app.get("/")
def root():
    return {
        "app": "Pivot Pilot",
        "tagline": "Turn career ambition into measurable progress.",
        "hackathon": "Agentic AI Hackathon 2026",
        "problem_statement": "Career Pivot Coach",
        "status": "healthy",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    provider = career_intelligence.get_configured_llm_provider()
    return {
        "status": "ok",
        "app": "Pivot Pilot",
        "version": "1.0.0",
        "configured_provider": provider if provider else "deterministic_fallback",
        "is_live_ai": bool(provider)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
