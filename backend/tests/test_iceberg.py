from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_all_icebergs():
    response = client.get("/api/icebergs")
    assert response.status_code == 200
    data = response.json()
    assert "icebergs" in data
    assert len(data["icebergs"]) > 0
    first_berg = data["icebergs"][0]
    assert "id" in first_berg
    assert "latitude" in first_berg
    assert "longitude" in first_berg

def test_get_single_iceberg():
    response = client.get("/api/icebergs/A-017")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "A-017"
    assert "length" in data
    assert "speed" in data

def test_get_iceberg_trajectory():
    response = client.get("/api/icebergs/A-017/trajectory?forecast_hours=6,12,24,48")
    assert response.status_code == 200
    data = response.json()
    assert "trajectory" in data
    assert len(data["trajectory"]) >= 4
    first_point = data["trajectory"][0]
    assert "latitude" in first_point
    assert "probability" in first_point
