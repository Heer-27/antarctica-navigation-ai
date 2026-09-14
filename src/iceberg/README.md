# Iceberg Trajectory Prediction & Route Encounter Detection Module

The `iceberg` module forecasts future iceberg movement in Antarctic waters across 6, 12, and 24-hour prediction horizons and identifies potential route encounter hazards.

---

## 📌 Module Architecture

The pipeline consists of the following components:

- **`config.py`**: Central configuration for data paths, forecast horizons (`[24, 72, 168]` hours), safety buffer thresholds (default `10.0 km`), and model hyperparameters.
- **`data_loader.py`**: Ingests raw iceberg tracking data, outputting schema with `is_observed`, `sensor`, `size_major_km`, and `size_minor_km`.
- **`preprocess.py`**: Cleans tracking observations, converts timestamps, resolves multi-sensor collisions via `SENSOR_PRIORITY`, and sorts tracking records.
- **`features.py`**: Computes spatial displacement, speed vectors, direction/bearing, historical lags, `is_observed` feature, and target matrices (`build_training_data`). *Note: Iceberg size attributes (`size_major_km`, `size_minor_km`) are unavailable for >90% of observations (only NIC reports dimensions) and are excluded from the training feature matrix `X`.*
- **`model.py`**: Handles training, saving, and loading of scikit-learn trajectory prediction models.
- **`predict.py`**: Generates predicted iceberg locations across 24h, 72h, and 168h horizons.
- **`baseline.py`**: Evaluates a persistence baseline assuming icebergs maintain constant speed and heading vector.
- **`encounter.py`**: Performs spatial proximity calculations using the `haversine_km` formula to detect when predicted iceberg paths cross within the safety buffer of a vessel's route.
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
