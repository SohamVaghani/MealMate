from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from core.models import Order
from .serializers import DeliveryOrderSerializer

class DeliveryOrderViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for delivery partners. For MVP we use ReadOnly and custom PATCH action.
    """
    serializer_class = DeliveryOrderSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return []
        
    def list(self, request, *args, **kwargs):
        from pymongo import MongoClient
        client = MongoClient('mongodb://localhost:27017/')
        db = client['mealmate_db']
        
        # Only show orders that are PREPARING or READY (waiting for delivery pickup)
        # We can also show ACCEPTED or PENDING if we want delivery partners to see them
        orders_cursor = db.core_order.find({"status": {"$in": ["ACCEPTED", "PREPARING", "READY", "PICKED_UP"]}}).sort("created_at", -1)
        
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
            # fetch restaurant name
            restaurant = db.core_restaurant.find_one({"id": doc.get('restaurant_id')})
            doc['restaurant_name'] = restaurant.get('name') if restaurant else f"Restaurant #{doc.get('restaurant_id')}"
            doc['pickup_address'] = restaurant.get('address', "Restaurant Location") if restaurant else "Restaurant Location"
            
            # fetch customer from SQLite auth
            try:
                from core.models import User
                user_obj = User.objects.get(id=doc.get('customer_id'))
                doc['customer_name'] = user_obj.username.title()
            except:
                doc['customer_name'] = f"Guest #{doc.get('customer_id')}"
            # fetch items
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

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        new_status = request.data.get('status', '').upper()
        
        from pymongo import MongoClient
        client = MongoClient('mongodb://localhost:27017/')
        db = client['mealmate_db']
        
        update_data = {"status": new_status}
        
        # If the order is being accepted by the delivery boy, assign their name
        if new_status == 'ACCEPTED':
            # hardcoded for now, normally would be request.user.username
            update_data["delivery_partner_name"] = "Alex Rider"
            update_data["delivery_partner_phone"] = "+1 (555) 123-4567"
            
        db.core_order.update_one({"id": int(pk)}, {"$set": update_data})
        return Response({'status': 'status updated to ' + new_status})
