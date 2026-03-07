from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from database import embeddings, collection, get_cached_embedding
from cache import cache
import os
from dotenv import load_dotenv
from pathlib import Path
from langchain_community.document_loaders import TextLoader, PyPDFLoader, Docx2txtLoader, UnstructuredExcelLoader, UnstructuredPowerPointLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

load_dotenv(Path(__file__).parent / ".env")

llm = ChatGroq(model="openai/gpt-oss-20b", temperature=0.7, api_key=os.getenv("GROQ_API_KEY"))

def search_research_db(query: str, top_k: int = 3):
    # Check cache first
    cached_results = cache.get_cached_search_results(query)
    if cached_results:
        return cached_results

    query_embedding = get_cached_embedding(query)
    results = collection.query(query_embeddings=[query_embedding], n_results=top_k)

    formatted_results = [
        {
            "content": doc,
            "title": results["metadatas"][0][i].get("title", "Unknown"),
            "score": results["distances"][0][i],
        }
        for i, doc in enumerate(results["documents"][0])
    ]

    # Cache the results
    cache.cache_search_results(query, formatted_results)

    return formatted_results

def answer_research_question(query: str, mode: str = "research"):
    # Create cache key that includes both query and mode
    cache_key = f"answer:{mode}:{query}"

    # Check cache first
    cached_response = cache.get(cache_key)
    if cached_response:
        return cached_response

    chunks = search_research_db(query)
    
    # Define different prompt modes
    prompts = {
        "research": """
Based on the following context document(s), answer the researcher's question:

Research Context:
{context}

Researcher's Question: {question}

Answer: Provide a answer based on the context above.
If the context doesn't contain enough information to fully answer the question, say so clearly.
Only answer based on the provided context, do not make assumptions or provide additional information.
If the question is not related to the context, respond with "I don't have enough information in my
knowledge base to answer this question. Please try adding some documents first.".
Answer clearly and concisely, without unnecessary details.
""",
        
        "creative": """
Using the following context as inspiration and source material, respond creatively to the user's request:

Context Material:
{context}

User's Request: {question}

Feel free to be creative, elaborate, and go beyond the strict context when helpful.
You can make reasonable inferences and connections.
Make your response engaging and detailed while staying grounded in the source material.
""",
        
        "conversational": """
Based on the following context, have a natural conversation with the user:

Context:
{context}

User says: {question}

Respond in a friendly, conversational tone.
You can go beyond the strict context when it makes the conversation more natural.
If the context doesn't cover what they're asking, you can say so and offer to help with what you do know.
""",
        
        "analytical": """
Analyze the following context in relation to the user's question:

Context Data:
{context}

Analytical Question: {question}

Provide a detailed analysis that:
1. Directly addresses the question using the context
2. Breaks down complex information
3. Identifies key patterns or insights
4. Notes any limitations or gaps in the available information
Be thorough and systematic in your analysis.
""",
        
        "tutor": """
Act as a helpful tutor using the following study materials:

Study Materials:
{context}

Student's Question: {question}

As a tutor, you should:
1. Answer the question clearly based on the materials
2. Explain concepts step-by-step
3. Provide examples when helpful
4. Ask follow-up questions to check understanding
5. Encourage the student and make learning engaging
"""
    }
    
    # Select the appropriate prompt
    selected_prompt = prompts.get(mode, prompts["research"])
    
    if not chunks:
        response = ("I don't have enough information to answer this question.", [])
        cache.set(cache_key, response, ttl=1800)  # Cache for 30 minutes
        return response

    context = "\n\n".join([f"From {c['title']}:\n{c['content']}" for c in chunks])
    
    prompt = PromptTemplate(
        input_variables=["context", "question"],
        template=selected_prompt
    ).format(context=context, question=query)
    
    answer = llm.invoke(prompt).content
    response = (answer, chunks)

    # Cache the response for 30 minutes
    cache.set(cache_key, response, ttl=1800)

    return response

def ingest_document(file_path: str, original_filename: str):
    """Ingest a single document into the vector database"""
    try:
        # Load the document safely
        documents = safe_load_document(file_path)
        
        # Split into chunks
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=100
        )
        chunks = splitter.split_documents(documents)
        
        # Add to collection
        collection.add(
            documents=[c.page_content for c in chunks],
            metadatas=[
                {
                    "title": original_filename,
                    "chunk": i
                }
                for i in range(len(chunks))
            ],
            ids=[
                f"{original_filename}_{i}"
                for i in range(len(chunks))
            ]
        )
        
        return len(chunks)
    except Exception as e:
        raise Exception(f"Error ingesting document: {str(e)}")

def safe_load_document(filepath):
    """Safely load a document with different encodings and formats"""
    file_extension = os.path.splitext(filepath)[1].lower()
    
    try:
        if file_extension == '.pdf':
            return PyPDFLoader(filepath).load()
        elif file_extension in ['.docx', '.doc']:
            return Docx2txtLoader(filepath).load()
        elif file_extension in ['.xlsx', '.xls']:
            try:
                return UnstructuredExcelLoader(filepath).load()
            except ImportError as e:
                if 'msoffcrypto' in str(e):
                    raise Exception(f"Excel file support requires additional dependencies. Please install: pip install msoffcrypto-tool xlrd")
                else:
                    raise e
        elif file_extension in ['.pptx', '.ppt']:
            return UnstructuredPowerPointLoader(filepath).load()
        elif file_extension in ['.html', '.htm']:
            from langchain_community.document_loaders import UnstructuredHTMLLoader
            return UnstructuredHTMLLoader(filepath).load()
        else:
            # Try UTF-8 first, then latin-1 for text files
            try:
                return TextLoader(filepath, encoding='utf-8').load()
            except UnicodeDecodeError:
                return TextLoader(filepath, encoding='latin-1').load()
    except Exception as e:
        raise Exception(f"Error loading document {filepath}: {str(e)}")