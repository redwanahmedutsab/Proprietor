from typing import Optional
from pydantic import BaseModel, Field


class SalePredictRequest(BaseModel):
    area_sqft: float = Field(..., gt=0, description="Property size in square feet")
    bedrooms: int = Field(..., ge=0, le=15)
    bathrooms: int = Field(..., ge=0, le=15)
    building_type: str = Field(..., description="e.g. Apartment, House, Office, Shop, Land")
    division: str = Field(..., description="e.g. Dhaka, Chattogram")
    city: str
    locality: str = Field(..., description="Neighbourhood, e.g. Gulshan, Bashundhara R-A")
    total_amenities: Optional[int] = Field(
        default=None, ge=0,
        description="Total count of listed amenities (security, lift, gym, etc). "
                     "If unknown, leave blank and a typical value will be assumed."
    )


class RentPredictRequest(BaseModel):
    area_sqft: float = Field(..., gt=0)
    bedrooms: int = Field(..., ge=0, le=15)
    bathrooms: int = Field(..., ge=0, le=15)
    building_type: str
    division: str
    city: str
    locality: str


class PredictResponse(BaseModel):
    purpose: str                 # "sale" | "rent"
    suggested_price: float       # point estimate, BDT (per month for rent)
    price_low: float             # low end of confidence band
    price_high: float            # high end of confidence band
    price_per_sqft: float
    currency: str = "BDT"
    unit: str                    # "total" | "per month"
    model_mape_pct: float        # typical model error %, so caller knows the margin
    note: str
