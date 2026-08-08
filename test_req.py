import urllib.request as r
try:
    with open('test_out.html', 'w', encoding='utf-8') as f:
        f.write(r.urlopen('https://mealmate-7f4r.onrender.com/api/customer/orders/?customer_id=1000').read().decode('utf-8'))
except Exception as e:
    import traceback
    with open('test_out.html', 'w', encoding='utf-8') as f:
        traceback.print_exc(file=f)
        if hasattr(e, 'read'):
            f.write("\n" + e.read().decode('utf-8'))
