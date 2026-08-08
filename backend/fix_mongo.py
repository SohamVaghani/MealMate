import os

files = [
    "e:/MealMate/backend/core/api/auth.py",
    "e:/MealMate/backend/core/api/admin_api/views.py",
    "e:/MealMate/backend/core/api/customer_api/views.py",
    "e:/MealMate/backend/core/api/delivery_api/views.py",
    "e:/MealMate/backend/core/api/restaurant_api/views.py"
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Add `import os` at the top if not present
    if "import os" not in content:
        content = "import os\n" + content
    
    # Replace the hardcoded strings
    content = content.replace(
        "MongoClient('mongodb://localhost:27017/')", 
        "MongoClient(os.environ.get('MONGO_URI', 'mongodb://localhost:27017/'))"
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
