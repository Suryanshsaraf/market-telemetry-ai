import streamlit as st
import redis
import pandas as pd
import time
import requests

st.set_page_config(page_title="AI Market Telemetry", layout="wide", page_icon="📈")

st.title("🚨 AI-Powered Market Telemetry Dashboard")
st.markdown("Real-time anomaly detection and streaming price analysis.")

# Connect to Redis
@st.cache_resource
def get_redis():
    return redis.Redis(host='redis', port=6379, decode_responses=True)

try:
    r = get_redis()
    r.ping()
except BaseException:
    st.error("Cannot connect to Redis. Ensure backend is running.")
    st.stop()


col1, col2 = st.columns([2, 1])

with col1:
    st.subheader("Live Asset Monitoring")
    # Fetch all keys and get unique tickers
    keys = r.keys("price_hist:*")
    tickers = [k.split(":")[1] for k in keys]
    
    if not tickers:
        st.info("Waiting for data stream...")
    else:
        selected_ticker = st.selectbox("Select Asset to Monitor", tickers)

        if selected_ticker:
            placeholder = st.empty()
            
            # Simple polling mechanism for streamlit
            while True:
                with placeholder.container():
                    prices_str = r.lrange(f"price_hist:{selected_ticker}", 0, 100)
                    if prices_str:
                        # Redis LPUSH puts newest at 0. Reverse for chart.
                        prices = [float(p) for p in prices_str][::-1]
                        
                        df = pd.DataFrame({
                            "Ticks": range(len(prices)),
                            "Price": prices
                        })
                        
                        st.line_chart(df.set_index("Ticks"), use_container_width=True)
                        
                        current = prices[-1]
                        st.metric(label=f"Current {selected_ticker} Price", value=f"${current:.2f}")
                
                time.sleep(1)

with col2:
    st.subheader("Recent System Anomalies")
    
    # In a full design, anomalies might be saved to a persistent DB or a Redis list
    # Here we mock the feed or display the latest ones if we set up a Redis list for them
    st.markdown("""
    > **Anomaly Stream**
    > AI Models process the Z-Score of the last 120 ticks continuously.
    """)
    
    # We can query the FastAPI backend for active alerts to show
    try:
        # User ID here just gets the general alerts or we can fetch a specific system feed
        res = requests.get("http://webapp:8000/api/get-alerts?user_id=SYSTEM")
        if res.status_code == 200:
            alerts = res.json().get('alerts', [])
            if not alerts:
                st.success("All clear. No anomalies detected currently.")
            else:
                for alert in alerts:
                    st.warning(f"**{alert['ticker']}**: {alert['type']} threshold reached! ({alert['threshold']})")
    except:
        st.info("System alert feed unavailable.")
