# RAG Research Assistant

A professional, production-ready Retrieval-Augmented Generation (RAG) system with separated backend and frontend services.

This application allows users to upload documents and ask questions about them using advanced AI models. It combines document processing, vector storage, semantic search, and intelligent question answering.

## 🏗️ Architecture

The system is built with a microservices architecture:

- **Backend**: FastAPI-based REST API with document processing and AI capabilities
- **Frontend**: Modern Next.js React application with responsive UI  
- **Database**: ChromaDB for vector storage and Redis for caching
- **Deployment**: Docker containers with Docker Compose orchestration

## ✨ Features

### Backend Features
- 📄 **Document Processing**: Support for PDF, DOCX, TXT, MD, XLSX, PPTX, HTML files
- 🤖 **AI-Powered Q&A**: Multiple response modes (research, creative, conversational, analytical, tutor)
- 💾 **Vector Storage**: ChromaDB for efficient document retrieval
- ⚡ **Redis Caching**: Fast caching for embeddings, search results, and LLM responses
- 🔧 **Auto Documentation**: OpenAPI/Swagger docs at `/docs`
- 📊 **Monitoring**: Health checks and cache statistics

### Frontend Features
- ⚡ **Next.js 14**: Modern React framework with App Router
- 🎨 **Beautiful UI**: Tailwind CSS with responsive design
- 📤 **Drag & Drop**: Intuitive file upload with progress indicators
- 💬 **Chat Interface**: Real-time conversation with message history
- 🎯 **Response Modes**: Toggle between different AI response styles
- 📱 **Mobile Friendly**: Responsive design for all devices

## 🚀 Quick Start

### Option 1: Development Mode (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd rag-research-assistant

# Run the development setup script
chmod +x start-dev.sh
./start-dev.sh

# Choose option 3 to start both services
```

### Option 2: Docker Compose (Production-like)
```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Edit backend/.env with your OpenAI API key
# OPENAI_API_KEY=your_key_here

# Start all services
docker-compose up --build

# Services will be available at:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Backend Docs: http://localhost:8000/docs
```

### Option 3: Manual Setup

#### Backend Setup
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your configuration

# Start backend
python start-dev.py
# Backend available at http://localhost:8000
```

#### Frontend Setup
```bash
cd frontend

# Install Node.js dependencies
npm install

# Copy and configure environment
cp .env.example .env.local
# Edit .env.local if backend URL differs

# Start frontend
npm run dev
# Frontend available at http://localhost:3000
```

## 📁 Project Structure

```
rag-research-assistant/
├── backend/                 # FastAPI backend service
│   ├── main.py             # FastAPI application
│   ├── rag_service.py      # Core RAG functionality
│   ├── database.py         # Vector database operations
│   ├── cache.py            # Redis caching
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile          # Backend container
│   └── start-dev.py        # Development server
├── frontend/               # Next.js frontend service
│   ├── src/
│   │   ├── app/           # Next.js app router
│   │   ├── components/    # React components
│   │   ├── lib/          # API client and utilities
│   │   └── types/        # TypeScript definitions
│   ├── package.json       # Node.js dependencies
│   ├── Dockerfile         # Frontend container
│   └── start-dev.js       # Development server
├── docker-compose.yml     # Multi-service deployment
├── start-dev.sh          # Development startup script
└── README.md             # This file
```

## 🔧 Configuration

### Backend Environment Variables
```env
# Backend Configuration
HOST=0.0.0.0
PORT=8000
ENV=production

# CORS Configuration  
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Redis Configuration (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Frontend Environment Variables
```env
# Frontend Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## 🎯 Response Modes

Choose from different AI response styles:

- 🔬 **Research**: Precise, context-based answers with citations
- 🎨 **Creative**: Elaborate and engaging responses with storytelling
- 💬 **Conversational**: Friendly, natural dialogue style
- 📊 **Analytical**: Detailed breakdown with structured insights
- 👨‍🏫 **Tutor**: Educational, step-by-step explanations

