# Stage 1: Build
FROM python:3.11-slim as builder

RUN apt-get update && apt-get install -y build-essential gcc

WORKDIR /build
COPY requirements.txt .

# We need numpy for ml_model, ensure it's in requirements 
# (if not, we'll pipe it explicitly but typically requirements.txt handles it)
RUN pip install --user --no-cache-dir numpy redis kafka-python

# Stage 2: Runtime
FROM python:3.11-slim

WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .

ENV PATH=/root/.local/bin:$PATH

CMD ["python", "app.py"]
