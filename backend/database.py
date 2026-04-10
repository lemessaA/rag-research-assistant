import os
from pathlib import Path
import chromadb
from cache import cache

DOCS_DIR = "sample_data"
CHROMA_PERSIST_DIRECTORY = Path(
    os.getenv("CHROMA_PERSIST_DIRECTORY", "./chroma_db")
)
CHROMA_PERSIST_DIRECTORY.mkdir(parents=True, exist_ok=True)

# Lazy-loaded embeddings
_embeddings_instance = None

def get_embeddings():
    """Lazy load the embedding model to prevent startup timeouts in the cloud."""
    global _embeddings_instance
    if _embeddings_instance is not None:
        return _embeddings_instance
    
    try:
        from langchain_huggingface import HuggingFaceEmbeddings
        print("📥 Initializing HuggingFace embeddings (this may take a moment on first run)...")
        _embeddings_instance = HuggingFaceEmbeddings(
            model_name="avsolatorio/GIST-all-MiniLM-L6-v2"
        )
        print("✅ HuggingFace embeddings ready")
        return _embeddings_instance
    except ImportError as e:
        print(f"⚠️  Warning: HuggingFace embeddings not available: {e}")
        return None
    except Exception as e:
        print(f"⚠️  Error initializing embeddings: {e}")
        return None

# Initialize ChromaDB
client = chromadb.PersistentClient(path=str(CHROMA_PERSIST_DIRECTORY))
collection = client.get_or_create_collection(DOCS_DIR)

def get_cached_embedding(text: str) -> list:
    """Get embedding with lazy loading and caching"""
    # Check cache first
    cached = cache.get_cached_embedding(text)
    if cached:
        return cached

    # Get model (lazy load)
    model = get_embeddings()
    
    if model is None:
        # Fallback to ChromaDB's default embedding function
        print("⚠️  Using ChromaDB default fallback embeddings")
        return collection._embedding_function([text])[0]

    # Compute embedding
    embedding = model.embed_query(text)

    # Cache the result
    cache.cache_embedding(text, embedding)

    return embedding