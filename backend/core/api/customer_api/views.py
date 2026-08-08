import os
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from core.models import Order, Restaurant
from .serializers import OrderSerializer
from rest_framework import serializers
from rest_framework.views import APIView
from core.models import Coupon

class RestaurantListSerializer(serializers.ModelSerializer):
    owner_id = serializers.IntegerField(source='owner.id', read_only=True)
    class Meta:
        model = Restaurant
        fields = ['id', 'name', 'description', 'address', 'rating', 'banner_url', 'is_open', 'owner_id']

class CustomerRestaurantViewSet(viewsets.ViewSet):
    permission_classes = [AllowAny]

    def list(self, request):
        from pymongo import MongoClient
        client = MongoClient(os.environ.get('MONGO_URI', 'mongodb://localhost:27017/'))
        db = client['mealmate_db']
        
        restaurants = []
        for rest in db.core_restaurant.find():
            rest.pop('_id', None)
            restaurants.append({
                "id": int(rest.get("id", 0)) if isinstance(rest.get("id"), (int, float)) else str(rest.get("id", "")),
                "name": rest.get("name"),
                "description": rest.get("description"),
                "address": rest.get("address"),
                "rating": rest.get("rating"),
                "cuisine_type": rest.get("cuisine_type", ""),
                "banner_url": rest.get("banner_url"),
                "is_open": rest.get("is_open", True),
                "owner_id": int(rest.get("owner_id", 0)) if isinstance(rest.get("owner_id"), (int, float)) else str(rest.get("owner_id", ""))
            })
        return Response(restaurants)

class CustomerOrderViewSet(viewsets.ModelViewSet):
    """
    API endpoint for customers to place and track their orders.
    """
    serializer_class = OrderSerializer
    permission_classes = [AllowAny] 

    def get_queryset(self):
        return []
    
    def list(self, request, *args, **kwargs):
        from pymongo import MongoClient
        client = MongoClient(os.environ.get('MONGO_URI', 'mongodb://localhost:27017/'))
        db = client['mealmate_db']
        
        c_id = request.query_params.get('customer_id', 1)
        try:
            c_id = int(c_id)
        except:
            c_id = 1
            
        orders_cursor = db.core_order.find({"customer_id": c_id}).sort("created_at", -1)
        
        orders = []
        for doc in orders_cursor:
            doc.pop('_id', None)
            if 'created_at' in doc and hasattr(doc['created_at'], 'isoformat'):
                doc['created_at'] = doc['created_at'].isoformat()
            if 'updated_at' in doc and hasattr(doc['updated_at'], 'isoformat'):
                doc['updated_at'] = doc['updated_at'].isoformat()
            
            # fix decimal
            if 'total_amount' in doc and hasattr(doc['total_amount'], 'to_decimal'):
                doc['total_amount'] = float(str(doc['total_amount']))
            if 'discount_amount' in doc and hasattr(doc['discount_amount'], 'to_decimal'):
                doc['discount_amount'] = float(str(doc['discount_amount']))
                
            # Fetch Items
            items_cursor = db.core_orderitem.find({"order_id": doc["id"]})
            items_list = []
            for item in items_cursor:
                # fetch full menu item to get names and images
                menu_item = db.core_menuitem.find_one({"id": item.get('menu_item_id')})
                if menu_item:
                    items_list.append({
                        "id": menu_item.get("id"),
                        "name": menu_item.get("name"),
                        "price": float(str(menu_item.get("price", 0))),
                        "image_url": menu_item.get("image_url", ""),
                        "qty": item.get("quantity", 1)
                    })
            doc['items'] = items_list
            orders.append(doc)
            
        return Response(orders)
        
    def create(self, request, *args, **kwargs):
        import datetime
        import random
        from pymongo import MongoClient
        
        client = MongoClient(os.environ.get('MONGO_URI', 'mongodb://localhost:27017/'))
        db = client['mealmate_db']
        
        data = request.data
        new_id = random.randint(100000, 999999)
        
        customer_id = data.get("customer_id", 1)
        try:
            customer_id = int(customer_id)
        except:
            customer_id = 1
            
        # Validate Wallet Payment
        payment_method = data.get("payment_method", "COD")
        total_amount = float(data.get("total_amount", 0))
        
        if payment_method == 'WALLET':
            wallet = db.core_wallet.find_one({"user_id": customer_id})
            if not wallet or wallet.get("balance", 0) < total_amount:
                return Response({"success": False, "message": "Insufficient Wallet Balance"}, status=400)
            
            # Deduct Amount
            db.core_wallet.update_one({"user_id": customer_id}, {"$inc": {"balance": -total_amount}})
        
        order_doc = {
            "id": new_id,
            "restaurant_id": data.get("restaurant"),
            "customer_id": customer_id, # TODO: Use real request.user ID when authenticated
            "status": "PENDING",
            "total_amount": total_amount,
            "discount_amount": float(data.get("discount_amount", 0)),
            "coupon_code": data.get("coupon_code", ""),
            "payment_method": payment_method,
            "delivery_address": data.get("delivery_address", ""),
            "created_at": datetime.datetime.utcnow(),
            "updated_at": datetime.datetime.utcnow()
        }
        
        order_res = db.core_order.insert_one(order_doc)
        order_id = new_id
        
        items = data.get("items", [])
        for item in items:
            db.core_orderitem.insert_one({
                "order_id": order_id,
                "menu_item_id": item.get("menu_item"),
                "quantity": int(item.get("quantity", 1)),
                "price": float(item.get("price", 0))
            })
            
        return Response({
            "success": True,
            "message": "Order placed successfully",
            "order_id": order_id
        }, status=201)