## 📤 Supported File Types

- **Text Files**: `.txt`, `.md`
- **Documents**: `.pdf`, `.docx`, `.doc`
- **Spreadsheets**: `.xlsx`, `.xls`
- **Presentations**: `.pptx`, `.ppt`
- **Web Files**: `.html`, `.htm`

Maximum file size: 10MB

## 🚢 Deployment

### Docker Deployment
```bash
# Production deployment with Docker Compose
docker-compose -f docker-compose.yml up -d

# Scale services if needed
docker-compose up -d --scale backend=2
```

### Render + Vercel

#### Backend on Render
1. Push this repo to GitHub.
2. In Render, create a new Blueprint or Web Service from the repo.
3. If you use the Blueprint flow, Render will pick up `render.yaml` automatically and deploy the `backend` service.
4. Set `GROQ_API_KEY` in Render before the first deploy.
5. Keep the persistent disk enabled so Chroma data and uploaded files survive restarts.

Recommended backend environment values:
- `ENV=production`
- `CHROMA_PERSIST_DIRECTORY=/var/data/chroma_db`
- `UPLOADS_DIR=/var/data/uploads`
- `ALLOWED_ORIGIN_REGEX=https://.*\.vercel\.app`

Notes:
- The backend health check is `GET /health`.
- Render persistent disks require a paid web service plan.
- If you use a Vercel custom domain, add that domain to `ALLOWED_ORIGINS`.

#### Frontend on Vercel
1. Import the same GitHub repo into Vercel.
2. Set the project Root Directory to `frontend`.
3. Add `BACKEND_URL=https://your-render-backend.onrender.com`.
4. Do not set `NEXT_PUBLIC_BACKEND_URL` in Vercel. Production traffic should go through the frontend's `/api` proxy.
5. Deploy.

Why this setup works:
- Browser requests go to the Vercel frontend at `/api/...`
- Next.js rewrites those requests to the Render backend using `BACKEND_URL`
- This avoids direct browser-to-Render CORS issues for the main app flow

## 🔍 API Documentation

When the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

- `POST /research` - Ask research questions
- `POST /upload` - Upload documents
- `GET /health` - Health check
- `GET /cache/stats` - Cache statistics
- `POST /cache/clear` - Clear cache

## 🔧 Development

### Backend Development
```bash
cd backend
python start-dev.py  # Auto-reload enabled
```

### Frontend Development
```bash
cd frontend
npm run dev  # Hot reloading enabled
```

### Running Tests
```bash
# Backend tests
cd backend && python -m pytest test_*.py

# Frontend tests (if added)
cd frontend && npm test
```

## 📊 Performance

- **Caching**: Redis caching for embeddings, search results, and AI responses
- **Vector Search**: Efficient ChromaDB similarity search
- **Async Processing**: FastAPI async endpoints for better concurrency
- **Code Splitting**: Next.js automatic code splitting
- **Image Optimization**: Next.js built-in image optimization

## 🛠️ Troubleshooting

### Common Issues

1. **Backend not starting**
   - Check Python version (3.8+ required)
   - Verify OpenAI API key in `.env`
   - Check if port 8000 is available

2. **Frontend connection issues**
   - Verify `NEXT_PUBLIC_BACKEND_URL` in `.env.local`
   - Check if backend is running on correct port
   - Review CORS settings in backend

3. **File upload failures**
   - Check file size (max 10MB)
   - Verify file type is supported
   - Ensure uploads directory exists and is writable

4. **Redis connection issues**
   - Redis is optional - app works without it
   - Check Redis host/port in backend `.env`
   - Use Docker Compose for automatic Redis setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

## 🆘 Support

- Create an issue for bug reports
- Check the documentation in `/docs` endpoints
- Review component READMEs in `backend/` and `frontend/` directories

---

Built with ❤️ using FastAPI, Next.js, ChromaDB, and OpenAI