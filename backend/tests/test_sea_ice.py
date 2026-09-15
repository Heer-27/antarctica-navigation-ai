from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_current_sea_ice():
    response = client.get("/api/sea-ice/current")
    assert response.status_code == 200
    data = response.json()
    assert "averageConcentration" in data
    assert 0.0 <= data["averageConcentration"] <= 100.0
    assert "regionalZones" in data
    assert len(data["regionalZones"]) > 0

def test_get_sea_ice_forecast():
    response = client.get("/api/sea-ice/forecast?horizon=24h")
    assert response.status_code == 200
    data = response.json()
    assert data["forecastHorizon"] == "24h"
    assert "confidence" in data
    assert len(data["regionalZones"]) > 0

def test_get_sea_ice_history():
    response = client.get("/api/sea-ice/history?latitude=-70.5&longitude=-45.0&days=14")
    assert response.status_code == 200
    data = response.json()
    assert "points" in data
    assert len(data["points"]) >= 14
    assert "stats" in data
    assert "trendPercent" in data["stats"]
