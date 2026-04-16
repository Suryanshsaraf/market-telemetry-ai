# 🧠 AI-Powered Real-Time Stock Alert System

An enterprise-grade, event-driven microservices platform designed for high-frequency stock monitoring, powered by Machine Learning for real-time anomaly detection.

## 🌟 Overview

This system monitors financial assets in real-time and pipelines pricing data through Apache Kafka. Intelligent consumers evaluate tick data using Z-Score statistical anomaly detection while concurrently evaluating personalized user thresholds (MA crossovers, percentage spikes, etc.).

### 🚀 Key Features
- **AI Anomaly Detection**: Unsupervised Z-Score evaluation over a lightweight Redis sliding window.
- **Dual Telemetry Dashboards**: 
  - *Vanilla JS Premium UI*: Low-latency WebSocket/SSE client for end-user threshold configuration.
  - *Streamlit Analytics App*: Real-time live chart rendering and anomaly surveillance feed.
- **Microservices & Kafka**: Highly horizontally scalable architecture.
- **SMTP Notification Dispatcher**: Abstracted provider system built to easily plugin SMS or Push.

---

## 🏗️ Architecture

```text
┌──────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (10k+ Users)                 │
│  [Vanilla JS Premium Dashboard]      [Streamlit Analytics]   │
│  * SSE/WebSocket Streams             * Direct Redis Polling  │
└────────────────────────┬─────────────────────┬───────────────┘
                         │                     │
                         ↓                     ↓
┌────────────────────────────────────────────────────────────┐
│                    FASTAPI GATEWAY                         │
│  - Clean Router Architecture (Alerts + Streams)            │
│  - Middleware: Rate Limiting & Structured Logging          │
│  - Pydantic Validation & Security                          │
└───────────┬────────────────────┬───────────────────────────┘
            │                    │
            ↓                    ↓
┌──────────────────────┐  ┌──────────────────────────────────┐
│   REDIS (State Store)│  │    KAFKA MESSAGE BROKER          │
│   ├─ Sliding Windows │  │    ├─ topic: stock-prices        │
│   ├─ Config/Tokens   │  │    └─ topic: alerts              │
└───────────┬──────────┘  └──────────┬───────────────────────┘
            │                        │
            ↓                        ↓
┌─────────────────────┐      ┌─────────────────────────────┐
│  AI CONSUMER NODE   │──────│  NOTIFIER DISPATCHER        │
│  - ml_model.py      │      │  - SMTPProvider (email)     │
│  - advanced_logic.py│      │  - Abstract Base Classes    │
└─────────────────────┘      └─────────────────────────────┘
```

---

## 🛠️ Technology Stack
- **Backend Core**: Python 3.11, FastAPI, Pydantic
- **Message Broker**: Confluent Kafka (KRaft Mode)
- **State/Caching**: Redis 7
- **Machine Learning**: NumPy, Pandas
- **UI/UX**: HTML5, Vanilla JS, CSS Grid, Streamlit
- **DevOps**: Docker, Docker Compose (Multi-stage slim/alpine builds)

---

## 🚀 Setup & Deployment

### Prerequisites
- Docker Engine & Docker Compose
- Port availability: `80` (Nginx), `8000` (FastAPI), `8501` (Streamlit), `9092` (Kafka)

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd ai-stock-alerts
   ```

2. **Configure Environment Variables:**
   For email alerts, configure SMTP in `docker-compose.yml` under the `notifier` service.
   ```yaml
   SMTP_USER: "your-email@gmail.com"
   SMTP_PASS: "your-app-password"
   ```

3. **Deploy the Cluster:**
   ```bash
   docker-compose up -d --build
   ```

4. **Access the Application:**
   - **User Dashboard (FastAPI/Nginx)**: `http://localhost:80`
   - **AI Analytics (Streamlit)**: `http://localhost:8501`
   - **Kafka Management (Kafdrop)**: `http://localhost:9000`

---

## 💻 Code Quality & Structure
The system enforces strict Clean Architecture principles:
- **`webapp/core/`**: Middlewares, State management, DB singletons.
- **`webapp/routers/`**: Pydantic-validated endpoint definitions.
- **`consumer/ml_model.py`**: Isolated Numpy-based statistical processing isolated from network I/O.
- **Multi-Stage Builds**: Docker images are heavily optimized down to runtime binaries.

> "A scalable backbone meets intelligent evaluation."
