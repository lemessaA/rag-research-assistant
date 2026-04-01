
# and converting them into LangChain Document objects
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

import os

from database import collection, DOCS_DIR


def safe_load_markdown(filepath):
    # This function loads a markdown file safely
    # The problem it solves:
    # Some files are UTF-8 encoded, others are not
    # If you guess wrong, Python throws UnicodeDecodeError and dies

    try:
        # Attempt to load the file using UTF-8 encoding
        # TextLoader.load() returns a list of Document objects
        return TextLoader(
            filepath,
            encoding='utf-8'
        ).load()

    except UnicodeDecodeError:
        # If UTF-8 decoding fails, retry using latin-1 encoding
        # latin-1 can decode almost any byte sequence without error
        # This prevents ingestion from crashing on weird files
        return TextLoader(
            filepath,
            encoding='latin-1'
        ).load()


def ingest_documents():
    # This function is responsible for:
    # 1. Reading markdown files
    # 2. Splitting them into chunks
    # 3. Storing them in the vector database

    # Create a RecursiveCharacterTextSplitter instance
    splitter = RecursiveCharacterTextSplitter(

        # chunk_size defines the maximum number of characters per chunk
        # 1000 is a common balance between context richness and embedding cost
        chunk_size=1000,

        # chunk_overlap defines how many characters overlap between chunks
        # This prevents important context from being cut off at boundaries
        # Example: chunk1 ends at char 1000, chunk2 starts at char 900
        chunk_overlap=100
    )

    # Loop over every file in the DOCS_DIR directory
    for filename in os.listdir(DOCS_DIR):

        # Skip files that are not markdown
        # continue immediately jumps to the next loop iteration
        if not filename.endswith(".md"):
            continue

        # Construct the full file path in a cross-platform safe way
        filepath = os.path.join(DOCS_DIR, filename)

        # Load the markdown file into LangChain Document objects
        # safe_load_markdown returns a list of Document instances
        documents = safe_load_markdown(filepath)

        # Split the documents into smaller chunks
        # Each chunk is still a Document object
        chunks = splitter.split_documents(documents)

        # Add the chunks into the ChromaDB collection
        collection.add(

            # documents expects a list of strings
            # page_content contains the raw text of each chunk
            documents=[c.page_content for c in chunks],

            # metadatas is a list of dictionaries, one per document
            # This metadata is stored alongside embeddings
            # and can be used for filtering or source attribution
            metadatas=[
                {
                    "title": filename,  # original file name
                    "chunk": i          # chunk index within the file
                }
                for i in range(len(chunks))
            ],

            # ids must be unique identifiers for each document
            # Here you combine filename + chunk index
            # This prevents collisions across files
            ids=[
                f"{filename}_{i}"
                for i in range(len(chunks))
            ]
        )

if __name__ == "__main__":
    ingest_documents()
