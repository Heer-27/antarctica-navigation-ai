import logging
from typing import Generator
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
from app.core.logging_config import logger
from .base import Base

# Database engine initialization with graceful fallback
engine = None
active_db_url = settings.DATABASE_URL

try:
    # Try PostgreSQL first
    test_engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        connect_args={"connect_timeout": 3} if "postgresql" in settings.DATABASE_URL else {}
    )
    with test_engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    engine = test_engine
    logger.info(f"Connected successfully to PostgreSQL database at {settings.DATABASE_URL.split('@')[-1]}")
except Exception as e:
    logger.warning(
        f"Could not connect to PostgreSQL ({e}). Falling back to local SQLite database: {settings.SQLITE_FALLBACK_URL}"
    )
    active_db_url = settings.SQLITE_FALLBACK_URL
    engine = create_engine(
        settings.SQLITE_FALLBACK_URL,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    """FastAPI database session dependency."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Create all tables in the active database."""
    from . import models  # Ensure all model tables are registered with Base
    Base.metadata.create_all(bind=engine)
    logger.info(f"Database tables verified/created on {active_db_url}")
