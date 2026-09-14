"""Command Line Interface (CLI) script for running the iceberg pipeline end-to-end."""

import argparse
from pathlib import Path
from src.iceberg.config import DEFAULT_SAFETY_BUFFER_KM, DATA_RAW_DIR, DATA_PROCESSED_DIR


def run_pipeline(
    data_path: Path,
    output_path: Path,
    safety_buffer_km: float = DEFAULT_SAFETY_BUFFER_KM
) -> None:
    """Execute the full iceberg trajectory prediction and encounter detection pipeline.

    Parameters
    ----------
    data_path : Path
        Input path to raw iceberg tracking dataset.
    output_path : Path
        Output path for storing processed predictions and encounter hazards.
    safety_buffer_km : float
        Safety distance buffer in kilometers for route encounter checks.
    """
    # TODO: Orchestrate load -> preprocess -> feature eng -> ML model / baseline -> encounter detection -> save outputs
    raise NotImplementedError("run_pipeline is not implemented yet.")


def main() -> None:
    """Parse CLI arguments and run the iceberg pipeline."""
    parser = argparse.ArgumentParser(
        description="Run Iceberg Trajectory Prediction & Route Encounter Detection Pipeline"
    )
    parser.add_argument(
        "--data-path",
        type=Path,
        default=DATA_RAW_DIR / "iceberg_tracking.csv",
        help="Path to raw iceberg tracking CSV data file"
    )
    parser.add_argument(
        "--output-path",
        type=Path,
        default=DATA_PROCESSED_DIR / "iceberg_predictions.csv",
        help="Path to save prediction and encounter detection results"
    )
    parser.add_argument(
        "--safety-buffer",
        type=float,
        default=DEFAULT_SAFETY_BUFFER_KM,
        help="Safety buffer distance in kilometers (default: 10.0 km)"
    )

    args = parser.parse_args()
    run_pipeline(
        data_path=args.data_path,
        output_path=args.output_path,
        safety_buffer_km=args.safety_buffer
    )


if __name__ == "__main__":
    main()
