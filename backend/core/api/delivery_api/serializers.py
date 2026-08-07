from rest_framework import serializers
from core.models import Order, Restaurant, DeliveryPartnerProfile

class DeliveryOrderSerializer(serializers.ModelSerializer):
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    pickup_address = serializers.CharField(source='restaurant.address', read_only=True)
    customer_name = serializers.CharField(source='customer.user.username', read_only=True, default="Valued Customer")
    
    class Meta:
        model = Order
        fields = ['id', 'status', 'total_amount', 'delivery_address', 'restaurant_name', 'pickup_address', 'customer_name']
