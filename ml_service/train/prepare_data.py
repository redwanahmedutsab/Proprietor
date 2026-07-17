"""
Data cleaning & feature preparation for the Proprietor price-suggestion models.

Two source files, two targets:
  1. PropertyAIrealestateBangladeshdataset.csv  -> has both Sale and Rent rows,
     rich features (division, city, locality, building_type, amenities).
  2. houserentdhaka.csv                          -> Dhaka-only rental listings,
     simpler schema, but ~28.8k extra rows to make the RENT model stronger.

Both are combined (where compatible) into two clean, model-ready DataFrames:
  - build_sale_dataset()  -> SALE_FEATURES + 'price'
  - build_rent_dataset()  -> RENT_FEATURES + 'price'
"""
import os
import re
import pandas as pd
import numpy as np

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
PROPERTY_AI_CSV = os.path.join(DATA_DIR, "PropertyAIrealestateBangladeshdataset.csv")
HOUSE_RENT_CSV = os.path.join(DATA_DIR, "houserentdhaka.csv")

# Feature sets used by both training and inference — keep in sync with app/schemas.py
SALE_FEATURES = [
    "area_sqft", "bedrooms", "bathrooms", "building_type",
    "division", "city", "locality", "total_amenities",
]
RENT_FEATURES = [
    "area_sqft", "bedrooms", "bathrooms", "building_type",
    "division", "city", "locality",
]
CATEGORICAL_FEATURES = ["building_type", "division", "city", "locality"]

# Domain sanity bounds (in addition to percentile clipping) to reject junk rows
SALE_PRICE_BOUNDS = (300_000, 150_000_000)      # ~3 lakh to 15 crore BDT
RENT_PRICE_BOUNDS = (2_000, 2_000_000)          # BDT / month
AREA_BOUNDS = (100, 12_000)                     # sqft
BED_BATH_BOUNDS = (0, 10)


def _clip_outliers(df: pd.DataFrame, col: str, lower_q=0.01, upper_q=0.98) -> pd.DataFrame:
    lo, hi = df[col].quantile([lower_q, upper_q])
    return df[(df[col] >= lo) & (df[col] <= hi)]


def _parse_price(p: str) -> float:
    """'20 Thousand' -> 20000.0, '1.6 Lakh' -> 160000.0, '2 Crore' -> 20000000.0"""
    p = str(p).strip()
    match = re.match(r"([\d,.]+)\s*([A-Za-z]*)", p)
    if not match:
        return np.nan
    num = float(match.group(1).replace(",", ""))
    unit = match.group(2).lower()
    if unit.startswith("lakh"):
        return num * 100_000
    if unit.startswith("crore"):
        return num * 10_000_000
    if unit.startswith("thousand"):
        return num * 1_000
    return num


def _parse_area(a: str) -> float:
    a = str(a).strip().replace(",", "")
    match = re.match(r"([\d.]+)", a)
    return float(match.group(1)) if match else np.nan


def _load_property_ai() -> pd.DataFrame:
    df = pd.read_csv(PROPERTY_AI_CSV, low_memory=False)
    df = df.rename(columns={
        "area": "area_sqft",
        "num_bed_rooms": "bedrooms",
        "num_bath_rooms": "bathrooms",
    })
    amenity_cols = [
        "relaxation_amenity_count", "security_amenity_count",
        "maintenance_or_cleaning_amenity_count", "social_amenity_count",
        "expendable_amenity_count", "service_staff_amenity_count",
        "unclassify_amenity_count",
    ]
    df["total_amenities"] = df[amenity_cols].sum(axis=1)
    df["building_type"] = df["building_type"].fillna("Apartment").str.strip()
    df["division"] = df["division"].fillna(df["city"]).str.strip()
    df["city"] = df["city"].fillna("Dhaka").str.strip()
    df["locality"] = df["locality"].fillna("Unknown").str.strip()
    return df


