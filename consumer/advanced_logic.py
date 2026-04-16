import time

class AdvancedLogicEvaluator:
    def __init__(self, redis_client):
        self.redis = redis_client
    
    def evaluate(self, alert_data, current_price, ticker):
        """
        Evaluate an alert based on its type.
        Returns a boolean indicating if it triggered.
        """
        alert_type = alert_data.get('type')
        threshold = float(alert_data.get('threshold', 0))
        
        # 1. Standard Threshold Alert
        if alert_type == 'above':
            return current_price > threshold
        elif alert_type == 'below':
            return current_price < threshold
            
        # 2. Percentage Change Alert
        elif alert_type == 'percent_change':
            # Look back in redis history based on time_window
            # Note: For simplicity, we assume 1 message ~ 1 sec, so time_window = items in list
            time_window = int(alert_data.get('time_window', 60))
            key = f"price_hist:{ticker}"
            
            # Fetch the old price
            prices = self.redis.lrange(key, 0, time_window)
            if len(prices) < time_window:
                return False # Not enough history yet
            
            old_price = float(prices[-1])
            percent_change = ((current_price - old_price) / old_price) * 100
            
            # If threshold is positive, look for positive spike. Negative, look for drop.
            if threshold > 0 and percent_change >= threshold:
                return True
            elif threshold < 0 and percent_change <= threshold:
                return True
                
        # 3. Moving Average Crossover (MA Crossover)
        elif alert_type == 'ma_crossover':
            # E.g., threshold = 50 for 50-tick moving average.
            ma_window = int(threshold)
            key = f"price_hist:{ticker}"
            
            prices = self.redis.lrange(key, 0, ma_window)
            if len(prices) < ma_window:
                return False
                
            historical = [float(p) for p in prices]
            ma = sum(historical) / len(historical)
            
            # We trigger if the price crosses the MA (we could track previous state, but here we just check if it's deviated by 0.5% above MA)
            # A true crossover requires state tracking, but for a real-time system without complex state machines per alert, 
            # we check if current price crosses significantly (e.g. current > MA by a margin)
            
            # Simplification: trigger if currently > MA but previous was < MA
            if len(historical) >= 2:
                prev_price = historical[1]
                prev_historical = historical[1:]
                prev_ma = sum(prev_historical) / len(prev_historical)
                
                # Cross UP
                if prev_price <= prev_ma and current_price > ma:
                    return True
                # Cross DOWN
                if prev_price >= prev_ma and current_price < ma:
                    return True
                    
        return False
