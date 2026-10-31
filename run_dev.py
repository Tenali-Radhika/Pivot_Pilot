"""
Pivot Pilot - Universal Dual Runner
Launches both the FastAPI backend and the Vite frontend concurrently.
"""
import subprocess
import sys
import time
import os
from pathlib import Path

# Load environment variables in parent runner so child processes inherit them
try:
    from dotenv import load_dotenv
    root_dir = Path(__file__).resolve().parent
    load_dotenv(dotenv_path=root_dir / ".env", override=False)
    load_dotenv(dotenv_path=root_dir / "backend" / ".env", override=False)
except ImportError:
    pass

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(root_dir, "frontend")

    print("=" * 60)
    print("  🚀 PIVOT PILOT — Voice-First AI Career Transition Agent")
    print("  Tagline: 'Turn career ambition into measurable progress.'")
    print("  Hackathon: Agentic AI Hackathon 2026")
    print("=" * 60)
    
    # Check configured provider
    has_gemini = bool(os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY"))
    has_anthropic = bool(os.environ.get("ANTHROPIC_API_KEY"))
    if has_gemini:
        print("  [AI Engine] Google Gemini API configured (Live AI Mode)")
    elif has_anthropic:
        print("  [AI Engine] Anthropic Claude API configured (Live AI Mode)")
    else:
        print("  [AI Engine] No API keys detected — Running Deterministic Demo Fallback Mode")
    print("=" * 60)

    print("\nStarting FastAPI Backend (http://127.0.0.1:8000)...")
    
    # Start backend
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
        cwd=root_dir,
        env=os.environ.copy()
    )

    time.sleep(2)

    print("Starting Vite React Frontend (http://localhost:5173)...")
    # Start frontend
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=frontend_dir,
        env=os.environ.copy()
    )

    print("\n✨ Both servers are live!")
    print("   👉 Frontend: http://localhost:5173")
    print("   👉 Backend API & Swagger Docs: http://127.0.0.1:8000/docs")
    print("\nPress Ctrl+C to terminate both servers.")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nStopping Pivot Pilot servers...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Done.")

if __name__ == "__main__":
    main()
