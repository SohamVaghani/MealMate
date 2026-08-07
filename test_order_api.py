import urllib.request
try:
    res = urllib.request.urlopen("http://127.0.0.1:8000/api/restaurant/orders/")
    import json
    data = json.loads(res.read())
    print(f"Total returned orders: {len(data)}")
    if len(data) > 0:
        print("First order:")
        print(data[0])
except Exception as e:
    print(e)
