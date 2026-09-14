# Iceberg Trajectory Prediction & Route Encounter Detection Module

The `iceberg` module forecasts future iceberg movement in Antarctic waters across 24, 72, and 168-hour prediction horizons and identifies potential route encounter hazards.

---

## 📌 Module Architecture

The pipeline consists of the following components:

- **`config.py`**: Central configuration for data paths, forecast horizons (`[24, 72, 168]` hours), safety buffer thresholds (default `10.0 km`), and model hyperparameters.
- **`data_loader.py`**: Ingests raw iceberg tracking data from BYU consolidated database v8.0, outputting schema with `is_observed`, `sensor`, `size_major_km`, and `size_minor_km`.
- **`preprocess.py`**: Cleans tracking observations, converts timestamps, resolves multi-sensor collisions via `SENSOR_PRIORITY`, and sorts tracking records.
- **`features.py`**: Computes spatial displacement, speed vectors, direction/bearing, historical lags, `is_observed` feature, and target matrices (`build_training_data`). *Note: Iceberg size attributes (`size_major_km`, `size_minor_km`) have <10% coverage across observations and are excluded from feature matrix `X`.*
- **`model.py`**: Handles training, evaluation, and saving/loading of scikit-learn trajectory prediction models (`RandomForestRegressor`).
- **`baseline.py`**: Evaluates a persistence baseline assuming icebergs maintain constant speed and heading vector over the forecast horizon.
- **`predict.py`**: Generates multi-horizon trajectory predictions (`outputs/predictions/iceberg_predictions.csv` and `iceberg_predictions_meta.json`).
- **`encounter.py`**: Performs spatial proximity calculations using `haversine_km` to detect when predicted iceberg paths cross within the safety buffer of a vessel's route.
- **`run_pipeline.py`**: Command-Line Interface (CLI) entry point orchestrating the full execution workflow.

---

## ⚠️ Model Choice & Evaluation Findings

`predict.py` defaults to the **Persistence Velocity Baseline** (`use_model=False`) rather than the `RandomForestRegressor`.

### Held-Out Chronological Test Set Evaluation (Clean / `observed_only=True`):

| Horizon | Test Rows ($N$) | Persistence Median Error | RandomForest Median Error |
| :--- | :--- | :--- | :--- |
| **24h** | 76,624 | **0.00 km** | 0.40 km |
| **72h** | 75,303 | **0.00 km** | 0.89 km |
| **168h** | 80,483 | **2.76 km** | 3.09 km |

Because the persistence baseline outperforms the machine learning model across all three forecast horizons on our held-out test set, `predict.py` uses persistence by default and invokes the ML model only when explicitly requested via `use_model=True`.

---

## ⚠️ Iceberg Risk Score Heuristic

The `iceberg_risk` column (float `0.0` to `1.0`) is a **domain heuristic**, NOT a learned or empirically validated metric.

### Risk Score Formula:
For each forecast horizon $H$:
1. **Local Density Count**: Count of other predicted icebergs $j \neq i$ within a $50.0\text{ km}$ radius using `haversine_km`:
   $$\text{density}_i = \sum_{j \neq i} \mathbb{I}(\text{distance}_{i,j} \le 50.0\text{ km})$$
2. **Density Score**: $\text{density\_score}_i = \min\left(\frac{\text{density}_i}{10.0}, 1.0\right)$
3. **Speed Score**: $\text{speed\_score}_i = \min\left(\frac{\text{predicted\_speed\_kmh}_i}{3.0}, 1.0\right)$
4. **Combined Risk**:
   $$\text{iceberg\_risk}_i = \text{clip}(0.6 \times \text{density\_score}_i + 0.4 \times \text{speed\_score}_i, 0.0, 1.0)$$

---

## 🚀 How to Run

Execute prediction pipeline via Python:

```bash
python -m src.iceberg.predict
```
