# RAG Research Assistant - Backend

FastAPI-based backend service for the RAG Research Assistant application.

## Features

- 🔍 **Document Processing**: Support for multiple file formats (PDF, DOCX, TXT, etc.)
- 🤖 **AI-Powered Q&A**: Multiple response modes (research, creative, conversational, etc.)
- 💾 **Vector Storage**: ChromaDB for efficient document retrieval
- ⚡ **Caching**: Redis-based caching for improved performance
- 📊 **Monitoring**: Health checks and cache statistics
- 🔧 **API Documentation**: Auto-generated OpenAPI/Swagger docs

## Quick Start

### Development
```bash
# Install dependencies
pip install .

# Copy and configure environment
cp .env.example .env
# Edit .env with your configuration

# Start development server
python start-dev.py
# or
python main.py
```

### Production
```bash
# Using Docker
docker build -t rag-backend .
docker run -p 8000:8000 --env-file .env rag-backend

# Using uvicorn directly
ENV=production uvicorn main:app --host 0.0.0.0 --port 8000
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `8000` |
| `ENV` | Environment (development/production) | `production` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `*` |
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |

## API Endpoints

### Core Endpoints
- `GET /` - API status
- `GET /health` - Health check
- `GET /docs` - API documentation

### Research Endpoints
- `POST /research` - Ask research questions
- `POST /upload` - Upload documents

### Cache Management
- `POST /cache/clear` - Clear all cache
- `GET /cache/stats` - Get cache statistics

## File Support

Supported file formats:
- Text: `.txt`, `.md`
- Documents: `.pdf`, `.docx`, `.doc`
- Spreadsheets: `.xlsx`, `.xls`
- Presentations: `.pptx`, `.ppt`
- Web: `.html`, `.htm`

## Deployment

### Docker
```bash
docker build -t rag-backend .
docker run -d -p 8000:8000 --name rag-backend rag-backend
```

### Docker Compose (with Redis)
```bash
# From project root
docker-compose up -d backend redis
```

## Development

### Running Tests
```bash
python -m pytest test_*.py
```

### Code Structure
- `main.py` - FastAPI application and routes
- `rag_service.py` - Core RAG functionality
- `database.py` - Vector database operations
- `cache.py` - Redis caching layer
- `setup_data.py` - Data initialization utilities

## Troubleshooting

1. **Import errors**: Make sure all dependencies are installed
2. **Redis connection**: Ensure Redis is running or disable caching
3. **OpenAI API**: Verify your API key is set correctly
4. **File uploads**: Check file permissions in uploads directory