from django.contrib import admin
from .models import User, CustomerProfile, Restaurant, MenuItem, DeliveryPartnerProfile, Order, OrderItem

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'is_staff')
    list_filter = ('role', 'is_staff')

@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'is_open', 'rating')
    list_filter = ('is_open',)

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'restaurant', 'price', 'is_available')
    list_filter = ('is_available', 'restaurant')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'restaurant', 'status', 'total_amount', 'created_at')
    list_filter = ('status', 'created_at')

admin.site.register(CustomerProfile)
admin.site.register(DeliveryPartnerProfile)
admin.site.register(OrderItem)
