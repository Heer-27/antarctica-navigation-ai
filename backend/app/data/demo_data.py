import os
import csv
import math
import random
from pathlib import Path
from datetime import datetime, timezone, timedelta
from app.core.config import settings, DATA_DIR
from app.core.logging_config import logger
from app.database.connection import SessionLocal
from app.database import models

SAMPLE_DIR = DATA_DIR / "sample"

def generate_sample_datasets():
    """Generate realistic synthetic Antarctic CSV datasets for model training and simulation."""
    SAMPLE_DIR.mkdir(parents=True, exist_ok=True)

    sea_ice_file = SAMPLE_DIR / "sea_ice_sample.csv"
    iceberg_file = SAMPLE_DIR / "iceberg_sample.csv"
    weather_file = SAMPLE_DIR / "weather_sample.csv"
    ocean_file = SAMPLE_DIR / "ocean_sample.csv"

    random.seed(42)

    # 1. Sea Ice Sample Dataset (~1,200 rows covering Southern Ocean latitudes -60 to -78)
    if not sea_ice_file.exists() or sea_ice_file.stat().st_size < 1000:
        logger.info("Generating synthetic sea_ice_sample.csv...")
        with open(sea_ice_file, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                "latitude", "longitude", "month", "day_of_year", "prev_concentration",
                "sst", "air_temperature", "wind_speed", "wind_direction",
                "current_speed", "wave_height", "target_concentration"
            ])
            for _ in range(1200):
                lat = round(random.uniform(-78.0, -60.0), 3)
                lon = round(random.uniform(-180.0, 180.0), 3)
                month = random.randint(1, 12)
                day_of_year = random.randint(1, 365)
                # Polar latitude effect: higher lat (more negative) -> colder & more ice
                lat_factor = (abs(lat) - 60.0) / 18.0  # 0 to 1
                seasonal_factor = math.cos((month - 8) * math.pi / 6) * 0.35 + 0.5  # winter peak in August/Sept
                
                prev_conc = max(0.0, min(100.0, round((lat_factor * 60 + seasonal_factor * 40) + random.uniform(-10, 10), 1)))
                sst = round(-1.8 + (1.0 - lat_factor) * 2.5 + random.uniform(-0.3, 0.3), 2)
                air_temp = round(-25.0 * lat_factor - 5.0 * seasonal_factor + random.uniform(-4, 4), 1)
                wind_speed = round(random.uniform(5.0, 42.0), 1)
                wind_dir = round(random.uniform(0.0, 360.0), 1)
                current_speed = round(random.uniform(0.1, 1.8), 2)
                wave_height = round(random.uniform(0.5, 5.5) * (1.0 - prev_conc / 120.0), 2)

                # Future target concentration with thermodynamic physics
                growth_rate = -0.4 * sst - 0.2 * air_temp + random.uniform(-3, 3)
                target_conc = max(0.0, min(100.0, round(prev_conc + growth_rate * 0.3, 1)))

                writer.writerow([
                    lat, lon, month, day_of_year, prev_conc, sst, air_temp,
                    wind_speed, wind_dir, current_speed, wave_height, target_conc
                ])

    # 2. Iceberg Drift Trajectory Sample Dataset (~800 points)
    if not iceberg_file.exists() or iceberg_file.stat().st_size < 1000:
        logger.info("Generating synthetic iceberg_sample.csv...")
        with open(iceberg_file, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                "external_id", "timestamp", "latitude", "longitude", "prev_latitude", "prev_longitude",
                "length", "width", "height", "speed", "direction", "wind_speed", "wind_direction",
                "current_speed", "current_direction", "sea_ice_concentration",
                "next_latitude", "next_longitude"
            ])
            berg_ids = ["A-23a", "A-017", "A-81", "B-015K", "C-028", "D-033", "A-076"]
            start_date = datetime(2026, 8, 1, tzinfo=timezone.utc)

            for b_id in berg_ids:
                curr_lat = random.uniform(-72.0, -62.0)
                curr_lon = random.uniform(-65.0, 40.0)
                length = random.uniform(300, 35000)
                width = length * random.uniform(0.4, 0.7)
                height = random.uniform(25, 300)

                for step in range(120):
                    t = start_date + timedelta(hours=step * 6)
                    wind_speed = random.uniform(8.0, 38.0)
                    wind_dir = random.uniform(0.0, 360.0)
                    curr_spd = random.uniform(0.2, 1.6)
                    curr_dir = (wind_dir + random.uniform(-30, 30)) % 360.0
                    ice_conc = random.uniform(20.0, 85.0)

                    # Hydrodynamic drift equation (2% wind + 100% ocean current with Ekman deflection)
                    drift_spd = curr_spd * 0.8 + wind_speed * 0.02 * (1.0 - ice_conc / 150.0)
                    heading = (curr_dir + 15.0) % 360.0  # left deflection in southern hemisphere

                    # Displace lat/lon over 6 hours (1 knot ~ 1.852 km/h; 1 deg lat ~ 111 km)
                    distance_km = drift_spd * 1.852 * 6
                    d_lat = (distance_km * math.cos(math.radians(heading))) / 111.0
                    d_lon = (distance_km * math.sin(math.radians(heading))) / (111.0 * max(0.1, math.cos(math.radians(curr_lat))))

                    next_lat = curr_lat + d_lat
                    next_lon = curr_lon + d_lon

                    prev_lat = curr_lat - d_lat * 0.9
                    prev_lon = curr_lon - d_lon * 0.9

                    writer.writerow([
                        b_id, t.isoformat(), round(curr_lat, 4), round(curr_lon, 4),
                        round(prev_lat, 4), round(prev_lon, 4),
                        round(length, 1), round(width, 1), round(height, 1),
                        round(drift_spd, 2), round(heading, 1),
                        round(wind_speed, 1), round(wind_dir, 1),
                        round(curr_spd, 2), round(curr_dir, 1),
                        round(ice_conc, 1), round(next_lat, 4), round(next_lon, 4)
                    ])
                    curr_lat = next_lat
                    curr_lon = next_lon


