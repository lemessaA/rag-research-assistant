# RAG Research Assistant

A FastAPI-based Research Assistant with RAG (Retrieval-Augmented Generation) capabilities and Streamlit UI.

## Features

- 📄 **Document Upload**: Support for PDF, TXT, Markdown, Word, Excel, PowerPoint, and HTML files
- 🔍 **Intelligent Search**: RAG-powered question answering
- 🎨 **Beautiful UI**: Streamlit interface for easy interaction
- 📚 **Source Citations**: Answers include source references with relevance scores
- 🚀 **FastAPI Backend**: High-performance API with automatic documentation
- ⚡ **Redis Caching**: Fast caching for embeddings, search results, and LLM responses

## Quick Start

### 1. Setup Environment

```bash
# Clone the repository
git clone https://github.com/lemessaA/fastapi.git
cd fastapi

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
GROQ_API_KEY="your_groq_api_key_here"
REDIS_URL=redis://localhost:6379
```

Get your API key from [Groq Console](https://console.groq.com/).

### 3. Set Up Redis (Optional but Recommended)

Redis provides caching for better performance. Run the setup helper:

```bash
python redis_setup.py
```

Or install and start Redis manually:

**Ubuntu/Debian:**
```bash
sudo apt update && sudo apt install redis-server
sudo systemctl start redis-server
```

**macOS:**
```bash
brew install redis
brew services start redis
```

**Test Redis:**
```bash
redis-cli ping  # Should respond with "PONG"
```

### 3. Populate Initial Data

```bash
python setup_data.py
```

### 4. Start the Backend Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 5. Start the Streamlit UI

In a new terminal:

```bash
source .venv/bin/activate
streamlit run streamlit_app.py
```

The UI will be available at http://localhost:8501

## Caching with Redis

Redis caching significantly improves performance by storing:

- **Embeddings**: Text embeddings are cached for 24 hours
- **Search Results**: Vector search results cached for 30 minutes  
- **LLM Responses**: Generated answers cached for 30 minutes

### Cache Management

**View cache statistics:**
```bash
curl http://localhost:8000/cache/stats
```

**Clear all cached data:**
```bash
curl -X POST http://localhost:8000/cache/clear
```

**Benefits:**
- ⚡ Faster response times for repeated queries
- 💰 Reduced API costs (fewer LLM calls)
- 🔄 Better user experience
- 📊 Cache hit statistics available via API

## Usage

### Via Streamlit UI (Recommended)

1. Open http://localhost:8501 in your browser
2. Upload documents using the file uploader
3. Ask questions about your documents
4. View answers with source citations

### Via API

**Upload a document:**
```bash
curl -X POST "http://localhost:8000/upload" \
-F "file=@your_document.pdf"
```

**Ask a question:**
```bash
curl -X POST "http://localhost:8000/research" \
-H "Content-Type: application/json" \
-d '{"question": "What is Machine Learning?"}'
```

## API Endpoints

- `GET /` - Health check
- `POST /research` - Ask questions about documents
- `POST /upload` - Upload and process documents
- `POST /cache/clear` - Clear all cached data
- `GET /cache/stats` - Get cache statistics

## Supported File Formats

- **PDF** (.pdf)
- **Text** (.txt)
- **Markdown** (.md)
- **Word** (.docx, .doc)
- **Excel** (.xlsx, .xls)
- **PowerPoint** (.pptx, .ppt)
- **HTML** (.html, .htm)

## Architecture

```
├── main.py              # FastAPI application
├── rag_service.py       # RAG logic and LLM integration
├── database.py          # Vector database setup
├── cache.py             # Redis caching layer
├── setup_data.py        # Initial data ingestion
├── redis_setup.py       # Redis setup helper
├── streamlit_app.py     # Streamlit UI
├── requirements.txt     # Python dependencies
└── sample_data/         # Sample documents
```

## Technology Stack

- **Backend**: FastAPI, Uvicorn
- **Frontend**: Streamlit
- **Vector Database**: ChromaDB
- **Cache**: Redis
- **Embeddings**: HuggingFace Transformers
- **LLM**: Groq (Llama models)
- **Document Processing**: LangChain

## Development

### Running Tests

```bash
python test_app.py        # Test API endpoints
python test_upload.py    # Test file upload
```

### Adding New Features

1. Backend changes go in `main.py` or `rag_service.py`
2. UI changes go in `streamlit_app.py`
3. New document loaders can be added to `rag_service.py`

## Troubleshooting

**Backend not connecting:**
- Make sure the FastAPI server is running on port 8000
- Check that all dependencies are installed

**Upload issues:**
- Verify file format is supported
- Check file size (large files may take time to process)

**Poor answer quality:**
- Upload more relevant documents
- Try rephrasing your question
- Check that documents contain relevant information

## License

This project is open source and available under the [MIT License](LICENSE).