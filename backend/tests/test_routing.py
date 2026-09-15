from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_route_optimize_endpoint():
    payload = {
        "startLat": -64.82,
        "startLon": -58.25,
        "destLat": -67.57,
        "destLon": -68.13,
        "weights": {
            "safety": 70,
            "fuel": 20,
            "time": 10
        }
    }
    response = client.post("/api/route/optimize", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "recommendedRoute" in data
    assert "options" in data
    assert len(data["options"]) == 4
    assert "decisionExplanation" in data
    assert "segments" in data
    assert "timeline" in data

    rec = data["recommendedRoute"]
    assert rec["distanceKm"] > 0
    assert len(rec["waypoints"]) >= 2
    assert "estimatedFuelLiters" in rec
    assert "riskScore" in rec

def test_route_compare_endpoint():
    payload = {
        "startLat": -64.82,
        "startLon": -58.25,
        "destLat": -67.57,
        "destLon": -68.13
    }
    response = client.post("/api/route/compare", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "options" in data
    assert len(data["options"]) == 4

def test_scenario_simulate_endpoint():
    payload = {
        "windDelta": 15.0,
        "iceDelta": 12.0,
        "waveDelta": 1.5
    }
    response = client.post("/api/scenario/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "baselineRoute" in data
    assert "scenarioRoute" in data
    assert "divergence" in data
    assert "impactSummary" in data
    assert data["divergence"]["riskDiffScore"] > 0
