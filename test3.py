import urllib.request as r
print(len(r.urlopen('http://127.0.0.1:8000/api/customer/restaurants/').read()))
