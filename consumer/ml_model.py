import numpy as np
import time

class AnomalyDetector:
    def __init__(self, redis_client, history_size=120, z_threshold=3.0):
        # We use Redis to keep a centralized history of prices per ticker
        # Useful for distributed consumer instances
        self.redis = redis_client
        self.history_size = history_size
        self.z_threshold = z_threshold
    
    def add_price_and_evaluate(self, ticker: str, price: float):
        """
        Push new price to Redis list and evaluate Z-Score anomaly.
        Returns anomaly details if detected, else None.
        """
        key = f"price_hist:{ticker}"
        
        # Add price points
        self.redis.lpush(key, price)
        self.redis.ltrim(key, 0, self.history_size - 1)
        
        # We need enough data to form a reasonable statistical baseline
        prices_str = self.redis.lrange(key, 0, -1)
        if len(prices_str) < 30: # Minimum 30 frames to calculate z_score
            return None
            
        prices = np.array([float(p) for p in prices_str])
        
        # Latest price is at index 0 because of lpush
        recent_price = prices[0]
        historical = prices[1:]
        
        mean = np.mean(historical)
        std = np.std(historical)
        
        if std == 0:
            return None
            
        z_score = (recent_price - mean) / std
        
        # If absolute z-score exceeds threshold
        if abs(z_score) > self.z_threshold:
            percent_change = ((recent_price - mean) / mean) * 100
            direction = "spiked" if z_score > 0 else "dropped"
            
            return {
                "z_score": float(z_score),
                "mean_base": float(mean),
                "percent_change": float(percent_change),
                "message": f"Anomaly detected: price {direction} by {percent_change:+.2f}% within window.",
                "type": "anomaly"
            }
            
        return None
