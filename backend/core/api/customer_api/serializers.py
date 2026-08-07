from rest_framework import serializers
from core.models import Order, OrderItem, MenuItem, CustomerProfile

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['menu_item', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, write_only=True)
    
    class Meta:
        model = Order
        fields = ['id', 'restaurant', 'total_amount', 'delivery_address', 'status', 'items', 'created_at']
        read_only_fields = ['id', 'status', 'created_at']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        
        # Hardcoding the first customer for MVP/mock purposes if strictly required, 
        # but the model allows nullable/blank based on custom logic. 
        # Let's get or create a mock customer profile since authentication is mocked.
        customer, _ = CustomerProfile.objects.get_or_create(id=1) 
        
        order = Order.objects.create(status='PENDING', customer=customer, **validated_data)
        
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
            
        return order
