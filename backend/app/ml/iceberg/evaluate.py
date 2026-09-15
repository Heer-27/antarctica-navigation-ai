import json
from app.core.config import MODELS_DIR

def get_iceberg_evaluation_report() -> dict:
    """Read saved iceberg drift model metrics."""
    meta_file = MODELS_DIR / "iceberg_metadata.json"
    if meta_file.exists():
        with open(meta_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "status": "NOT_TRAINED",
        "message": "Iceberg model metadata missing. Run train_iceberg_models() to initialize."
    }
