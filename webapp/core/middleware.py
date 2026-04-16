import time
import logging
from collections import defaultdict
from fastapi import Request
from fastapi.responses import JSONResponse

# Basic configuration for structured logging
logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s | %(levelname)-8s | %(name)s | %(message)s'
)
logger = logging.getLogger("webapp-api")

async def log_requests_middleware(request: Request, call_next):
    start_time = time.time()
    
    response = await call_next(request)
    
    process_time = time.time() - start_time
    logger.info(f"{request.method} {request.url.path} - Status: {response.status_code} - Latency: {process_time:.4f}s")
    
    return response

# Simple In-Memory Rate Limiter Middleware
# Tracks requests per IP
RATE_LIMIT_DURATION = 60
RATE_LIMIT_REQUESTS = 100

class RateLimiter:
    def __init__(self):
        self.requests = defaultdict(list)

    async def __call__(self, request: Request, call_next):
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        
        # Clean up old requests
        self.requests[client_ip] = [req_time for req_time in self.requests[client_ip] if now - req_time < RATE_LIMIT_DURATION]
        
        if len(self.requests[client_ip]) >= RATE_LIMIT_REQUESTS:
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            return JSONResponse(
                status_code=429,
                content={"error": "Too Many Requests", "message": "Rate limit exceeded"}
            )
            
        self.requests[client_ip].append(now)
        return await call_next(request)

rate_limit_middleware = RateLimiter()
