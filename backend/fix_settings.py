import os

filepath = "e:/MealMate/backend/mealmate_backend/settings.py"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add os import if missing
if "import os" not in content:
    content = "import os\n" + content

# Fix ALLOWED_HOSTS
if "ALLOWED_HOSTS = []" in content:
    content = content.replace("ALLOWED_HOSTS = []", "ALLOWED_HOSTS = ['*'] # Allowed all for Render")
elif "ALLOWED_HOSTS = ['*']" not in content:
    content = content.replace("ALLOWED_HOSTS =", "# ALLOWED_HOSTS = \nALLOWED_HOSTS = ['*']")

# Fix DATABASES
content = content.replace("'host': 'mongodb://localhost:27017'", "'host': os.environ.get('MONGO_URI', 'mongodb://localhost:27017')")

# Fix djongo strict mode
if "CORS_ALLOW_ALL_ORIGINS = True" not in content:
    content += "\nCORS_ALLOW_ALL_ORIGINS = True\n"

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
