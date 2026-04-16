# Real-Time Stock Alerting & Analytics Platform 📈

An enterprise-grade, event-driven microservices architecture built to ingest, process, and visualize high-frequency stock market data in real-time. 

## 🚀 Overview & Architecture

This project was built to address the core challenges of streaming data pipelines at scale. Instead of relying on a standard monolithic CRUD architecture, this platform utilizes a **decoupled, asynchronous event-driven design**:

1. **Market High-Frequency Ingestion**: Background producers pull point-in-time stock prices and push them into **Apache Kafka** topics under high throughput.
2. **Asynchronous Processing**: Python consumers continuously poll Kafka to aggregate ticks, evaluate logic algorithms, and publish active states into **Redis** for sub-millisecond retrieval.
3. **API & Streaming**: A high-performance **FastAPI** backend subscribes to the event bus and streams real-time data to clients using **Server-Sent Events (SSE)**.
4. **Client-Side Rendering**: A modern **Next.js** frontend receives the stream, aggregates point-in-time ticks into OHLC candlesticks live in the browser, and renders them onto a TradingView-style dark mode terminal.

## 🛠️ Technology Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | `Next.js` (React), `TailwindCSS`, `Lightweight-Charts` |
| **Backend API** | `FastAPI`, `Python 3.11`, `Uvicorn` |
| **Message Broker** | `Apache Kafka` |
| **Caching Layer** | `Redis` |
| **Database** | `PostgreSQL` |
| **DevOps & Infrastructure**| `Docker Compose`, `Nginx` |
| **Observability/Monitoring**| `Prometheus`, `Grafana`, `Kafdrop` |
| **Load Testing** | `Locust`, `Apache Bench` |

## 📊 System Observability (DevOps)
The system is heavily instrumented for production-readiness. `prometheus-fastapi-instrumentator` natively tracks HTTP requests across the API, which are scraped by **Prometheus** every 10 seconds. 
A **Grafana** dashboard is provisioned out-of-the-box (`localhost:3005`) to visually monitor throughput, latency mappings, and status codes. The architecture easily handles stress loads (demonstrated successfully at 120,000+ requests).

## ⚡ Quick Start

The entire micro-architecture is portable and runs deterministically inside containers.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Suryanshsaraf/market-telemetry-ai.git
   cd market-telemetry-ai
   ```

2. **Spin up the cluster:**
   ```bash
   docker-compose up -d --build
   ```

3. **Access the Interfaces:**
   - **Trading Terminal (Frontend)**: `http://localhost:3001`
   - **Backend API Docs**: `http://localhost:8000/docs`
   - **Grafana Monitoring**: `http://localhost:3005` *(admin/admin)*
   - **Kafdrop (Kafka UI)**: `http://localhost:9000`

---
*Built to showcase modern Data Engineering, DevOps, and Full-Stack capability.*
