# Iceberg Trajectory Prediction & Route Encounter Detection Module

The `iceberg` module forecasts future iceberg movement in Antarctic waters across 6, 12, and 24-hour prediction horizons and identifies potential route encounter hazards.

---

## 📌 Module Architecture

The pipeline consists of the following components:

- **`config.py`**: Central configuration for data paths, forecast horizons (`[6, 12, 24]` hours), safety buffer thresholds (default `10.0 km`), and model hyperparameters.
- **`data_loader.py`**: Ingests raw iceberg tracking data.
- **`preprocess.py`**: Cleans tracking observations, converts timestamps, handles missing coordinate data, and sorts tracking records.
- **`features.py`**: Computes spatial displacement, speed vectors, direction/bearing, and historical lag features.
- **`model.py`**: Handles training, saving, and loading of scikit-learn trajectory prediction models.
- **`predict.py`**: Generates predicted iceberg locations across 6h, 12h, and 24h horizons.
- **`baseline.py`**: Evaluates a persistence baseline assuming icebergs maintain constant speed and heading vector.
- **`encounter.py`**: Performs spatial proximity calculations using the Haversine formula to detect when predicted iceberg paths cross within the safety buffer of a vessel's route.
- **`run_pipeline.py`**: Command-Line Interface (CLI) entry point orchestrating the full execution workflow.

---

## 🚀 How to Run

Execute the module CLI from the repository root:

```bash
python -m src.iceberg.run_pipeline --data-path data/raw/iceberg_tracking.csv --output-path data/processed/iceberg_predictions.csv --safety-buffer 10.0
```

### CLI Arguments

- `--data-path`: Input CSV file path containing raw iceberg observations.
- `--output-path`: Output CSV file path for predicted positions and encounter hazard flags.
- `--safety-buffer`: Distance threshold in kilometers for route proximity warnings (default: `10.0`).
