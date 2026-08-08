import os

files = [
    "e:/MealMate/frontend/src/pages/UserDashboard.jsx",
    "e:/MealMate/frontend/src/pages/RestaurantDashboard.jsx", 
    "e:/MealMate/frontend/src/pages/DeliveryDashboard.jsx",
    "e:/MealMate/frontend/src/pages/AdminDashboard.jsx",
    "e:/MealMate/frontend/src/pages/AuthPage.jsx"
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        c = f.read()
    
    # Fix backticks
    c = c.replace("`YOUR_BACKEND_URL/", "`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(c)
