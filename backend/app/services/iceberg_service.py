from pathlib import Path
from typing import List, Dict, Any, Optional
import math
import numpy as np
import pandas as pd

from app.database.connection import SessionLocal
from app.database import crud
from app.ml.iceberg.predict import predict_iceberg_trajectory
from app.routing.grid import haversine_distance_km

BYU_SAMPLE_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "reference_byu" / "iceberg_sample.csv"

# Canonical major tracked Antarctic icebergs
DEFAULT_ICEBERGS = [
    {
        "id": "A-23a",
        "name": "A-23a (Mega-Tabular Berg)",
        "latitude": -60.45,
        "longitude": -46.22,
        "length": 62000.0,
        "width": 38000.0,
        "height": 390.0,
        "speed": 1.42,
        "heading": 42.0,
        "direction": "NE 042°",
        "riskLevel": "CRITICAL",
        "riskScore": 92,
        "origin": "Filchner-Ronne Ice Shelf",
        "source": "BYU / NIC Satellite Radar",
        "notes": "Grounding-free drifting in the Antarctic Circumpolar Current. Extreme radar cross-section."
    },
    {
        "id": "A-017",
        "name": "A-017 (Drift Hazard)",
        "latitude": -63.15,
        "longitude": -56.80,
        "length": 850.0,
        "width": 420.0,
        "height": 48.0,
        "speed": 1.82,
        "heading": 65.0,
        "direction": "ENE 065°",
        "riskLevel": "HIGH",
        "riskScore": 78,
        "origin": "Larsen C Calving",
        "source": "BYU / QuikSCAT & ASCAT",
        "notes": "Rapid drift along Bransfield Strait shipping corridor. High collision hazard for non-ice-strengthened vessels."
    },
    {
        "id": "A-81",
        "name": "A-81 (Weddell Tabular)",
        "latitude": -71.12,
        "longitude": -32.45,
        "length": 32000.0,
        "width": 18000.0,
        "height": 240.0,
        "speed": 0.65,
        "heading": 315.0,
        "direction": "NW 315°",
        "riskLevel": "MODERATE",
        "riskScore": 54,
        "origin": "Brunt Ice Shelf",
        "source": "BYU / ERS Scatterometer",
        "notes": "Transiting the Weddell Gyre westward. High concentration of bergy bits trailing downstream."
    },
    {
        "id": "B-015K",
        "name": "B-015K (Ross Sea Fragment)",
        "latitude": -74.20,
        "longitude": 172.50,
        "length": 18500.0,
        "width": 12000.0,
        "height": 185.0,
        "speed": 0.85,
        "heading": 285.0,
        "direction": "WNW 285°",
        "riskLevel": "MODERATE",
        "riskScore": 48,
        "origin": "Ross Ice Shelf",
        "source": "BYU / SeaWinds",
        "notes": "Stable drift pattern near Terra Nova Bay Polynya entrance."
    },
    {
        "id": "C-028",
        "name": "C-028 (Shackleton Cluster)",
        "latitude": -66.50,
        "longitude": 92.10,
        "length": 450.0,
        "width": 220.0,
        "height": 32.0,
        "speed": 0.52,
        "heading": 140.0,
        "direction": "SE 140°",
        "riskLevel": "LOW",
        "riskScore": 24,
        "origin": "Shackleton Ice Shelf",
        "source": "BYU / SASS Observation",
        "notes": "Small isolated tabular berg surrounded by open leads."
    }
]

