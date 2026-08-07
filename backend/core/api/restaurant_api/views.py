from rest_framework import viewsets
from rest_framework.permissions import AllowAny # Will change to IsAuthenticated later
from core.models import MenuItem, Order
from .serializers import MenuItemSerializer, OrderSerializer

class MenuItemViewSet(viewsets.ModelViewSet):
    """
    CRUD endpoints for a Restaurant Owner to manage their Menu Items.
    """
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        from pymongo import MongoClient
        import random
        client = MongoClient('mongodb://localhost:27017/')
        db = client['mealmate_db']
        
        data = request.data
        max_id = db.core_menuitem.find_one(sort=[("id", -1)])
        new_id = (max_id['id'] + 1) if max_id and 'id' in max_id else random.randint(1000, 9999)
        
        # Directly insert to bypass Djongo relational restrictions
        item = {
            "id": new_id,
            "restaurant_id": int(data.get("restaurant", 1)),
            "name": data.get("name"),
            "category": data.get("category", "Main Course"),
            "description": data.get("description", ""),
            "price": float(data.get("price", 0)),
            "image_url": data.get("image_url", ""),
            "is_available": True
        }
        
        db.core_menuitem.insert_one(item)
        return Response(item, status=201)

    def destroy(self, request, *args, **kwargs):
        from pymongo import MongoClient
        client = MongoClient('mongodb://localhost:27017/')
        db = client['mealmate_db']
        
        item_id = int(kwargs.get('pk'))
        db.core_menuitem.delete_one({"id": item_id})
        return Response({"message": "Deleted successfully"}, status=204)
        
    def update(self, request, *args, **kwargs):
        from pymongo import MongoClient
        from rest_framework.response import Response
        client = MongoClient('mongodb://localhost:27017/')
        db = client['mealmate_db']
        
        item_id = int(kwargs.get('pk'))
        data = request.data
        
        update_fields = {}
        if "name" in data: update_fields["name"] = data["name"]
        if "category" in data: update_fields["category"] = data["category"]
        if "description" in data: update_fields["description"] = data["description"]
        if "price" in data: update_fields["price"] = float(data["price"])
        if "image_url" in data: update_fields["image_url"] = data["image_url"]
        
        if update_fields:
            db.core_menuitem.update_one({"id": item_id}, {"$set": update_fields}, upsert=True)
            
        doc = db.core_menuitem.find_one({"id": item_id}, {"_id": 0})
        if not doc:
            data['id'] = item_id
            return Response(data, status=200)
        return Response(doc, status=200)

class RestaurantOrderViewSet(viewsets.ModelViewSet):
    """
    Endpoint for a Restaurant to view their incoming and active orders.
    """
    serializer_class = OrderSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return []
        
    def list(self, request, *args, **kwargs):
        from pymongo import MongoClient
        from rest_framework.response import Response
        client = MongoClient('mongodb://localhost:27017/')
        db = client['mealmate_db']
        
        # We fetch all orders for the MVP Restaurant viewer
        orders_cursor = db.core_order.find().sort("created_at", -1)
        
        orders = []
        for doc in orders_cursor:
            doc.pop('_id', None)
            if 'created_at' in doc and hasattr(doc['created_at'], 'isoformat'):
                doc['created_at'] = doc['created_at'].isoformat()
            if 'updated_at' in doc and hasattr(doc['updated_at'], 'isoformat'):
                doc['updated_at'] = doc['updated_at'].isoformat()
                
            if 'total_amount' in doc and hasattr(doc['total_amount'], 'to_decimal'):
                doc['total_amount'] = float(str(doc['total_amount']))
            if 'discount_amount' in doc and hasattr(doc['discount_amount'], 'to_decimal'):
                doc['discount_amount'] = float(str(doc['discount_amount']))
                
            # Remap ID to standard for UI
            doc['restaurant'] = doc.get("restaurant_id", 1)
            
            # Fetch Items
            items_cursor = db.core_orderitem.find({"order_id": doc["id"]})
            items_list = []
            for item in items_cursor:
                menu_item = db.core_menuitem.find_one({"id": item.get('menu_item_id')})
                if menu_item:
                    items_list.append({
                        "name": menu_item.get("name"),
                        "qty": item.get("quantity", 1)
                    })
            doc['items'] = items_list
            orders.append(doc)
            
        return Response(orders)
    def partial_update(self, request, *args, **kwargs):
        from pymongo import MongoClient
        from rest_framework.response import Response
        
        client = MongoClient('mongodb://localhost:27017/')
        db = client['mealmate_db']
        
        pk = kwargs.get('pk')
        new_status = request.data.get('status')
        
        if new_status:
            result = db.core_order.update_one({"id": int(pk)}, {"$set": {"status": new_status}})
            if result.modified_count == 0:
                # Fallback to checking string ID just in case
                db.core_order.update_one({"id": str(pk)}, {"$set": {"status": new_status}})
                
        return Response({"success": True})

from rest_framework.views import APIView
from bson import ObjectId

class UpdateCoverView(APIView):
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        from pymongo import MongoClient
        from rest_framework.response import Response
        client = MongoClient('mongodb://localhost:27017/')
        db = client['mealmate_db']
        
        restaurant_id = request.data.get('restaurant_id')
        banner_url = request.data.get('banner_url')
        
        if not restaurant_id or not banner_url:
            return Response({"error": "restaurant_id and banner_url required"}, status=400)
            
        try:
            # Try to update by integer ID
            res = db.core_restaurant.update_one({"id": int(restaurant_id)}, {"$set": {"banner_url": banner_url}})
            if res.matched_count == 0:
                raise ValueError("Not found as int")
        except ValueError:
            # Fallback to ObjectId or string matching
            try:
                db.core_restaurant.update_one({"_id": ObjectId(restaurant_id)}, {"$set": {"banner_url": banner_url}})
            except:
                db.core_restaurant.update_one({"id": str(restaurant_id)}, {"$set": {"banner_url": banner_url}})
                
        return Response({"success": True, "banner_url": banner_url})

