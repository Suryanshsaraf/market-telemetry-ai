from pydantic import BaseModel, Field
from typing import Optional

class AlertCreate(BaseModel):
    ticker: str = Field(..., description="Stock or asset ticker symbol")
    type: str = Field(..., description="Alert condition: above, below, percent_change, ma_crossover, anomaly")
    threshold: Optional[float] = Field(None, description="Price threshold or percentage depending on type")
    time_window: Optional[int] = Field(None, description="Time window in seconds for sliding window alerts (anomaly, percent_change)")

class AlertResponse(BaseModel):
    message: str
    alert_id: str

class AlertDetails(BaseModel):
    alert_id: str
    ticker: str
    threshold: float
    type: str
    created_at: float
    time_window: Optional[int] = None

class HealthResponse(BaseModel):
    status: str
