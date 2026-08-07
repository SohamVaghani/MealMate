import urllib.request as u
import json
res = u.urlopen('http://127.0.0.1:8000/api/restaurant/menu/')
print(json.dumps(json.loads(res.read()), indent=2))
