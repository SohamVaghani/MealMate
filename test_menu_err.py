import urllib.request as r
try:
    r.urlopen('https://mealmate-7f4r.onrender.com/api/restaurant/menu/')
except Exception as e:
    with open('menu_err.html', 'w', encoding='utf-8') as f:
        f.write(e.read().decode('utf-8'))
