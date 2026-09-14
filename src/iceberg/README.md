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
- **`encounter.py`**: Performs spatial proximity calculations using `haversine_km` to detect when predicted iceberg paths cross within the safety buffer of a vessel's route (`outputs/predictions/route_encounters.csv`).
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

## ⚠️ Iceberg Risk Score Heuristic & Uncertainty Proxy

The `iceberg_risk` column (float `0.0` to `1.0`) is a **domain heuristic caution proxy**, NOT a calibrated confidence interval or machine-learned safety probability.

**Safety System Rationale**: For navigation safety, position uncertainty must **increase caution, not reduce it**. A stale or far-ahead prediction is less precisely known, warranting a higher risk score and a larger safety avoidance radius.

### Risk Score Formula:
For each prediction row $i$:
1. **Total Projection Time**:
   $$\text{total\_projection\_hours}_i = \text{data\_age\_hours}_i + \text{horizon\_hours}_i$$
2. **Uncertainty Score (Exponential Saturating Curve)**:
   $$\text{uncertainty\_score}_i = 1.0 - \exp\left(-\frac{\text{total\_projection\_hours}_i}{480.0}\right)$$
   *Design Note*: Uses an exponential saturating curve so that uncertainty continuously grows with data age and horizon without clipping or flattening, ensuring forecasts for stale icebergs discriminate clearly across horizons (e.g. A23A varies across 24h, 72h, 168h).
3. **Local Density Score**: Count of other predicted icebergs $j \neq i$ within a $50.0\text{ km}$ radius at the same horizon using `haversine_km`, normalized by the maximum observed cluster density:
   $$\text{density}_i = \sum_{j \neq i} \mathbb{I}(\text{distance}_{i,j} \le 50.0\text{ km})$$
   $$\text{density\_score}_i = \frac{\text{density}_i}{\max(\text{density\_observed}, 1.0)}$$
4. **Speed Score**: Normalized against the maximum observed active iceberg speed ($1.04\text{ km/h}$):
   $$\text{speed\_score}_i = \min\left(\frac{\text{predicted\_speed\_kmh}_i}{\max(\text{speed\_observed}, 1e-6)}, 1.0\right)$$
5. **Combined Risk Score with Additive Uncertainty Caution**:
   $$\text{iceberg\_risk}_i = \text{clip}(0.45 \times \text{density\_score}_i + 0.3 \times \text{speed\_score}_i + 0.25 \times \text{uncertainty\_score}_i, 0.0, 1.0)$$

### Position Uncertainty Radius (`position_uncertainty_km`):
Output predictions include `position_uncertainty_km` representing cumulative spatial uncertainty:
$$\text{position\_uncertainty\_km}_i = \text{total\_projection\_hours}_i \times 0.2\text{ km/h}$$
*Assumption*: Assumes a nominal drift-speed uncertainty of **$0.2\text{ km/h}$** (reflecting unmodeled wind/current fluctuations compounding over projection time). Downstream routing modules can use this metric to dynamically widen avoidance radii around stale predictions.

---

## ⏱️ Temporal Staleness Rule & Active Iceberg Count

`predict.py` implements a **temporal staleness filter** (`as_of_date` and `max_days_stale`) to filter out inactive historical icebergs:
- **Reference Date (`as_of_date`)**: Defaults to the dataset's most recent observation date (`2026-04-30 00:00:00 UTC`). All active icebergs are first extrapolated forward to this common `as_of_date` using their last known position and velocity, ensuring all predictions land on synchronized future instants (`as_of_date` + 24h, 72h, 168h).
- **Staleness Window (`max_days_stale`)**: Defaults to **30 days**. Only icebergs whose last sighting occurred within 30 days prior to `as_of_date` (between `2026-03-31` and `2026-04-30`) are considered active hazards.
- **Active Iceberg Count**: Out of **593 total historical icebergs** tracked in the BYU dataset since 1978, exactly **41 icebergs** are currently active under this 30-day staleness rule. The remaining 552 icebergs were last sighted in earlier years/months and are excluded from active trajectory forecasting.
- **Stationary / Zero-Velocity Icebergs**: 24 of 41 active icebergs report identical coordinates across consecutive days, giving zero predicted velocity. This is consistent with grounded or pinned icebergs, but may also reflect position carry-forward in the source data between scatterometer re-measurements. We report it as observed.
- **Data Age Visibility**: Output predictions include `last_observed_timestamp` and `data_age_hours` columns alongside `origin_timestamp` so downstream modules can inspect how stale each iceberg's last observation was at `as_of_date`.

---

## ⚠️ Limitations

- This module compares single predicted positions against a route and does not account for prediction uncertainty.
- The BYU dataset tracks large tabular icebergs only; smaller calved fragments, which are real navigation hazards, are not represented.
- 19.1% of positions in the source data are interpolated rather than directly observed.
- The sample route (`data/sample/demo_route.csv`) is a synthetic illustrative route for testing and demonstration, not a real voyage plan.

---

## 🚀 How to Run

Execute prediction and encounter detection pipelines via Python:

```bash
python -m src.iceberg.predict
python -m src.iceberg.encounter
```
