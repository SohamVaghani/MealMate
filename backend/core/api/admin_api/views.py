import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from core.models import User, Order, Restaurant, MenuItem, DeliveryPartnerProfile, CustomerProfile
from django.db.models import Sum

class AdminDashboardStatsView(APIView):
    permission_classes = [permissions.AllowAny] # Keeping AllowAny since auth isn't fully enabled yet

    def get(self, request):
        from pymongo import MongoClient
        from bson.objectid import ObjectId
        client = MongoClient(os.environ.get('MONGO_URI', 'mongodb://localhost:27017/'))
        db = client['mealmate_db']

        # 1. KPIs
        orders_delivered = list(db.core_order.find({"status": "DELIVERED"}))
        total_revenue = sum(float(str(o.get("total_amount", 0))) for o in orders_delivered)
        active_orders = db.core_order.count_documents({"status": {"$nin": ["DELIVERED", "CANCELLED"]}})
        restaurant_count = db.core_restaurant.count_documents({})
        fleet_count = db.core_deliverypartnerprofile.count_documents({})
        
        # 2. Recent Orders (limit 5)
        recent_orders_qs = db.core_order.find().sort("created_at", -1).limit(5)
        recent_orders = []
        for o in recent_orders_qs:
            r = db.core_restaurant.find_one({"id": o.get("restaurant_id")}) if o.get("restaurant_id") else None
            c = db.core_user.find_one({"id": o.get("customer_id")}) if o.get("customer_id") else None
            time_str = "Recent"
            if o.get("created_at"):
                time_str = o["created_at"].strftime("%H:%M") if hasattr(o["created_at"], "strftime") else str(o["created_at"])[:16]
                
            recent_orders.append({
                "id": f"ORD-{str(o['_id'])[-5:].upper()}",
                "restaurant": r["name"] if r else "Unknown",
                "customer": c["username"] if c else "Unknown",
                "amount": f"₹{float(str(o.get('total_amount', 0))):.2f}",
                "status": o.get("status", "PENDING"),
                "time": time_str
            })

        # 3. Delivery Fleet (limit 50)
        fleet_qs = db.core_deliverypartnerprofile.find().limit(50)
        fleet = []
        for f in fleet_qs:
            fu = db.core_user.find_one({"id": f.get("user_id")})
            fname = fu["username"] if fu else "Unknown"
            
            # Aggregate their orders
            f_orders_count = db.core_order.count_documents({"delivery_partner_id": f["id"]})
            
            fleet.append({
                "id": str(f["_id"]),
                "name": fname,
                "status": "Available" if f.get("is_online") else "Offline",
                "vehicle": f.get("vehicle_type", "Bicycle"),
                "rating": "4.8",
                "avatar": fname[:2].upper(),
                "color": "bg-emerald-500" if f.get("is_online") else "bg-slate-400",
                "orders_count": f_orders_count
            })

        # 3.5. Unassigned Orders (Pending Dispatch)
        unassigned_qs = db.core_order.find({
            "delivery_partner_id": None, 
            "status": {"$nin": ["DELIVERED", "CANCELLED"]}
        }).limit(10)
        
        unassigned_orders = []
        for o in unassigned_qs:
            r = db.core_restaurant.find_one({"_id": o.get("restaurant_id")})
            unassigned_orders.append({
                "raw_id": str(o["_id"]),
                "id": f"ORD-{str(o['_id'])[-5:].upper()}",
                "restaurant": r["name"] if r else "Unknown",
                "address": o.get("delivery_address", "")[:30]
            })

        # 4. Customers (All Users limit 100)
        users_qs = db.core_user.find().limit(100)
        customers = []
        for c in users_qs:
            # Aggregate customer orders
            c_orders = list(db.core_order.find({"customer_id": c["_id"]}))
            ltv = sum(float(str(o.get("total_amount", 0))) for o in c_orders if o.get("status") == "DELIVERED")
            
            customers.append({
                "id": str(c["_id"]),
                "name": c.get("username", ""),
                "email": c.get("email", f"{c.get('username', '')}@example.com"),
                "joined": "2026",
                "orders": len(c_orders),
                "ltv": f"₹{float(ltv):.2f}",
                "role": c.get("role", "CUSTOMER")
            })

        # 5. Restaurants
        restaurants_qs = db.core_restaurant.find().limit(50)
        restaurants = []
        for r in restaurants_qs:
            restaurants.append({
                "id": str(r["_id"]),
                "name": r.get("name", ""),
                "type": (r.get("description", "") or "Food")[:20],
                "status": "Online" if r.get("is_open") else "Offline",
                "rating": r.get("rating", 4.5),
                "banner_url": r.get("banner_url", "")
            })
            
        # 6. Pending Partners (from MongoDB, role: RESTAURANT, is_active: False)
        from pymongo import MongoClient
        client = MongoClient(os.environ.get('MONGO_URI', 'mongodb://localhost:27017/'))
        db = client['mealmate_db']
        pending_users_cursor = db.core_user.find({"role": "RESTAURANT", "is_active": False})
        pending_partners = []
        for u in pending_users_cursor:
            # We mock the restaurant name since they haven't set up the Restaurant table yet
            u_name = u.get("username", "Unknown")
            pending_partners.append({
                "id": str(u["_id"]),
                "name": u.get("first_name", "") + " " + u.get("last_name", "") if u.get("first_name") else u_name.capitalize(),
                "location": "Virtual Office",
                "type": "New Application",
                "time": "Just now",
                "email": u.get("email", "")
            })

        # 7. Menu Items (for Food Items Table)
        food_qs = db.core_menuitem.find().limit(200)
        food_items = []
        for fi in food_qs:
            fr = db.core_restaurant.find_one({"id": fi.get("restaurant_id")})
            food_items.append({
                "id": str(fi["_id"]),
                "name": fi.get("name", "Unknown"),
                "description": fi.get("description", "")[:40],
                "price": f"₹{float(fi.get('price', 0)):.2f}",
                "category": fi.get("category", "Main"),
                "is_available": fi.get("is_available", True),
                "restaurant": fr["name"] if fr else "Unknown",
                "image_url": fi.get("image_url", "")
            })

        # 8. All Orders (for Orders Table)
        all_orders_qs = db.core_order.find().sort("created_at", -1).limit(100)
        all_orders = []
        for o in all_orders_qs:
            r = db.core_restaurant.find_one({"id": o.get("restaurant_id")})
            c = db.core_user.find_one({"id": o.get("customer_id")})
            agent = db.core_deliverypartnerprofile.find_one({"id": o.get("delivery_partner_id")}) if o.get("delivery_partner_id") else None
            
            agent_name = "Unassigned"
            if agent:
                agent_user = db.core_user.find_one({"id": agent.get("user_id")})
                if agent_user: agent_name = agent_user.get("username", "Agent")
                
            all_orders.append({
                "raw_id": str(o['_id']),
                "id": f"ORD-{str(o['_id'])[-5:].upper()}",
                "customer": c["username"] if c else "Unknown",
                "restaurant": r["name"] if r else "Unknown",
                "items": f"{len(o.get('items', []))}x Items" if isinstance(o.get('items'), list) else "1x Item",
                "amount": f"₹{float(str(o.get('total_amount', 0))):.2f}",
                "status": o.get("status", "PENDING"),
                "agent": agent_name
            })

        return Response({
            "kpis": {
                "total_revenue": f"₹{float(total_revenue):.2f}",
                "active_orders": active_orders,
                "restaurant_count": restaurant_count,
                "fleet_count": fleet_count
            },
            "recent_orders": recent_orders,
            "unassigned_orders": unassigned_orders,
            "fleet": fleet,
            "customers": customers,
            "restaurants": restaurants,
            "pending_partners": pending_partners,
            "food_items": food_items,
            "all_orders": all_orders
        })

