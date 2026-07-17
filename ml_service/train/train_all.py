"""
Trains the two price-suggestion models (Sale, Rent) and writes artifacts to
../models/. Runs automatically on container start (see docker-entrypoint.sh)
if the artifacts don't already exist, or on demand with:

    python -m train.train_all --force

Artifacts written:
  models/sale_model.joblib   (LightGBM regressor, log-price target)
  models/rent_model.joblib
  models/metadata.json       (valid dropdown values, ranges, metrics)
"""
import argparse
import json
import os
import sys

import joblib
import numpy as np
import pandas as pd
from lightgbm import LGBMRegressor
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error, r2_score
from sklearn.model_selection import train_test_split

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from train.prepare_data import (
    SALE_FEATURES, RENT_FEATURES, CATEGORICAL_FEATURES,
    build_sale_dataset, build_rent_dataset, build_metadata,
)

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")


def _train_one(df: pd.DataFrame, features: list, label: str) -> tuple:
    X = df[features].copy()
    y = np.log1p(df["price"])  # log target: prices are heavily right-skewed

    for col in CATEGORICAL_FEATURES:
        X[col] = X[col].astype("category")

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)

    model = LGBMRegressor(
        n_estimators=600,
        learning_rate=0.04,
        num_leaves=48,
        max_depth=-1,
        min_child_samples=15,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42,
        verbosity=-1,
    )
    model.fit(
        X_train, y_train,
        categorical_feature=CATEGORICAL_FEATURES,
        eval_set=[(X_test, y_test)],
        callbacks=[],
    )

    pred_log = model.predict(X_test)
    pred = np.expm1(pred_log)
    actual = np.expm1(y_test)

    metrics = {
        "r2": round(r2_score(y_test, pred_log), 4),
        "mae_bdt": round(mean_absolute_error(actual, pred), 2),
        "mape_pct": round(mean_absolute_percentage_error(actual, pred) * 100, 2),
        "n_train": len(X_train),
        "n_test": len(X_test),
    }
    print(f"[{label}] R2(log)={metrics['r2']}  MAE={metrics['mae_bdt']:,.0f} BDT  "
          f"MAPE={metrics['mape_pct']}%  (train={metrics['n_train']}, test={metrics['n_test']})")
    return model, metrics


def main(force: bool = False):
    os.makedirs(MODELS_DIR, exist_ok=True)
    sale_path = os.path.join(MODELS_DIR, "sale_model.joblib")
    rent_path = os.path.join(MODELS_DIR, "rent_model.joblib")
    meta_path = os.path.join(MODELS_DIR, "metadata.json")

    if not force and os.path.exists(sale_path) and os.path.exists(rent_path) and os.path.exists(meta_path):
        print("Model artifacts already exist. Skipping training (use --force to retrain).")
        return

    print("Loading & cleaning datasets...")
    sale_df = build_sale_dataset()
    rent_df = build_rent_dataset()
    print(f"Sale rows: {len(sale_df)}   Rent rows: {len(rent_df)}")

    print("\nTraining SALE model...")
    sale_model, sale_metrics = _train_one(sale_df, SALE_FEATURES, "SALE")

    print("\nTraining RENT model...")
    rent_model, rent_metrics = _train_one(rent_df, RENT_FEATURES, "RENT")

    joblib.dump(sale_model, sale_path)
    joblib.dump(rent_model, rent_path)

    metadata = build_metadata(sale_df, rent_df)
    metadata["sale"]["metrics"] = sale_metrics
    metadata["rent"]["metrics"] = rent_metrics
    metadata["sale"]["features"] = SALE_FEATURES
    metadata["rent"]["features"] = RENT_FEATURES

    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"\nSaved: {sale_path}\nSaved: {rent_path}\nSaved: {meta_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="retrain even if artifacts exist")
    args = parser.parse_args()
    main(force=args.force)
