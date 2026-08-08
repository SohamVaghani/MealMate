import urllib.request as r
try:
    print(r.urlopen('https://mealmate-7f4r.onrender.com/api/restaurant/menu/').read().decode('utf-8')[:400])
except Exception as e:
    import traceback
    traceback.print_exc()
    if hasattr(e, 'read'):
        print(e.read().decode('utf-8')[:500])
