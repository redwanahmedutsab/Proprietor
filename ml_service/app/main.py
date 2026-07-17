import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import SalePredictRequest, RentPredictRequest, PredictResponse
from app.predict import engine

app = FastAPI(
    title="Proprietor Price Suggestion Service",
    description="AI price suggestions for Bangladesh property sale & rent listings.",
    version="1.0.0",
)

origins = os.environ.get("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _load_models():
    engine.load()


@app.get("/health")
def health():
    return {"status": "ok", "models_ready": engine.ready()}


@app.get("/metadata")
def metadata():
    """Valid dropdown values (division/city/locality/building_type) and
    numeric ranges for both purposes — used by the frontend form."""
    if not engine.ready():
        raise HTTPException(503, "Models still loading, try again shortly.")
    return engine.metadata


@app.post("/predict/sale", response_model=PredictResponse)
def predict_sale(req: SalePredictRequest):
    if not engine.ready():
        raise HTTPException(503, "Models still loading, try again shortly.")
    return engine.predict_sale(req.dict())


@app.post("/predict/rent", response_model=PredictResponse)
def predict_rent(req: RentPredictRequest):
    if not engine.ready():
        raise HTTPException(503, "Models still loading, try again shortly.")
    return engine.predict_rent(req.dict())
