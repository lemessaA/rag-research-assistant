import requests
import os

def test_file_upload():
    """Test the file upload endpoint"""
    
    # Create a test document
    test_content = """
    Artificial Intelligence and Machine Learning
    
    Artificial Intelligence (AI) is a branch of computer science that aims to create intelligent machines 
    that can perform tasks that typically require human intelligence. These tasks include learning, 
    reasoning, problem-solving, perception, and language understanding.
    
    Machine Learning (ML) is a subset of AI that focuses on the development of algorithms and statistical 
    models that enable computers to improve their performance on a specific task through experience, 
    without being explicitly programmed.
    
    Deep Learning is a subfield of machine learning that uses neural networks with multiple layers 
    to model and understand complex patterns in data. It has been particularly successful in areas 
    such as image recognition, natural language processing, and speech recognition.
    
    Applications of AI and ML include:
    - Healthcare: Disease diagnosis and drug discovery
    - Finance: Fraud detection and algorithmic trading
    - Transportation: Self-driving cars and route optimization
    - Entertainment: Recommendation systems and content generation
    """
    
    # Save test document
    test_file = "test_ai_document.txt"
    with open(test_file, "w", encoding="utf-8") as f:
        f.write(test_content)
    
    # Upload the file
    url = "http://localhost:8000/upload"
    
    with open(test_file, "rb") as f:
        files = {"file": (test_file, f, "text/plain")}
        response = requests.post(url, files=files)
    
    print(f"Upload Status: {response.status_code}")
    print(f"Upload Response: {response.json()}")
    
    # Test querying the uploaded document
    query_url = "http://localhost:8000/research"
    query_data = {"question": "What is Machine Learning?"}
    
    query_response = requests.post(query_url, json=query_data)
    print(f"\nQuery Status: {query_response.status_code}")
    print(f"Query Response: {query_response.json()}")
    
    # Clean up
    os.remove(test_file)

if __name__ == "__main__":
    test_file_upload()
