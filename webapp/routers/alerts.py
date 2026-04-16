import time
import uuid
from fastapi import APIRouter, Cookie, HTTPException, Depends
from webapp.schemas import AlertCreate, AlertResponse, AlertDetails
from webapp.core.db import redis_client

router = APIRouter(prefix="/api", tags=["Alerts"])

def get_user_id(user_id: str = Cookie(None)):
    if not user_id:
        raise HTTPException(status_code=400, detail="Missing user_id cookie")
    return user_id

@router.post("/set-alert", response_model=AlertResponse)
async def set_alert(alert: AlertCreate, user_id: str = Depends(get_user_id)):
    alert_id = str(uuid.uuid4())
    
    # Store alert with user_id in Redis
    alert_key = f"alert:{alert_id}"
    mapping = {
        "user_id": user_id,
        "ticker": alert.ticker,
        "type": alert.type,
        "created_at": str(time.time())
    }
    
    if alert.threshold is not None:
        mapping["threshold"] = str(alert.threshold)
    if alert.time_window is not None:
        mapping["time_window"] = str(alert.time_window)
        
    redis_client.hset(alert_key, mapping=mapping)
    redis_client.sadd(f"user_alerts:{user_id}", alert_id)
    redis_client.sadd(f"ticker_alerts:{alert.ticker}", alert_id)
    
    return AlertResponse(message=f"Alert set for {alert.ticker}", alert_id=alert_id)

@router.get("/get-alerts", response_model=dict)
async def get_alerts(user_id: str = Depends(get_user_id)):
    alert_ids = redis_client.smembers(f"user_alerts:{user_id}")
    alerts = []
    
    for alert_id in alert_ids:
        alert_data = redis_client.hgetall(f"alert:{alert_id}")
        if alert_data:
            alerts.append({
                "alert_id": alert_id,
                "ticker": alert_data.get("ticker"),
                "threshold": float(alert_data.get("threshold", 0)),
                "type": alert_data.get("type"),
                "created_at": float(alert_data.get("created_at", 0)),
                "time_window": int(alert_data.get("time_window")) if alert_data.get("time_window") else None
            })
            
    alerts.sort(key=lambda x: x["created_at"], reverse=True)
    return {"alerts": alerts}

@router.delete("/delete-alert/{alert_id}")
async def delete_alert(alert_id: str, user_id: str = Depends(get_user_id)):
    alert_data = redis_client.hgetall(f"alert:{alert_id}")
    if not alert_data or alert_data.get("user_id") != user_id:
        raise HTTPException(status_code=404, detail="Alert not found or unauthorized")
        
    ticker = alert_data.get("ticker")
    redis_client.srem(f"user_alerts:{user_id}", alert_id)
    if ticker:
        redis_client.srem(f"ticker_alerts:{ticker}", alert_id)
    redis_client.delete(f"alert:{alert_id}")
    
    return {"message": "Alert deleted"}
