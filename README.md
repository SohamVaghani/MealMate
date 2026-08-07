<div align="center">
  <img src="https://images.unsplash.com/photo-1526367790999-0150786686a2?auto=format&fit=crop&w=800&q=80" alt="MealMate Banner" width="100%" style="border-radius:20px;"/>

  <h1>🚀 MealMate: Advanced Food Delivery Ecosystem</h1>
  <p><strong>Major College Project Submission</strong> | <em>A production-grade, AI-driven aggregation platform</em></p>
</div>

---

## 📖 Overview
**MealMate** is a monolithic architecture mimicking tier-1 production applications (like UberEats / Zomato). It is explicitly designed to handle a quad-role ecosystem featuring Users, Restaurants, Delivery Partners, and super Admins. 

The platform utilizes a **Hybrid Django + MongoDB** architecture, blending traditional REST models with direct `PyMongo` pipelines to efficiently traverse 17 relational collections for hyper-fast metric aggregation, AI filtering, and transactional safety.

---

## 💻 Tech Stack
*   **🔌 Frontend:** React.js (Vite), TailwindCSS, Lucide-React, Axios, Web-Sockets Simulation (Polling).
*   **⚙️ Backend:** Django 3.x, Django REST Framework (DRF).
*   **🗄️ Database:** MongoDB natively via PyMongo Data pipelines (bypassing strict SQL constraints for NoSQL scalability).
*   **💳 Third-Party Services:** Razorpay Checkout Integration, Dynamic Google Maps iFrames (GPS).

---

## 🔥 Key Enterprise Features

### 1. 🧠 AI Recommendation Engine
*   **Collaborative Filtering:** Traverses a user's previous `core_order` arrays to analyze favorite purchase categories, mathematically predicting and appending highly targeted dishes to the user's dashboard at startup.

### 2. 💳 Smart Cart & Wallet Infrastructure
*   **Digital Ledger (Wallet):** Users are securely provisioned a virtual wallet. Checkouts deduct funds locally and communicate via PyMongo `$inc` operators to ensure atomic balance changes.
*   **Dynamic Checkout Math:** Implements enterprise-grade logic combining dynamic `Coupon Discouting` constraints alongside local `5% GST Tax` algorithms computed mathematically before finalizing payment payload states.

### 3. 🗺️ Rider Tracking & Gamification (Delivery App)
*   **Live Metrics:** Delivery Partners interface with a complex React UI handling polling-based live orders. When an order is taken, a live interactive UI overlay tracks pickup/dropoff points via Simulated GPS Maps.
*   **Gamification Constraints:** Features a "Daily Quest" sliding scale progress bar tracking active delivery counts natively into a target payout scheme.

### 4. 📊 Super-Admin Analytics Board
*   **Mongo Aggregations:** Uses `aggregate()` operators natively on MongoDB collections to compute active revenue numbers, total operational orders, and restaurant active states instantly to render chart overlays.

---

## 🛠️ Installation & Setup Guide

### Prerequisites
1.  **Node.js & npm** installed natively.
2.  **Python 3.10+** installed natively.
3.  **MongoDB Community Server** running locally on default port `27017` (Ensure `mongod` is active).

### Step 1: Clone & Setup Backend (Django)
```bash
cd backend
python -m venv venv
# Activate virtual environment (Windows: venv\Scripts\activate, Mac: source venv/bin/activate)

pip install -r requirements.txt
```

### Step 2: Seed The Architecture
Because this is a NoSQL ecosystem, DO NOT RUN regular SQL migrations. Run the massive Python seeder provided to wipe out glitches and perfectly inject Users, Restaurants, Menu Items, Wallets, and Orders:
```bash
python massive_seed.py
```

### Step 3: Run Servers
**Terminal 1 (Backend - Django):**
```bash
cd backend
python manage.py runserver --skip-checks
```
*(Note: `--skip-checks` hides cosmetic warnings about missing standard SQLite migrations since we explicitly bypass them in favor of PyMongo.)*

**Terminal 2 (Frontend - React):**
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173/` in your browser.

---

## 🔗 Core API Architectures & Endpoints
The platform isolates communication streams for explicit route security:
*   `GET /api/customer/recommendations/` - Resolves ML payload arrays.
*   `POST /api/customer/validate_coupon/` - Determines GST/Coupon legitimacy.
*   `GET /api/customer/wallet/` - Fetches dynamic real-time balances.
*   `PATCH /api/delivery/orders/<id>/update_status/` - Modifies Delivery workflow pipelines.
*   `GET /api/admin/metrics/` - Spits out SuperAdmin aggregation figures.

---
*Architected and engineered meticulously for final evaluation.*
