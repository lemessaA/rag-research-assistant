from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List
from rag_service import answer_research_question
from cache import cache
import os
import uuid

app = FastAPI(title="Research Assistant API")

class ResearchRequest(BaseModel):
    question: str
    mode: str = "research"  # Default to research mode

class Source(BaseModel):
    title: str
    content: str
    score: float

class ResearchResponse(BaseModel):
    answer: str
    sources: List[Source]

class UploadResponse(BaseModel):
    message: str
    filename: str
    chunks_created: int

@app.post("/research", response_model=ResearchResponse)
async def ask_research_question(request: ResearchRequest):
    try:
        answer, sources = answer_research_question(request.question, request.mode)
        formatted = [
            Source(
                title=s["title"],
                content=s["content"][:200] + "..." if len(s["content"]) > 200 else s["content"],
                score=s["score"]
            ) for s in sources
        ]
        return ResearchResponse(answer=answer, sources=formatted)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload", response_model=UploadResponse)
async def upload_document(file: UploadFile = File(...)):
    try:
        # Create uploads directory if it doesn't exist
        uploads_dir = "uploads"
        os.makedirs(uploads_dir, exist_ok=True)
        
        # Generate unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(uploads_dir, unique_filename)
        
        # Save uploaded file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Process and ingest the document
        from rag_service import ingest_document
        chunks_created = ingest_document(file_path, file.filename)
        
        return UploadResponse(
            message=f"Document '{file.filename}' uploaded and processed successfully",
            filename=file.filename,
            chunks_created=chunks_created
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/cache/clear")
async def clear_cache():
    """Clear all cached data"""
    try:
        success = cache.clear_all_cache()
        if success:
            return {"message": "Cache cleared successfully"}
        else:
            return {"message": "Cache clearing failed or Redis not available"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cache/stats")
async def get_cache_stats():
    """Get cache statistics"""
    try:
        if not cache.redis_client:
            return {"status": "Redis not connected", "stats": {}}

        info = cache.redis_client.info()
        keys = cache.redis_client.keys("*")

        embedding_keys = [k for k in keys if k.startswith("embedding:")]
        search_keys = [k for k in keys if k.startswith("search:")]
        answer_keys = [k for k in keys if k.startswith("answer:")]

        return {
            "status": "connected",
            "stats": {
                "total_keys": len(keys),
                "embedding_cache_keys": len(embedding_keys),
                "search_cache_keys": len(search_keys),
                "answer_cache_keys": len(answer_keys),
                "redis_info": {
                    "used_memory": info.get("used_memory_human", "N/A"),
                    "connected_clients": info.get("connected_clients", "N/A"),
                    "uptime_days": info.get("uptime_in_days", "N/A")
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Research Assistant API is running! Visit /docs for docs."}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "rag-backend"}
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
