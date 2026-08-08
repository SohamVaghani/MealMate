import urllib.request as r
import urllib.parse as p
import json

data = json.dumps({"username": "admin", "password": "password123"}).encode('utf-8')
req = r.Request(
    'https://mealmate-7f4r.onrender.com/api/auth/login/',
    data=data,
    headers={'Content-Type': 'application/json'}
)

try:
    response = r.urlopen(req)
    print(response.read().decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
    if hasattr(e, 'read'):
        print(e.read().decode('utf-8'))
