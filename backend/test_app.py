from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_research_endpoint():
    response = client.post("/research", json={"question": "What is FastAPI?"})
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "sources" in data

def test_root():
    response = client.get("/")
    assert response.status_code == 200

if __name__ == "__main__":
    # Run tests manually
    print("Testing research endpoint...")
    response = client.post("/research", json={"question": "What is FastAPI?"})
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
