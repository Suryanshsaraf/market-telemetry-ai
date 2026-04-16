from kafka import KafkaConsumer
from kafka.errors import NoBrokersAvailable
import json
import time
from providers import SMTPProvider

print("Starting Notification Service...")

max_retries = 10
retry_count = 0
consumer = None

while retry_count < max_retries:
    try:
        consumer = KafkaConsumer(
            'alerts',
            bootstrap_servers=['kafka:9092'],
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            auto_offset_reset='earliest',
            enable_auto_commit=True,
            group_id='notification-dispatchers'
        )
        print("Connected to Kafka!")
        break
    except NoBrokersAvailable:
        retry_count += 1
        time.sleep(5)

if consumer is None:
    print("Failed to connect to Kafka")
    exit(1)

# Initialize Provider (falls back to mock if env vars are missing)
provider = SMTPProvider()

print("Listening for intelligent alerts...")
print("=" * 70)

for message in consumer:
    alert = message.value
    
    ticker = alert.get("ticker", "UNKNOWN")
    msg = alert.get("message", "")
    alert_type = alert.get("type", "standard")
    
    subject = f"Antigravity Alert: {ticker}"
    if alert_type == "anomaly":
        subject = f"🚨 AI Anomaly Detected: {ticker}"
        
    # In a full system, we would query the User database for their email.
    # We will log or send to a default email for demonstration.
    destination = "user@example.com"
    
    print("\n" + "=" * 70)
    print("DISPATCHING NOTIFICATION")
    print("=" * 70)
    provider.send(destination, subject, msg)
    print("=" * 70 + "\n")