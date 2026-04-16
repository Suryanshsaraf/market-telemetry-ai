import asyncio
import json
import threading
import time
import uuid

from fastapi import FastAPI, Request, Response, Cookie
from fastapi.responses import HTMLResponse
from kafka import KafkaConsumer
from kafka.errors import NoBrokersAvailable

from webapp.core.middleware import log_requests_middleware, rate_limit_middleware
from webapp.core.state import price_broadcaster, alert_broadcaster, Broadcaster
from webapp.routers import alerts, streams
from webapp.schemas import HealthResponse

app = FastAPI(title="AI-Powered Stock Alert Dashboard")

# Middlewares
app.middleware("http")(rate_limit_middleware)
app.middleware("http")(log_requests_middleware)

# Routers
app.include_router(alerts.router)
app.include_router(streams.router)

def kafka_consumer_runner(topic: str, loop: asyncio.AbstractEventLoop, broadcaster: Broadcaster, stop_event: threading.Event):
    max_retries = 10
    retry = 0
    consumer = None

    while not stop_event.is_set() and retry < max_retries:
        try:
            consumer = KafkaConsumer(
                topic,
                bootstrap_servers=["kafka:9092"],
                value_deserializer=lambda m: json.loads(m.decode("utf-8")),
                auto_offset_reset="latest",
                group_id=f"shared-{topic}-consumer"
            )
            print(f"[kafka_consumer_runner] Connected to topic: {topic}")
            break
        except NoBrokersAvailable:
            retry += 1
            time.sleep(5)

    if consumer is None:
        return

    try:
        for message in consumer:
            if stop_event.is_set():
                break
            value = message.value
            asyncio.run_coroutine_threadsafe(broadcaster.broadcast(value), loop)
    except Exception as e:
        print(f"[kafka_consumer_runner] Error: {e}")
    finally:
        try:
            consumer.close()
        except:
            pass

_consumer_threads = []
_stop_events = []

@app.on_event("startup")
async def startup_event():
    loop = asyncio.get_event_loop()
    for topic, broadcaster in (("stock-prices", price_broadcaster), ("alerts", alert_broadcaster)):
        stop_event = threading.Event()
        t = threading.Thread(
            target=kafka_consumer_runner,
            args=(topic, loop, broadcaster, stop_event),
            daemon=True
        )
        t.start()
        _consumer_threads.append(t)
        _stop_events.append(stop_event)

@app.on_event("shutdown")
async def shutdown_event():
    for ev in _stop_events:
        ev.set()
    for t in _consumer_threads:
        t.join(timeout=5)

def get_or_create_user_id(user_id: str = None) -> tuple[str, bool]:
    if user_id:
        return user_id, False
    return str(uuid.uuid4()), True

@app.get("/", response_class=HTMLResponse)
async def home(response: Response, user_id: str = Cookie(None)):
    user_id, is_new = get_or_create_user_id(user_id)
    
    if is_new:
        response.set_cookie(
            key="user_id",
            value=user_id,
            max_age=31536000,
            httponly=True,
            samesite="lax"
        )
    
    with open("index.html", "r") as f:
        html_content = f.read()
        html_content = html_content.replace(
            "<!-- USER_ID_PLACEHOLDER -->", 
            f'<script>window.USER_ID = "{user_id}";</script>'
        )
    
    return HTMLResponse(content=html_content)

@app.get("/health", response_model=HealthResponse)
def health():
    return HealthResponse(status="healthy")