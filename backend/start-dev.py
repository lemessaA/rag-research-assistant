#!/usr/bin/env python3
"""
Development server startup script for RAG Research Assistant Backend
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    # Set environment to development
    os.environ["ENV"] = "development"
    
    print("🚀 Starting RAG Research Assistant Backend (Development Mode)")
    print("📁 Working directory:", os.getcwd())
    print("🔄 Auto-reload enabled")
    print("🌐 Backend will be available at: http://localhost:8000")
    print("📖 API Documentation: http://localhost:8000/docs")
    print()
    
    # Check if .env file exists
    env_file = Path(".env")
    if not env_file.exists():
        print("⚠️  No .env file found. Copy .env.example to .env and configure:")
        print("   cp .env.example .env")
        print()
    
    try:
        # Run uvicorn with development settings
        subprocess.run([
            sys.executable, "-m", "uvicorn",
            "app:app",
            "--host", "0.0.0.0",
            "--port", "8000",
            "--reload",
            "--reload-exclude", "uploads/*",
            "--reload-exclude", "chroma_data/*",
            "--access-log"
        ], check=True)
    except KeyboardInterrupt:
        print("\n👋 Backend server stopped")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()