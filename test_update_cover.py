import urllib.request, json, urllib.error
try:
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/restaurant/update-cover/',
        data=json.dumps({'restaurant_id': 101, 'banner_url': 'test'}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    print(urllib.request.urlopen(req).read().decode())
except urllib.error.HTTPError as e:
    print('error', e.code, e.read().decode())
