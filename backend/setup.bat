@echo off
echo Creating virtual environment...
python -m venv venv
echo Activating and installing...
call venv\Scripts\activate
pip install django==3.2.25 djongo pymongo sqlparse==0.2.4
echo Setting up Django project...
django-admin startproject mealmate_backend .
echo Creating core app files...
cd core
type nul > __init__.py
type nul > admin.py
type nul > views.py
echo Setup complete.
