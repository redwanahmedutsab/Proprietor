import json
import os
import joblib
import numpy as np
import pandas as pd

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
CATEGORICAL_FEATURES = ["building_type", "division", "city", "locality"]


class PriceEngine:
    """Loads both trained models once and serves predictions for the
    lifetime of the process. Call `.ready()` to check load status."""

    def __init__(self):
        self.sale_model = None
        self.rent_model = None
        self.metadata = None

    def load(self):
        self.sale_model = joblib.load(os.path.join(MODELS_DIR, "sale_model.joblib"))
        self.rent_model = joblib.load(os.path.join(MODELS_DIR, "rent_model.joblib"))
        with open(os.path.join(MODELS_DIR, "metadata.json")) as f:
            self.metadata = json.load(f)

    def ready(self) -> bool:
        return self.sale_model is not None and self.rent_model is not None

    def _clean_category(self, purpose: str, field: str, value: str) -> str:
        """Map an unrecognized category to 'Unknown'/nearest known value so
        the model (which was trained on a fixed category vocabulary) doesn't
        choke on unseen labels at inference time."""
        known = self.metadata[purpose].get(field, [])
        if value in known:
            return value
        # case-insensitive match
        for k in known:
            if k.lower() == value.lower():
                return k
        return known[0] if known else value

    def _build_row(self, purpose: str, features: list, payload: dict) -> pd.DataFrame:
        row = {}
        for feat in features:
            val = payload.get(feat)
            if feat in CATEGORICAL_FEATURES:
                val = self._clean_category(purpose, feat, str(val))
            row[feat] = val
        df = pd.DataFrame([row])
        for col in CATEGORICAL_FEATURES:
            if col in df.columns:
                df[col] = df[col].astype("category")
        return df

    def predict_sale(self, payload: dict) -> dict:
        features = self.metadata["sale"]["features"]
        payload = dict(payload)
        if payload.get("total_amenities") is None:
            payload["total_amenities"] = 6  # typical mid-range amenity count
        X = self._build_row("sale", features, payload)
        return self._finalize("sale", self.sale_model, X, payload["area_sqft"])

    def predict_rent(self, payload: dict) -> dict:
        features = self.metadata["rent"]["features"]
        X = self._build_row("rent", features, payload)
        return self._finalize("rent", self.rent_model, X, payload["area_sqft"])

    def _finalize(self, purpose: str, model, X: pd.DataFrame, area_sqft: float) -> dict:
        pred_log = model.predict(X)[0]
        price = float(np.expm1(pred_log))
        mape = self.metadata[purpose]["metrics"]["mape_pct"]
        band = min(mape / 100 * 1.15, 0.45)  # cap the band so it stays sane
        return {
            "purpose": purpose,
            "suggested_price": round(price, -2),          # nearest 100 BDT
            "price_low": round(price * (1 - band), -2),
            "price_high": round(price * (1 + band), -2),
            "price_per_sqft": round(price / area_sqft, 2),
            "unit": "per month" if purpose == "rent" else "total",
            "model_mape_pct": mape,
            "note": (
                f"Estimate based on comparable {purpose} listings in this dataset. "
                f"Typical model error is about {mape}%, so treat the low–high range "
                f"as the realistic negotiating window rather than the exact price."
            ),
        }


engine = PriceEngine()
