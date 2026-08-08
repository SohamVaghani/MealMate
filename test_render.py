import urllib.request as r
try:
    print(r.urlopen('https://mealmate-7f4r.onrender.com/api/customer/restaurants/').read().decode('utf-8')[:100])
except Exception as e:
    print(e)
