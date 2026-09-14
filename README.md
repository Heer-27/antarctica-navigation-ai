# AI-Enabled Antarctica Sea-Ice, Iceberg Trajectory and Navigation Decision Support System

An AI-powered decision support system for safer and more efficient maritime navigation in the Antarctic region by predicting sea-ice conditions, forecasting iceberg movement, identifying route-level hazards, and recommending risk-aware navigation paths.

---

## 🌍 Overview

Navigation in Antarctic waters is challenging because sea-ice conditions, iceberg movement, ocean currents, and weather conditions can change significantly over time.

Traditional navigation methods may rely heavily on historical information and static charts. Our system aims to provide a more dynamic approach by combining environmental data with machine learning and route optimization.

The system follows the pipeline:

**Predict → Detect → Assess → Compare → Route → Alert**

Instead of simply finding the shortest path, the system evaluates how predicted environmental hazards may affect a vessel's journey and provides a safer route recommendation.

---

## 🎯 Problem Statement

Research and supply vessels operating in Antarctic waters need to navigate through an environment affected by:

- Changing sea-ice concentration
- Drifting icebergs
- Strong and changing winds
- Ocean currents
- Temperature variations
- Uncertain environmental conditions

A route that appears geographically short may not necessarily be the safest route.

Therefore, there is a need for an intelligent navigation decision-support system that can:

1. Predict future sea-ice conditions.
2. Predict future iceberg positions.
3. Detect potential encounters between icebergs and vessel routes.
4. Combine multiple environmental hazards into a dynamic risk map.
5. Compare alternative navigation paths.
6. Recommend a safer route.
7. Provide understandable risk information and alerts to the user.

---

# 🚀 Our Solution

Our system combines **Machine Learning, Environmental Data Processing, Risk Assessment, and Path Optimization** into a single navigation decision-support platform.

The system receives environmental and historical data, processes the information, predicts future hazards, converts them into spatial risk information, and uses the resulting risk map to recommend a safer route.

### Core workflow

```text
DATA SOURCES
      ↓
DATA PREPROCESSING
      ↓
SEA-ICE PREDICTION + ICEBERG PREDICTION
      ↓
ROUTE ENCOUNTER DETECTION
      ↓
MULTI-HAZARD RISK ENGINE
      ↓
DYNAMIC RISK MAP
      ↓
SHORTEST ROUTE + RISK-AWARE A*
      ↓
ROUTE COMPARISON
      ↓
RISK EXPLANATION
      ↓
WHAT-IF ANALYSIS + HAZARD ALERTS
      ↓
DASHBOARD