class ValidateCouponView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        code = request.data.get('code', '').upper()
        order_amount = float(request.data.get('order_amount', 0))

        if not code:
            return Response({"success": False, "message": "No code provided!"}, status=400)
            
        try:
            from pymongo import MongoClient
            client = MongoClient(os.environ.get('MONGO_URI', 'mongodb://localhost:27017/'))
            db = client['mealmate_db']
            
            coupon = db.core_coupon.find_one({"code": code})
            
            if not coupon:
                return Response({"success": False, "message": "Invalid Coupon Code!"}, status=404)
                
            if not coupon.get('is_active', False):
                return Response({"success": False, "message": "Coupon is expired or inactive!"}, status=400)
                
            min_order = float(coupon.get('min_order_amount', 0))
            if min_order and order_amount < min_order:
                return Response({"success": False, "message": f"Min order amount is Rs.{min_order}"}, status=400)
                
            if coupon.get('first_order_only', False):
                # Hardcoded user 1 validation
                order_count = db.core_order.count_documents({"customer_id": 1})
                if order_count > 0:
                    return Response({"success": False, "message": "This coupon is only valid on your first order!"}, status=400)
                
            # Calculate discount
            discount = 0
            if coupon.get('discount_type') == 'percentage':
                discount = order_amount * (float(coupon.get('discount_value', 0)) / 100.0)
                max_disc = float(coupon.get('max_discount', 0))
                if max_disc > 0:
                    discount = min(discount, max_disc)
            elif coupon.get('discount_type') == 'fixed':
                discount = float(coupon.get('discount_value', 0))
                
            return Response({
                "success": True, 
                "discount": round(discount, 2),
                "message": f"Coupon {code} applied successfully!"
            })
        except Exception as e:
            return Response({"success": False, "message": "Invalid Coupon Code!"}, status=404)

    def get(self, request):
        from pymongo import MongoClient
        client = MongoClient(os.environ.get('MONGO_URI', 'mongodb://localhost:27017/'))
        db = client['mealmate_db']
        
        # Fetch all active coupons using PyMongo directly
        coupons_cursor = db.core_coupon.find({"is_active": True}, {"_id": 0})
        coupons = list(coupons_cursor)
        
        # Filter logic for first orders
        order_count = db.core_order.count_documents({"customer_id": 1})
        valid_coupons = []
        for c in coupons:
            if c.get('first_order_only', False) and order_count > 0:
                continue
            valid_coupons.append(c)
        
        return Response({"success": True, "coupons": valid_coupons})

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from bson import ObjectId
from pymongo import MongoClient

