import chromadb
from cache import cache

DOCS_DIR = "sample_data"

# Initialize embeddings
try:
    from langchain_huggingface import HuggingFaceEmbeddings
    embeddings = HuggingFaceEmbeddings(
        model_name="avsolatorio/GIST-all-MiniLM-L6-v2"
    )
    EMBEDDINGS_AVAILABLE = True
    print("✅ Using HuggingFace embeddings")
except ImportError as e:
    print("⚠️  Warning: HuggingFace embeddings not available. Using ChromaDB default embeddings.")
    print(f"   Error: {e}")
    embeddings = None
    EMBEDDINGS_AVAILABLE = False

# Initialize ChromaDB
client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection(DOCS_DIR)

def get_cached_embedding(text: str) -> list:
    """Get embedding with Redis caching"""
    if not EMBEDDINGS_AVAILABLE:
        # Use ChromaDB's default embedding function
        return collection._embedding_function([text])[0]
    
    # Check cache first
    cached = cache.get_cached_embedding(text)
    if cached:
        return cached

    # Compute embedding
    embedding = embeddings.embed_query(text)

    # Cache the result
    cache.cache_embedding(text, embedding)

    return embedding