def seed_database_demo_records():
    """Seed initial research fleet and icebergs into SQLite/PostgreSQL if empty."""
    db = SessionLocal()
    try:
        # 1. Seed Ships
        if db.query(models.Ship).count() == 0:
            logger.info("Seeding research vessel fleet...")
            sample_ships = [
                models.Ship(
                    name="R/V Polarstern",
                    latitude=-64.82,
                    longitude=-58.25,
                    destination_latitude=-67.57,
                    destination_longitude=-68.13,
                    destination="Rothera Station",
                    max_speed=15.5,
                    normal_speed=11.2,
                    fuel_consumption_rate=85.0,
                    fuel_capacity=950000.0,
                    ice_class="PC3 (Polar Class 3)",
                    status="IN TRANSIT"
                ),
                models.Ship(
                    name="R/V Sir David Attenborough",
                    latitude=-62.20,
                    longitude=-58.90,
                    destination_latitude=-75.58,
                    destination_longitude=-26.54,
                    destination="Halley VI Research Station",
                    max_speed=17.0,
                    normal_speed=13.0,
                    fuel_consumption_rate=92.0,
                    fuel_capacity=1200000.0,
                    ice_class="PC4 (Polar Class 4)",
                    status="SURVEYING"
                ),
                models.Ship(
                    name="S.A. Agulhas II",
                    latitude=-69.45,
                    longitude=39.50,
                    destination_latitude=-70.77,
                    destination_longitude=11.73,
                    destination="Maitri Station (India)",
                    max_speed=16.0,
                    normal_speed=12.0,
                    fuel_consumption_rate=78.0,
                    fuel_capacity=880000.0,
                    ice_class="PC5 (Polar Class 5)",
                    status="APPROACHING PACK ICE"
                )
            ]
            db.add_all(sample_ships)
            db.commit()

        # 2. Seed Icebergs
        if db.query(models.Iceberg).count() == 0:
            logger.info("Seeding initial tracked icebergs...")
            sample_bergs = [
                models.Iceberg(
                    external_id="A-23a",
                    latitude=-60.45,
                    longitude=-46.22,
                    length=62000.0,
                    width=38000.0,
                    height=390.0,
                    speed=1.42,
                    direction=42.0,
                    source="NIC_SAR_TRACKING"
                ),
                models.Iceberg(
                    external_id="A-017",
                    latitude=-63.15,
                    longitude=-56.80,
                    length=850.0,
                    width=420.0,
                    height=48.0,
                    speed=1.82,
                    direction=65.0,
                    source="RADARSAT_CONSTELLATION"
                ),
                models.Iceberg(
                    external_id="A-81",
                    latitude=-71.12,
                    longitude=-32.45,
                    length=32000.0,
                    width=18000.0,
                    height=240.0,
                    speed=0.65,
                    direction=315.0,
                    source="COPERNICUS_SENTINEL1"
                ),
                models.Iceberg(
                    external_id="B-015K",
                    latitude=-74.20,
                    longitude=172.50,
                    length=18500.0,
                    width=12000.0,
                    height=185.0,
                    speed=0.85,
                    direction=285.0,
                    source="AMSR2_MICROWAVE"
                ),
                models.Iceberg(
                    external_id="C-028",
                    latitude=-66.50,
                    longitude=92.10,
                    length=450.0,
                    width=220.0,
                    height=32.0,
                    speed=0.52,
                    direction=140.0,
                    source="IN_SITU_EXPEDITION"
                )
            ]
            db.add_all(sample_bergs)
            db.commit()
    finally:
        db.close()
