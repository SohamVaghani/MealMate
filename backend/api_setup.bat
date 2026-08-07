@echo off
echo Setting up API Folders...
cd core
mkdir api
cd api
type nul > __init__.py

mkdir admin_api
type nul > admin_api\__init__.py
type nul > admin_api\serializers.py
type nul > admin_api\urls.py
type nul > admin_api\views.py

mkdir customer_api
type nul > customer_api\__init__.py
type nul > customer_api\serializers.py
type nul > customer_api\urls.py
type nul > customer_api\views.py

mkdir restaurant_api
type nul > restaurant_api\__init__.py
type nul > restaurant_api\serializers.py
type nul > restaurant_api\urls.py
type nul > restaurant_api\views.py

mkdir delivery_api
type nul > delivery_api\__init__.py
type nul > delivery_api\serializers.py
type nul > delivery_api\urls.py
type nul > delivery_api\views.py

echo Folders Created!
