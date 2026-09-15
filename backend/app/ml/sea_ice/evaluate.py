import json
from app.core.config import MODELS_DIR

def get_sea_ice_evaluation_report() -> dict:
    """Read saved evaluation metrics and metadata."""
    meta_file = MODELS_DIR / "sea_ice_metadata.json"
    if meta_file.exists():
        with open(meta_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "status": "NOT_TRAINED",
        "message": "Model metadata missing. Run train_sea_ice_model() to initialize."
    }