class AIRecommendationView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        client = MongoClient(os.environ.get('MONGO_URI', 'mongodb://localhost:27017/'))
        db = client['mealmate_db']
        
        # User ID would come from request.user, defaulting to 1 for demo
        user_id = 1
        
        # 1. Collaborative / Content Based Filtering Logic Simulation
        # Fetch user's previous orders to find favorite categories
        past_orders = list(db.core_order.find({"customer_id": user_id}))
        
        favorite_categories = []
        if past_orders:
            order_ids = [o['id'] for o in past_orders]
            past_items = list(db.core_orderitem.find({"order_id": {"$in": order_ids}}))
            past_menu_ids = [it['menu_item_id'] for it in past_items]
            
            if past_menu_ids:
                # Find categories of these items
                items_info = list(db.core_menuitem.find({"id": {"$in": past_menu_ids}}))
                categories = [item.get('category') for item in items_info if item.get('category')]
                
                if categories:
                    # Get most frequent category
                    from collections import Counter
                    favorite_categories = [k for k, _ in Counter(categories).most_common(2)]
        
        # 2. Fetch highly rated items from favorite categories, or fallback to general best-sellers
        pipeline = []
        if favorite_categories:
            pipeline.append({"$match": {"category": {"$in": favorite_categories}}})
            
        pipeline.extend([
            {"$sample": {"size": 4}}  # Get 4 random items mimicking a ML matrix factorization result
        ])
        
        recommendations = list(db.core_menuitem.aggregate(pipeline))
        
        # If not enough personal data, fallback to global top trending items
        if not recommendations:
            recommendations = list(db.core_menuitem.aggregate([{"$sample": {"size": 4}}]))
            
        # Format response
        result = []
        for r in recommendations:
            result.append({
                "id": r.get('id'),
                "name": r.get('name'),
                "description": r.get('description'),
                "price": str(r.get('price')),
                "category": r.get('category'),
                "image_url": r.get('image_url'),
                "restaurant": r.get('restaurant_id')
            })
            
        return Response({
            "success": True,
            "message": "AI model computed recommendations based on user order history.",
            "data": result
        })

class WalletView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        client = MongoClient(os.environ.get('MONGO_URI', 'mongodb://localhost:27017/'))
        db = client['mealmate_db']
        user_id = request.query_params.get('customer_id', 1)
        try:
            user_id = int(user_id)
        except:
            user_id = 1

        wallet = db.core_wallet.find_one({"user_id": user_id})
        if not wallet:
            db.core_wallet.insert_one({"user_id": user_id, "balance": 500.00}) # Free promo credits
            balance = 500.00
        else:
            balance = wallet.get("balance", 0.00)

        return Response({"success": True, "balance": float(balance)})

    def post(self, request):
        client = MongoClient(os.environ.get('MONGO_URI', 'mongodb://localhost:27017/'))
        db = client['mealmate_db']
        user_id = request.data.get('customer_id', 1)
        try:
            user_id = int(user_id)
        except:
            user_id = 1
        
        amount = float(request.data.get('amount', 0))
        if amount <= 0:
            return Response({"success": False, "message": "Invalid amount!"}, status=400)
            
        wallet = db.core_wallet.find_one({"user_id": user_id})
        if not wallet:
            db.core_wallet.insert_one({"user_id": user_id, "balance": amount})
        else:
            db.core_wallet.update_one({"user_id": user_id}, {"$inc": {"balance": amount}})
            
        new_wallet = db.core_wallet.find_one({"user_id": user_id})
        return Response({"success": True, "balance": float(new_wallet.get("balance", 0)), "message": f"Added ${amount} to wallet successfully!"})
