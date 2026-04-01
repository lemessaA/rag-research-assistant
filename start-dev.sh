#!/bin/bash

# RAG Research Assistant - Development Environment Startup Script

set -e

echo "🔍 RAG Research Assistant - Development Environment"
echo "=================================================="
echo

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
echo "🔧 Checking dependencies..."

if ! command_exists python3; then
    echo "❌ Python 3 is required but not installed"
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is required but not installed"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is required but not installed"
    exit 1
fi

echo "✅ All dependencies found"
echo

# Setup environment files
echo "⚙️  Setting up environment files..."

if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend/.env from example..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env with your configuration"
fi

if [ ! -f "frontend/.env.local" ]; then
    echo "📝 Creating frontend/.env.local from example..."
    cp frontend/.env.example frontend/.env.local
fi

echo "✅ Environment files ready"
echo

# Option menu
echo "Choose what to start:"
echo "1) Backend only (FastAPI on port 8000)"
echo "2) Frontend only (Next.js on port 3000)"
echo "3) Both services (recommended for full development)"
echo "4) Docker Compose (production-like environment)"
echo

read -p "Enter your choice [3]: " choice
choice=${choice:-3}

case $choice in
    1)
        echo "🚀 Starting Backend only..."
        cd backend && python3 start-dev.py
        ;;
    2)
        echo "🚀 Starting Frontend only..."
        cd frontend && node start-dev.js
        ;;
    3)
        echo "🚀 Starting both Backend and Frontend..."
        echo "⚡ This will open two terminals"
        
        # Start backend in background
        echo "🔧 Starting Backend..."
        cd backend && python3 start-dev.py &
        BACKEND_PID=$!
        
        # Wait a moment for backend to start
        sleep 3
        
        # Start frontend in foreground
        echo "🎨 Starting Frontend..."
        cd ../frontend && node start-dev.js &
        FRONTEND_PID=$!
        
        # Wait for both processes
        wait $BACKEND_PID $FRONTEND_PID
        ;;
    4)
        echo "🐳 Starting with Docker Compose..."
        if ! command_exists docker; then
            echo "❌ Docker is required but not installed"
            exit 1
        fi
        docker-compose up --build
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac