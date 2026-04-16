import asyncio
import json
import time
from fastapi import APIRouter, Request, Cookie, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from webapp.core.state import price_broadcaster, alert_broadcaster

router = APIRouter(prefix="/api", tags=["Streams"])

async def sse_event_generator(client_queue: asyncio.Queue, heartbeat_interval: float = 15.0):
    last_heartbeat = time.time()
    try:
        while True:
            try:
                timeout = max(0, last_heartbeat + heartbeat_interval - time.time())
                message = await asyncio.wait_for(client_queue.get(), timeout=timeout)
                yield f"data: {json.dumps(message)}\n\n"
            except asyncio.TimeoutError:
                last_heartbeat = time.time()
                yield ": heartbeat\n\n"
    finally:
        return

@router.get("/stream-prices")
async def stream_prices(request: Request):
    client_q = await price_broadcaster.register(max_queue_size=200)

    async def event_gen():
        try:
            async for chunk in sse_event_generator(client_q):
                yield chunk
                if await request.is_disconnected():
                    break
        finally:
            await price_broadcaster.unregister(client_q)

    return StreamingResponse(event_gen(), media_type="text/event-stream")

@router.get("/stream-alerts")
async def stream_alerts(request: Request, user_id: str = Cookie(None), q_user_id: str = None):
    uid = user_id or q_user_id
    if not uid:
        return {"error": "No user_id provided"} 

    client_q = await alert_broadcaster.register(max_queue_size=200)

    async def event_gen():
        try:
            async for chunk in sse_event_generator(client_q):
                if chunk.startswith("data: "):
                    try:
                        data = json.loads(chunk[6:])
                        uid = data.get("user_id")
                        if uid == user_id or uid == "SYSTEM":
                            yield chunk
                    except:
                        pass
                else:
                    yield chunk
                
                if await request.is_disconnected():
                    break
        finally:
            await alert_broadcaster.unregister(client_q)

    return StreamingResponse(event_gen(), media_type="text/event-stream")


@router.websocket("/ws/stream")
async def websocket_stream(websocket: WebSocket, user_id: str = Cookie(None)):
    await websocket.accept()
    if not user_id:
        await websocket.close(code=1008)
        return

    price_q = await price_broadcaster.register(max_queue_size=200)
    alert_q = await alert_broadcaster.register(max_queue_size=200)

    try:
        while True:
            # Race between prices, alerts, and client disconnect
            done, pending = await asyncio.wait(
                [
                    asyncio.create_task(price_q.get()),
                    asyncio.create_task(alert_q.get()),
                    asyncio.create_task(websocket.receive_text())
                ],
                return_when=asyncio.FIRST_COMPLETED
            )
            
            for task in done:
                res = task.result()
                if isinstance(res, str):
                    # received text from client
                    continue
                # It's a dict from our broadcaster
                # If it's an alert, make sure it belongs to the user
                if "user_id" in res:
                    if res["user_id"] == user_id:
                        await websocket.send_json({"type": "alert", "data": res})
                else:
                    await websocket.send_json({"type": "price", "data": res})

            for task in pending:
                task.cancel()

    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        await price_broadcaster.unregister(price_q)
        await alert_broadcaster.unregister(alert_q)
