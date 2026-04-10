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

def get_llm():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or api_key == "your_groq_api_key_here":
        # Return a mock or handle it gracefully
        print("⚠️  Warning: GROQ_API_KEY is missing. LLM features will be unavailable.")
        return None
    return ChatGroq(model="openai/gpt-oss-20b", temperature=0.7, api_key=api_key)

llm = get_llm()


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
    
    # Define different prompt modes with professional formatting
    formatting_instructions = """
You are an expert content formatter. All your outputs must strictly follow these rules:

1. Headings  
   - Use Markdown-style headings only: `#` for main titles, `##` for subheadings.  
   - No deeper levels unless explicitly asked.

2. Bulleted Lists  
   - Use emoji bullets before each item. Examples:  
     - ✅ for completed tasks or confirmed facts
     - 🔥 for priorities or urgent points  
     - 💡 for ideas or suggestions  
     - 📊 for data points or statistics
     - ⚠️ for warnings or limitations
     - 🎯 for key insights or conclusions
   - Keep each bullet concise (one sentence or phrase).  
   - Maximum 5 bullets per list unless instructed otherwise.  

3. Numbered Lists  
   - Only when explicitly requested. Numbers followed by period and space: `1. Item`.  

4. Inline Styling  
   - Bold important words with `bold`.  
   - Italics only for emphasis with `italics`.  

5. Output Structure  
   - Begin with a main title `#`  
   - Follow with `##` subheadings  
   - Under each subheading, include properly formatted bullet lists with emojis.  
   - No extra text outside headings or bullets unless instructed.

6. Tone  
   - Keep tone professional, clear, and readable.

Always follow this format exactly unless instructed otherwise.

"""

    prompts = {
        "research": formatting_instructions + """
Based on the following context document(s), answer the researcher's question:

Research Context:
{context}

Researcher's Question: {question}

Instructions: Provide a precise research answer based on the context above. Format your response with:
- A clear main heading for your answer
- Subheadings for different aspects
- Emoji bullet points for key findings
- Bold important terms and findings

If the context doesn't contain enough information, clearly state this with ⚠️ bullets.
Only answer based on the provided context, do not make assumptions.
If the question is not related to the context, respond with "I don't have enough information in my knowledge base to answer this question. Please try adding some documents first."
""",
        
        "creative": formatting_instructions + """
Using the following context as inspiration and source material, respond creatively to the user's request:

Context Material:
{context}

User's Request: {question}

Instructions: Create an engaging and creative response that goes beyond basic facts. Format your response with:
- An inspiring main heading
- Creative subheadings that tell a story
- 💡 bullets for innovative ideas and insights
- 🎨 bullets for creative interpretations
- Bold key concepts and creative connections

Feel free to be elaborate and make reasonable inferences while staying grounded in the source material.
Make your response engaging and detailed.
""",
        
        "conversational": formatting_instructions + """
Based on the following context, have a natural conversation with the user:

Context:
{context}

User says: {question}

Instructions: Respond in a friendly, conversational tone while maintaining professional formatting:
- Use a welcoming main heading
- Organize thoughts with conversational subheadings
- 💬 bullets for main conversation points
- 🤝 bullets for helpful suggestions
- Bold important points naturally

You can go beyond the strict context when it makes the conversation more natural.
If the context doesn't cover what they're asking, use ⚠️ bullets to explain and offer alternatives.
""",
        
        "analytical": formatting_instructions + """
Analyze the following context in relation to the user's question:

Context Data:
{context}

Analytical Question: {question}

Instructions: Provide a detailed analytical breakdown with structured formatting:
- Clear analytical heading
- Systematic subheadings for different analysis aspects
- 📊 bullets for data points and statistics
- 🎯 bullets for key insights and patterns
- ⚠️ bullets for limitations or gaps in information
- Bold critical findings and metrics

Be thorough and systematic in your analysis, addressing all aspects of the question.
""",
        
        "tutor": formatting_instructions + """
Act as a helpful tutor using the following study materials:

Study Materials:
{context}

Student's Question: {question}

Instructions: Create a comprehensive educational response formatted for learning:
- Encouraging main heading that welcomes the student
- Clear subheadings for different learning concepts
- ✅ bullets for confirmed facts and completed steps
- 💡 bullets for key learning points and insights
- 🎓 bullets for educational tips and study suggestions
- Bold important terms and concepts that students should remember

Explain concepts step-by-step, provide examples when helpful, and make learning engaging.
End with encouragement and potential follow-up questions.
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
    
    if llm is None:
        return ("⚠️ Error: AI Assistant is not configured. Please set the GROQ_API_KEY in your environment variables.", [])
    
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