def load_byu_sample_icebergs() -> List[Dict[str, Any]]:
    """Load authentic tracked icebergs from BYU Consolidated Database v8.0 sample."""
    if not BYU_SAMPLE_PATH.exists():
        return []

    try:
        df = pd.read_csv(BYU_SAMPLE_PATH)
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        df = df.sort_values(['iceberg_id', 'timestamp'])

        byu_records = []
        for berg_id, g in df.groupby('iceberg_id'):
            g = g.dropna(subset=['latitude', 'longitude'])
            if len(g) < 2:
                continue

            last_row = g.iloc[-1]
            prev_row = g.iloc[-2]

            dt_hours = max(1.0, (last_row['timestamp'] - prev_row['timestamp']).total_seconds() / 3600.0)
            d_lat = last_row['latitude'] - prev_row['latitude']
            d_lon = last_row['longitude'] - prev_row['longitude']

            lat_km = d_lat * 111.0
            lon_km = d_lon * 111.0 * math.cos(math.radians(last_row['latitude']))
            dist_km = math.sqrt(lat_km**2 + lon_km**2)
            speed_kmh = dist_km / dt_hours
            speed_knots = max(0.2, round(speed_kmh / 1.852, 2))

            angle = math.degrees(math.atan2(lon_km, lat_km))
            heading = round((angle + 360.0) % 360.0, 1)

            # Compass cardinal
            cardinals = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
            cardinal = cardinals[int(((heading + 11.25) % 360) / 22.5)]
            direction_str = f"{cardinal} {int(heading):03d}°"

            # Domain heuristic from reference repo: 0.6 * density_score + 0.4 * speed_score
            speed_score = min(speed_kmh / 3.0, 1.0)
            density_score = 0.1  # BYU sample has dispersed tracks
            heuristic_risk = min(1.0, max(0.0, 0.6 * density_score + 0.4 * speed_score))
            risk_score = int(round(heuristic_risk * 100))

            risk_level = (
                "CRITICAL" if risk_score >= 75
                else "HIGH" if risk_score >= 50
                else "MODERATE" if risk_score >= 25
                else "LOW"
            )

            byu_records.append({
                "id": f"BYU-{berg_id.upper()}",
                "name": f"BYU-{berg_id.upper()} (BYU v8.0 Track)",
                "latitude": round(float(last_row['latitude']), 4),
                "longitude": round(float(last_row['longitude']), 4),
                "length": 1200.0,
                "width": 600.0,
                "height": 45.0,
                "speed": speed_knots,
                "heading": heading,
                "direction": direction_str,
                "riskLevel": risk_level,
                "riskScore": max(20, risk_score),
                "origin": f"BYU Consolidated v8.0 ({last_row['sensor'].upper()})",
                "source": f"BYU / {last_row['sensor'].upper()}",
                "notes": f"Historical radar-tracked iceberg sequence from BYU dataset with {len(g)} observations. Persistence velocity: {round(speed_kmh, 2)} km/h."
            })

        return byu_records
    except Exception as e:
        print(f"Error loading BYU iceberg sample: {e}")
        return []

class IcebergService:
    def __init__(self):
        self._byu_cache = None

    def _get_catalog(self) -> List[Dict[str, Any]]:
        if self._byu_cache is None:
            byu_bergs = load_byu_sample_icebergs()
            self._byu_cache = DEFAULT_ICEBERGS + byu_bergs
        return self._byu_cache

    def get_all(self) -> List[Dict[str, Any]]:
        """Return catalog of all tracked icebergs (including BYU consolidated database v8.0)."""
        results = []
        for b in self._get_catalog():
            traj = predict_iceberg_trajectory(b)
            results.append({**b, "trajectory": traj})
        return results

    def get_by_id(self, berg_id: str) -> Optional[Dict[str, Any]]:
        """Find iceberg by ID or name."""
        catalog = self._get_catalog()
        for b in catalog:
            if b["id"].lower() == berg_id.lower() or b["id"].replace("BYU-", "").lower() == berg_id.lower():
                traj = predict_iceberg_trajectory(b)
                return {**b, "trajectory": traj}
        return None

    def get_trajectory(self, berg_id: str, hours: List[int] = None) -> Dict[str, Any]:
        """Compute multi-step persistence / Lagrangian drift trajectory."""
        berg = self.get_by_id(berg_id) or self._get_catalog()[0]
        traj = predict_iceberg_trajectory(berg, hours)
        return {
            "id": berg["id"],
            "name": berg["name"],
            "currentPosition": {"latitude": berg["latitude"], "longitude": berg["longitude"]},
            "speedKnots": berg["speed"],
            "headingDegrees": berg["heading"],
            "direction": berg["direction"],
            "predictionModel": "Persistence Velocity & Lagrangian Drift (BYU v8.0 Model)",
            "trajectory": traj
        }

    def compute_proximity_alert(self, route_waypoints: List[Dict[str, float]]) -> Optional[Dict[str, Any]]:
        """Compute Closest Point of Approach (CPA) using reference safety buffer (10 km threshold)."""
        min_dist = 999.0
        closest_berg = None
        closest_wp = None

        for berg in self._get_catalog():
            for wp in route_waypoints:
                dist = haversine_distance_km(wp["lat"], wp["lon"], berg["latitude"], berg["longitude"])
                if dist < min_dist:
                    min_dist = dist
                    closest_berg = berg
                    closest_wp = wp

        if closest_berg and min_dist <= 30.0:
            cpa_hours = round(min_dist / max(0.5, closest_berg["speed"] * 1.852), 1)
            is_hazard = min_dist <= 10.0  # 10.0 km safety buffer threshold from reference repo
            return {
                "severity": "CRITICAL" if is_hazard else "WARNING",
                "icebergId": closest_berg["id"],
                "icebergName": closest_berg["name"],
                "closestApproachKm": round(min_dist, 1),
                "estimatedTimeToCpaHours": cpa_hours,
                "safetyBufferKm": 10.0,
                "isHazard": is_hazard,
                "riskCategory": "HIGH" if is_hazard else "MODERATE",
                "coordinates": [closest_berg["latitude"], closest_berg["longitude"]],
                "message": (
                    f"{closest_berg['name']} is projected to approach the transit corridor within "
                    f"{round(min_dist, 1)} km ({'BREACHES 10km safety buffer!' if is_hazard else 'monitored approach'})."
                )
            }
        return None

iceberg_service = IcebergService()

