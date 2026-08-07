from pymongo import MongoClient
import random
from datetime import datetime, timedelta

def seed_custom_chart_orders():
    client = MongoClient('mongodb://localhost:27017/')
    db = client['mealmate_db']
    
    # Let's generate a beautiful wave of orders for the chart!
    # Heights to make it look like a nice bell curve/wave of sales.
    amounts = [15.50, 22.00, 35.50, 48.00, 75.25, 95.00, 120.00, 85.50, 65.00, 52.00, 41.50, 29.99, 58.00, 89.99, 115.50]
    
    max_id_doc = db.core_order.find_one(sort=[("id", -1)])
    start_id = max_id_doc['id'] + 1 if max_id_doc and 'id' in max_id_doc else 8000
    
    orders = []
    base_time = datetime.utcnow() - timedelta(hours=5)
    
    # Which restaurant are they logged in as? Probably Burger Bliss (101) or Pizza Paradise (102). We'll seed to both so they see it.
    for r_id in [101, 102, 103]:
        for i, val in enumerate(amounts):
            order = {
                "id": start_id,
                "customer_id": 1,
                "restaurant_id": r_id,
                "status": random.choice(["COMPLETED", "DELIVERED"]),
                "total_amount": float(val),
                "discount_amount": 0.0,
                "payment_method": "ONLINE",
                "delivery_address": "Test Chart Data",
                "created_at": base_time + timedelta(minutes=i*15)
            }
            orders.append(order)
            start_id += 1
            
    db.core_order.insert_many(orders)
    print(f"✅ Successfully seeded {len(orders)} chart visualization orders!")

if __name__ == '__main__':
    seed_custom_chart_orders()
