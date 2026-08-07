import urllib.request, json, urllib.error
try:
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/restaurant/menu/991/',
        data=json.dumps({"name": "Test Update"}).encode(),
        headers={'Content-Type': 'application/json'},
        method='PUT'
    )
    res = urllib.request.urlopen(req)
    print("STATUS:", res.status)
    print("RESPONSE:", res.read().decode())
except urllib.error.HTTPError as e:
    print('HTTP ERROR', e.code, e.read().decode())
except Exception as e:
    print('ERROR', e)
