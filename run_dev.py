"""
Pivot Pilot - Universal Dual Runner
Launches both the FastAPI backend and the Vite frontend concurrently.
"""
import subprocess
import sys
import time
import os

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_dir = os.path.join(root_dir, "frontend")

    print("=" * 60)
    print("  🚀 PIVOT PILOT — Voice-First AI Career Transition Agent")
    print("  Tagline: 'Turn career ambition into measurable progress.'")
    print("  Hackathon: Agentic AI Hackathon 2026")
    print("=" * 60)
    print("\nStarting FastAPI Backend (http://127.0.0.1:8000)...")
    
    # Start backend
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
        cwd=root_dir
    )

    time.sleep(2)

    print("Starting Vite React Frontend (http://localhost:5173)...")
    # Start frontend
    npm_cmd = "npm.cmd" if os.name == "nt" else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev"],
        cwd=frontend_dir
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