class DispatchOrderView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        order_id = request.data.get('order_id')
        driver_id = request.data.get('driver_id')
        status = request.data.get('status')
        try:
            from pymongo import MongoClient
            from bson.objectid import ObjectId
            client = MongoClient('mongodb://127.0.0.1:27017/')
            db = client['mealmate_db']
            _id = ObjectId(order_id)
            
            update_data = {}
            if driver_id:
                # Need the integer id of the driver
                driver_doc = db.core_deliverypartnerprofile.find_one({"_id": ObjectId(driver_id)})
                if driver_doc:
                    update_data['delivery_partner_id'] = driver_doc.get("id")
                    update_data['status'] = 'READY'
            if status:
                update_data['status'] = status
                
            if update_data:
                db.core_order.update_one({'_id': _id}, {'$set': update_data})
                
            return Response({"message": "Order updated successfully!"})
        except Exception as e:
            return Response({"error": str(e)}, status=400)

class ProcessPartnerView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        partner_id = request.data.get('partner_id')
        action = request.data.get('action') # 'accept' or 'reject'
        
        try:
            from pymongo import MongoClient
            from bson.objectid import ObjectId
            client = MongoClient('mongodb://127.0.0.1:27017/')
            db = client['mealmate_db']
            
            _id = ObjectId(partner_id)
            if action == 'accept':
                db.core_user.update_one({'_id': _id}, {'$set': {'is_active': True}})
                
                # Check if restaurant exists (to avoid duplicate)
                existing = db.core_restaurant.find_one({'owner_id': _id})
                if not existing:
                    user_data = db.core_user.find_one({'_id': _id})
                    name = user_data.get('first_name') or user_data.get('username') or 'New Restaurant'
                    db.core_restaurant.insert_one({
                        'owner_id': _id,
                        'name': name + ' (Setup Pending)',
                        'description': 'Welcome to MealMate!',
                        'address': 'To be updated',
                        'rating': 5.0,
                        'is_open': False,
                        'banner_url': ''
                    })
                    
                return Response({"message": "Partner request accepted successfully!"})
            elif action == 'reject':
                db.core_user.delete_one({'_id': _id})
                return Response({"message": "Partner request has been rejected and deleted."})
            else:
                return Response({"error": "Invalid action"}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

class ManageRestaurantView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        restaurant_id = request.data.get('restaurant_id')
        action = request.data.get('action')
        try:
            from pymongo import MongoClient
            from bson.objectid import ObjectId
            client = MongoClient('mongodb://127.0.0.1:27017/')
            db = client['mealmate_db']
            _id = ObjectId(restaurant_id)
            
            if action == 'toggle_status':
                rest = db.core_restaurant.find_one({'_id': _id})
                if rest:
                    new_status = not rest.get('is_open', False)
                    db.core_restaurant.update_one({'_id': _id}, {'$set': {'is_open': new_status}})
                    return Response({"message": f"Status updated to {'Online' if new_status else 'Offline'}"})
                return Response({"error": "Restaurant not found"}, status=404)
                
            elif action == 'delete':
                rest = db.core_restaurant.find_one({'_id': _id})
                if rest and rest.get('owner_id'):
                    db.core_user.delete_one({'_id': rest['owner_id']})
                db.core_restaurant.delete_one({'_id': _id})
                return Response({"message": "Restaurant permanently removed"})
                
            return Response({"error": "Invalid Action"}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

class ManageUserView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        user_id = request.data.get('user_id')
        role = request.data.get('role')
        try:
            from pymongo import MongoClient
            from bson.objectid import ObjectId
            client = MongoClient('mongodb://127.0.0.1:27017/')
            db = client['mealmate_db']
            _id = ObjectId(user_id)
            
            db.core_user.update_one({'_id': _id}, {'$set': {'role': role}})
            return Response({"message": f"User role updated to {role}"})
        except Exception as e:
            return Response({"error": str(e)}, status=400)

class ManageDriverView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        driver_id = request.data.get('driver_id')
        action = request.data.get('action')
        try:
            from pymongo import MongoClient
            from bson.objectid import ObjectId
            client = MongoClient('mongodb://127.0.0.1:27017/')
            db = client['mealmate_db']
            _id = ObjectId(driver_id)
            
            if action == 'delete':
                db.core_deliverypartnerprofile.delete_one({'_id': _id})
                return Response({"message": "Driver deleted successfully"})
            
            return Response({"error": "Invalid action"}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

class ManageFoodItemView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        item_id = request.data.get('item_id')
        action = request.data.get('action')
        try:
            from pymongo import MongoClient
            from bson.objectid import ObjectId
            client = MongoClient('mongodb://127.0.0.1:27017/')
            db = client['mealmate_db']
            _id = ObjectId(item_id)
            
            if action == 'toggle':
                item = db.core_menuitem.find_one({'_id': _id})
                if item:
                    new_status = not item.get('is_available', True)
                    db.core_menuitem.update_one({'_id': _id}, {'$set': {'is_available': new_status}})
                    return Response({"message": "Status updated"})
            elif action == 'delete':
                db.core_menuitem.delete_one({'_id': _id})
                return Response({"message": "Item deleted"})
            elif action == 'edit':
                price = request.data.get('price')
                if price is not None:
                    db.core_menuitem.update_one({'_id': _id}, {'$set': {'price': float(price)}})
                    return Response({"message": "Price updated"})
                    
            return Response({"error": "Invalid Action or Item not found"}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=400)

class SeedDataView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        import traceback
        from pymongo import MongoClient
        import random
        import datetime
        try:
            client = MongoClient('mongodb://127.0.0.1:27017/')
            db = client['mealmate_db']
            
            customersList = []
            for usr, email in [("emmaw", "e@w.com"), ("davidc", "d@c.com"), ("miker", "m@r.com"), ("sarahj", "s@j.com")]:
                u = db.core_user.find_one({'username': usr})
                if not u:
                    uid = db.core_user.insert_one({'username': usr, 'email': email, 'role': 'CUSTOMER', 'password': 'pass', 'is_superuser': False, 'is_staff': False, 'is_active': True, 'first_name': '', 'last_name': ''}).inserted_id
                else: uid = u['_id']
                
                c = db.core_customerprofile.find_one({'user_id': uid})
                if not c: cid = db.core_customerprofile.insert_one({'user_id': uid, 'saved_addresses': '123 Main St'}).inserted_id
                else: cid = c['_id']
                customersList.append(cid)

            restaurantsList = []
            for usr, r_name, r_desc, r_rating in [("burgerking", "Burger Joint", "Fast Food", 4.5), ("pizza99", "Pizza Heaven", "Pizza", 4.2), ("sushi8", "Sushi Master", "Sushi", 4.9)]:
                u = db.core_user.find_one({'username': usr})
                if not u:
                    uid = db.core_user.insert_one({'username': usr, 'role': 'RESTAURANT', 'password': 'pass', 'is_superuser': False, 'is_staff': False, 'is_active': True, 'first_name': '', 'last_name': '', 'email': ''}).inserted_id
                else: uid = u['_id']
                
                r = db.core_restaurant.find_one({'owner_id': uid})
                if not r: rid = db.core_restaurant.insert_one({'owner_id': uid, 'name': r_name, 'description': r_desc, 'address': 'City Center', 'rating': r_rating, 'is_open': True, 'banner_url': ''}).inserted_id
                else: rid = r['_id']
                restaurantsList.append(rid)

            fleetList = []
            for usr, vec, is_online in [("john_r", "Motorcycle", True), ("alex_r", "Bicycle", True), ("sam_s", "Scooter", False), ("mike_d", "Car", True)]:
                u = db.core_user.find_one({'username': usr})
                if not u:
                    uid = db.core_user.insert_one({'username': usr, 'role': 'DELIVERY', 'password': 'pass', 'is_superuser': False, 'is_staff': False, 'is_active': True, 'first_name': '', 'last_name': '', 'email': ''}).inserted_id
                else: uid = u['_id']
                
                dp = db.core_deliverypartnerprofile.find_one({'user_id': uid})
                if not dp: dpid = db.core_deliverypartnerprofile.insert_one({'user_id': uid, 'vehicle_number': f'XYZ-{random.randint(100,999)}', 'vehicle_type': vec, 'is_online': is_online, 'current_location': ''}).inserted_id
                else: dpid = dp['_id']
                fleetList.append(dpid)

            db.core_order.delete_many({'status': 'READY'})
            for _ in range(30):
                db.core_order.insert_one({
                    'status': 'DELIVERED', 'customer_id': random.choice(customersList), 'restaurant_id': random.choice(restaurantsList), 'delivery_partner_id': random.choice(fleetList),
                    'total_amount': str(round(random.uniform(15.0, 95.0), 2)), 'delivery_address': "Tech Hub", 'created_at': datetime.datetime.now(), 'updated_at': datetime.datetime.now()
                })
            
            for _ in range(5):
                db.core_order.insert_one({
                    'status': 'READY', 'customer_id': random.choice(customersList), 'restaurant_id': random.choice(restaurantsList), 'delivery_partner_id': None,
                    'total_amount': str(round(random.uniform(20.0, 50.0), 2)), 'delivery_address': "Dispatch Ave", 'created_at': datetime.datetime.now(), 'updated_at': datetime.datetime.now()
                })
                
            return Response({"message": "PyMongo Data Seeded Successfully!"})
        except Exception as e:
            return Response({"error": str(e), "trace": traceback.format_exc()})
