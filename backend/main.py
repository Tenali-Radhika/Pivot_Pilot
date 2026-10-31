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
    return {"status": "ok", "app": "Pivot Pilot", "version": "1.0.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)

