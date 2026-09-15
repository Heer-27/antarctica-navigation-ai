"""
Data ingestion, cleaning, and synthetic demo datasets.
"""

from .demo_data import generate_sample_datasets, seed_database_demo_records
from .downloader import downloader

__all__ = ["generate_sample_datasets", "seed_database_demo_records", "downloader"]