def _load_house_rent_dhaka() -> pd.DataFrame:
    hr = pd.read_csv(HOUSE_RENT_CSV, index_col=0)
    hr["price"] = hr["Price"].apply(_parse_price)
    hr["area_sqft"] = hr["Area"].apply(_parse_area)
    loc_parts = hr["Location"].str.split(",")
    hr["locality"] = loc_parts.str[0].str.strip()
    hr["city"] = loc_parts.str[-1].str.strip().replace({"": "Dhaka"}).fillna("Dhaka")
    hr["division"] = "Dhaka"
    hr["building_type"] = "Apartment"
    hr["bedrooms"] = hr["Bed"]
    hr["bathrooms"] = hr["Bath"]
    return hr


def _sanity_filter(df: pd.DataFrame, price_bounds, area_bounds=AREA_BOUNDS,
                    bed_bath_bounds=BED_BATH_BOUNDS) -> pd.DataFrame:
    df = df.dropna(subset=["price", "area_sqft", "bedrooms", "bathrooms"])
    df = df[
        df["price"].between(*price_bounds)
        & df["area_sqft"].between(*area_bounds)
        & df["bedrooms"].between(*bed_bath_bounds)
        & df["bathrooms"].between(*bed_bath_bounds)
    ]
    df = _clip_outliers(df, "price")
    df = _clip_outliers(df, "area_sqft")
    return df


def build_sale_dataset() -> pd.DataFrame:
    raw = _load_property_ai()
    sale = raw[raw["purpose"] == "Sale"].copy()
    sale = _sanity_filter(sale, SALE_PRICE_BOUNDS)
    sale = sale[SALE_FEATURES + ["price"]].copy()
    for col in CATEGORICAL_FEATURES:
        sale[col] = sale[col].astype("category")
    return sale.reset_index(drop=True)


def build_rent_dataset() -> pd.DataFrame:
    raw = _load_property_ai()
    rent_a = raw[raw["purpose"] == "Rent"].copy()
    rent_a = rent_a[RENT_FEATURES + ["price"]]

    hr = _load_house_rent_dhaka()
    hr = hr[RENT_FEATURES + ["price"]]

    combined = pd.concat([rent_a, hr], ignore_index=True)
    combined = _sanity_filter(combined, RENT_PRICE_BOUNDS)
    for col in CATEGORICAL_FEATURES:
        combined[col] = combined[col].astype("category")
    return combined.reset_index(drop=True)


def build_metadata(sale_df: pd.DataFrame, rent_df: pd.DataFrame) -> dict:
    """Valid category values + sane numeric ranges, used by the API for
    input validation and by the frontend to populate dropdowns."""
    def cat_values(df, col, top_n=60):
        return sorted(df[col].value_counts().head(top_n).index.tolist())

    return {
        "sale": {
            "building_type": cat_values(sale_df, "building_type"),
            "division": cat_values(sale_df, "division"),
            "city": cat_values(sale_df, "city"),
            "locality": cat_values(sale_df, "locality", top_n=300),
            "area_sqft_range": [int(sale_df["area_sqft"].min()), int(sale_df["area_sqft"].max())],
            "bedrooms_range": [int(sale_df["bedrooms"].min()), int(sale_df["bedrooms"].max())],
            "bathrooms_range": [int(sale_df["bathrooms"].min()), int(sale_df["bathrooms"].max())],
        },
        "rent": {
            "building_type": cat_values(rent_df, "building_type"),
            "division": cat_values(rent_df, "division"),
            "city": cat_values(rent_df, "city"),
            "locality": cat_values(rent_df, "locality", top_n=300),
            "area_sqft_range": [int(rent_df["area_sqft"].min()), int(rent_df["area_sqft"].max())],
            "bedrooms_range": [int(rent_df["bedrooms"].min()), int(rent_df["bedrooms"].max())],
            "bathrooms_range": [int(rent_df["bathrooms"].min()), int(rent_df["bathrooms"].max())],
        },
    }
