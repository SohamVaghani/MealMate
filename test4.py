import urllib.request as r
try:
    print(len(r.urlopen('http://127.0.0.1:8000/api/customer/restaurants/').read()))
except Exception as e:
    with open('e:/MealMate/err3.html', 'w', encoding='utf-8') as f:
        f.write(e.read().decode('utf-8'))
