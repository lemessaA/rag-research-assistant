import chromadb
from langchain_huggingface import HuggingFaceEmbeddings
from cache import cache

DOCS_DIR = "sample_data"

# Initialize embeddings
embeddings = HuggingFaceEmbeddings(
    model_name="avsolatorio/GIST-all-MiniLM-L6-v2"
)

# Initialize ChromaDB
client = chromadb.PersistentClient(path="./chroma_db")
collection = client.get_or_create_collection(DOCS_DIR)

def get_cached_embedding(text: str) -> list:
    """Get embedding with Redis caching"""
    # Check cache first
    cached = cache.get_cached_embedding(text)
    if cached:
        return cached

    # Compute embedding
    embedding = embeddings.embed_query(text)

    # Cache the result
    cache.cache_embedding(text, embedding)

    return embedding