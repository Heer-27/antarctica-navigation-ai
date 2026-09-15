from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

# Directories
APP_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = APP_DIR.parent
DATA_DIR = BACKEND_DIR / "data"
MODELS_DIR = BACKEND_DIR / "models"


class Settings(BaseSettings):
    """Application configuration loaded from environment or .env file."""

    model_config = SettingsConfigDict(
        env_file=str(BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # General
    APP_NAME: str = "Antarctic Decision Support System"
    APP_ENV: str = "development"
    DEBUG: bool = True
    DEMO_MODE: bool = True
    SECRET_KEY: str = "polar_decision_support_secret_key_change_in_production"

    # Database
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/antarctic_ai"
    SQLITE_FALLBACK_URL: str = f"sqlite:///{BACKEND_DIR / 'antarctic_ai.db'}"

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000"

    # Remote Sensing & External APIs (Optional when DEMO_MODE is True)
    NASA_EARTHDATA_USERNAME: str = ""
    NASA_EARTHDATA_PASSWORD: str = ""
    COPERNICUS_USERNAME: str = ""
    COPERNICUS_PASSWORD: str = ""
    WEATHER_API_KEY: str = ""
    MAPBOX_ACCESS_TOKEN: str = ""

    # Paths
    APP_PATH: Path = APP_DIR
    DATA_PATH: Path = DATA_DIR
    MODELS_PATH: Path = MODELS_DIR

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
