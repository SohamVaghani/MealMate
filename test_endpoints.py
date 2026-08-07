import urllib.request
import json
import traceback

def fetch(url):
    try:
        req = urllib.request.urlopen(url)
        print(f"[OK] {url}")
    except Exception as e:
        print(f"[ERROR] {url} -> {e}")
        try:
            print(e.read().decode('utf-8'))
        except:
            traceback.print_exc()

endpoints = [
    'http://127.0.0.1:8000/api/restaurant/menu/',
    'http://127.0.0.1:8000/api/customer/restaurants/',
    'http://127.0.0.1:8000/api/customer/orders/?customer_id=1',
    'http://127.0.0.1:8000/api/customer/wallet/?customer_id=1',
    'http://127.0.0.1:8000/api/customer/recommendations/',
    'http://127.0.0.1:8000/api/customer/validate_coupon/?customer_id=1'
]

for url in endpoints:
    fetch(url)
