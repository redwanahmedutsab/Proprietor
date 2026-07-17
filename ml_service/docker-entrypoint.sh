#!/bin/sh
set -e

MODELS_DIR="/app/models"
mkdir -p "$MODELS_DIR"

if [ -f "$MODELS_DIR/sale_model.joblib" ] && [ -f "$MODELS_DIR/rent_model.joblib" ] && [ -f "$MODELS_DIR/metadata.json" ] && [ "$FORCE_RETRAIN" != "true" ]; then
    echo "[ml_service] Trained models found in $MODELS_DIR — skipping training."
else
    echo "[ml_service] No trained models found (or FORCE_RETRAIN=true) — training now..."
    python -m train.train_all --force
    echo "[ml_service] Training complete."
fi

echo "[ml_service] Starting API server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8001 --workers 1
