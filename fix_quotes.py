import os
path = "e:/MealMate/frontend/src/pages/"
files = ["UserDashboard.jsx", "RestaurantDashboard.jsx", "DeliveryDashboard.jsx"]

for file in files:
    filepath = os.path.join(path, file)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Find where the template literal was screwed up
    content = content.replace("`(import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/api", "`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api")
    
    # Also fix RestaurantDashboard patch that was inside backticks
    content = content.replace("`(import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000') + '/api/restaurant/orders/${id}/`", "`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/restaurant/orders/${id}/`")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
