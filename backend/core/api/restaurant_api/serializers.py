from rest_framework import serializers
from core.models import Restaurant, MenuItem, Order, OrderItem

class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = ['id', 'restaurant', 'name', 'category', 'description', 'price', 'image_url', 'is_available']

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['id', 'customer', 'status', 'total_amount', 'delivery_address', 'created_at']
