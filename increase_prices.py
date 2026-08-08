import pymongo
import math
from pymongo import MongoClient

print("Connecting to local MongoDB...")
client = MongoClient("mongodb://localhost:27017/")
db = client["mealmate_db"]

items = list(db.core_menuitem.find())
print(f"Found {len(items)} menu items. Updating prices...")

for item in items:
    old_price = float(str(item.get("price", 0)))
    # Multiply by 85 for a realistic Rupee conversion, round to nearest 10
    new_price = math.ceil((old_price * 85) / 10.0) * 10
    
    # In some models price might be string or float, we'll write it back as float
    db.core_menuitem.update_one(
        {"_id": item["_id"]},
        {"$set": {"price": float(new_price)}}
    )

print("Updated prices successfully!")
