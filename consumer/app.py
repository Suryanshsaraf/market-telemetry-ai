from kafka import KafkaConsumer, KafkaProducer
from kafka.errors import NoBrokersAvailable
import redis
import json
import time

from ml_model import AnomalyDetector
from advanced_logic import AdvancedLogicEvaluator

print("Starting intelligent alert evaluator consumer...")

try:
    redis_client = redis.Redis(host='redis', port=6379, decode_responses=True)
    redis_client.ping()
    print("Connected to redis")
except Exception as e:
    print(f"Redis connection failed: {e}")
    exit(1)

max_retries = 10
retry_count = 0
consumer = None

while retry_count < max_retries:
    try:
        consumer = KafkaConsumer(
            'stock-prices',
            bootstrap_servers=['kafka:9092'],
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            auto_offset_reset='latest',
            enable_auto_commit=True,
            group_id='alert-evaluators'
        )
        break
    except NoBrokersAvailable:
        retry_count += 1
        time.sleep(5)

producer = None
retry_count = 0
while retry_count < max_retries:
    try:
        producer = KafkaProducer(
            bootstrap_servers=['kafka:9092'],
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
        break
    except:
        retry_count += 1
        time.sleep(5)

print("Monitoring stock prices for AI + Threshold alerts...")

last_alert_time = {}
ALERT_COOLDOWN = 10

detector = AnomalyDetector(redis_client, history_size=120, z_threshold=3.0)
logic_evaluator = AdvancedLogicEvaluator(redis_client)

def process_anomalies(ticker, price, current_time):
    anomaly = detector.add_price_and_evaluate(ticker, price)
    if anomaly:
        # Prevent spamming the same anomaly
        sys_alert_id = f"sys_anomaly_{ticker}"
        if sys_alert_id in last_alert_time and (current_time - last_alert_time[sys_alert_id]) < 60:
            return None
            
        last_alert_time[sys_alert_id] = current_time
        anomaly_payload = {
            "alert_id": sys_alert_id,
            "user_id": "SYSTEM", # Special keyword for global broadcasts
            "ticker": ticker,
            "price": price,
            "threshold": anomaly['z_score'],
            "type": "anomaly",
            "timestamp": current_time,
            "message": f"🚨 {anomaly['message']}"
        }
        return anomaly_payload
    return None

def check_user_alerts(ticker, price, current_time):
    triggered_alerts = []
    alert_ids = redis_client.smembers(f"ticker_alerts:{ticker}")
    if not alert_ids:
        return triggered_alerts
    
    for alert_id in alert_ids:
        if alert_id in last_alert_time and (current_time - last_alert_time[alert_id]) < ALERT_COOLDOWN:
            continue
        
        alert_data = redis_client.hgetall(f"alert:{alert_id}")
        if not alert_data:
            redis_client.srem(f"ticker_alerts:{ticker}", alert_id)
            continue
        
        user_id = alert_data.get('user_id')
        alert_type = alert_data.get('type')
        
        if logic_evaluator.evaluate(alert_data, price, ticker):
            last_alert_time[alert_id] = current_time
            
            payload = {
                "alert_id": alert_id,
                "user_id": user_id,
                "ticker": ticker,
                "price": price,
                "threshold": float(alert_data.get('threshold', 0)),
                "type": alert_type,
                "timestamp": current_time,
                "message": f"{ticker} triggered {alert_type} alert condition! (Current: ${price:.2f})"
            }
            triggered_alerts.append(payload)
            
            # Delete one-off alerts (keep anomaly or ma_crossover if they are persistent, but for now system is one-off)
            redis_client.srem(f"user_alerts:{user_id}", alert_id)
            redis_client.srem(f"ticker_alerts:{ticker}", alert_id)
            redis_client.delete(f"alert:{alert_id}")
            
    return triggered_alerts

for message in consumer:
    try:
        data = message.value
        ticker = data['ticker']
        price = data['price']
        current_time = time.time()
        
        # 1. AI Anomaly Detection
        sys_anomaly = process_anomalies(ticker, price, current_time)
        if sys_anomaly:
            producer.send('alerts', value=sys_anomaly)
            print(f"[ANOMALY DETECTED] {sys_anomaly['message']}")
            
        # 2. User logic evaluations
        user_alerts = check_user_alerts(ticker, price, current_time)
        
        for alert in user_alerts:
            producer.send('alerts', value=alert)
            print(f"[ALERT TRIGGERED] User {alert['user_id'][:8]}... | {ticker} {alert['type']} | Current: ${price:.2f}")
            
        if sys_anomaly or user_alerts:
            producer.flush()
            
    except Exception as e:
        print(f"Error processing message: {e}")