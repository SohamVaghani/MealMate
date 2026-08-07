from django.db import models
from django.contrib.auth.models import AbstractUser

# 1. Base User Model
class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('RESTAURANT', 'Restaurant Owner'),
        ('DELIVERY', 'Delivery Partner'),
        ('CUSTOMER', 'Customer'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='CUSTOMER')
    phone = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.role})"

# 2. Customer Profile
class CustomerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='customer_profile')
    saved_addresses = models.TextField(blank=True, help_text="Can store JSON of multiple addresses")

    def __str__(self):
        return self.user.username

# 3. Restaurant Models
class Restaurant(models.Model):
    owner = models.OneToOneField(User, on_delete=models.CASCADE, limit_choices_to={'role': 'RESTAURANT'}, null=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    address = models.CharField(max_length=255)
    banner_url = models.URLField(blank=True, null=True, help_text="Restaurant Cover Image")
    is_open = models.BooleanField(default=True)
    rating = models.FloatField(default=0.0)

    def __str__(self):
        return self.name

class MenuItem(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='menu_items')
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=100, default='Main Course')
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.URLField(blank=True, null=True)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - {self.restaurant.name}"

# 4. Delivery Partner Models
class DeliveryPartnerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, limit_choices_to={'role': 'DELIVERY'})
    vehicle_number = models.CharField(max_length=50)
    vehicle_type = models.CharField(max_length=50)
    is_online = models.BooleanField(default=False)
    current_location = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.user.username

# 5. Order Management
class Order(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('ACCEPTED', 'Accepted by Restaurant'),
        ('PREPARING', 'Preparing'),
        ('READY', 'Ready for Pickup'),
        ('PICKED_UP', 'Picked Up by Delivery Partner'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
    )
    customer = models.ForeignKey(CustomerProfile, on_delete=models.SET_NULL, null=True, related_name='orders')
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='orders')
    delivery_partner = models.ForeignKey(DeliveryPartnerProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='deliveries')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    delivery_address = models.CharField(max_length=255)
    
    # NEW fields from external DB
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    coupon_code = models.CharField(max_length=50, blank=True, null=True)
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    payment_status = models.CharField(max_length=50, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} - {self.status}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.menu_item.name if self.menu_item else 'Deleted'}"

# --- NEW TABLES INTEGRATED ---

class Coupon(models.Model):
    code = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=255, blank=True)
    discount_type = models.CharField(max_length=20)
    discount_value = models.FloatField()
    min_order_amount = models.FloatField(null=True, blank=True)
    max_discount = models.FloatField(null=True, blank=True)
    usage_limit = models.IntegerField(null=True, blank=True)
    per_user_limit = models.IntegerField(null=True, blank=True)
    is_first_order_only = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField(null=True, blank=True)
    valid_until = models.DateTimeField(null=True, blank=True)

class CouponUsage(models.Model):
    coupon = models.ForeignKey(Coupon, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    discount_amount = models.FloatField()
    used_at = models.DateTimeField()

class Payment(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    amount = models.FloatField()
    method = models.CharField(max_length=50)
    transaction_id = models.CharField(max_length=100, null=True, blank=True)
    status = models.CharField(max_length=50)
    created_at = models.DateTimeField()

class Notification(models.Model):
    title = models.CharField(max_length=200)
    message = models.TextField()
    type = models.CharField(max_length=50, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class OrderHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    food_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    order_count = models.IntegerField(default=1)
    last_ordered_at = models.DateTimeField()

# --- NEW TABLES FOR FINAL PROJECT COMPLIANCE ---

class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, null=True, blank=True)
    delivery_partner = models.ForeignKey(DeliveryPartnerProfile, on_delete=models.CASCADE, null=True, blank=True)
    rating = models.IntegerField(default=5) # 1 to 5
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review {self.rating}* by {self.user.username}"

class Offer(models.Model):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='offers')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    discount_percentage = models.FloatField(default=0.0)
    valid_from = models.DateTimeField(auto_now_add=True)
    valid_until = models.DateTimeField()
    is_active = models.BooleanField(default=True)

class Cart(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

class Wallet(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='wallet')
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    last_updated = models.DateTimeField(auto_now=True)


