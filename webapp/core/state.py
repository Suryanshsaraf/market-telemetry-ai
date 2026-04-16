import asyncio
from typing import Set

class Broadcaster:
    def __init__(self):
        self._clients: Set[asyncio.Queue] = set()
        self._lock = asyncio.Lock()

    async def register(self, max_queue_size: int = 200) -> asyncio.Queue:
        q: asyncio.Queue = asyncio.Queue(maxsize=max_queue_size)
        async with self._lock:
            self._clients.add(q)
        return q

    async def unregister(self, q: asyncio.Queue):
        async with self._lock:
            self._clients.discard(q)

    async def broadcast(self, message):
        """send to all clients; non-blocking."""
        async with self._lock:
            clients = list(self._clients)
        for q in clients:
            try:
                q.put_nowait(message)
            except asyncio.QueueFull:
                pass

price_broadcaster = Broadcaster()
alert_broadcaster = Broadcaster()
