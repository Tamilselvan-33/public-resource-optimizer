from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Any
from optimization import allocate_resources


class VillageModel(BaseModel):
  id: str
  name: str
  population: int
  elderlyPopulation: int
  vulnerabilityIndex: float
  nearestHospitalDistance: float
  availableResources: int = 0
  maxResourcesCapacity: int = 10
  currentSituationSeverity: int = 0


class RequestModel(BaseModel):
  id: str
  severity: int
  village: VillageModel | None = None


class AmbulanceModel(BaseModel):
  id: str
  location: List[float]


class OptimizationPayload(BaseModel):
  requests: List[RequestModel]
  ambulances: List[AmbulanceModel]


app = FastAPI(title="AI Optimization Engine", version="1.0.0")


@app.get("/health")
def health():
  return {"status": "ok", "service": "ai-engine"}


@app.post("/optimize/resources")
def optimize_resources(payload: OptimizationPayload) -> Dict[str, Any]:
  result = allocate_resources(payload.dict())
  return result

