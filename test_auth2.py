import urllib.request as r
import json
try:
    r.urlopen(r.Request('https://mealmate-7f4r.onrender.com/api/auth/login/', data=json.dumps({"username":"admin","password":"password123"}).encode(), headers={'Content-Type':'application/json'}))
except Exception as e:
    with open('auth_err.html', 'w', encoding='utf-8') as f:
        f.write(e.read().decode('utf-8'))
