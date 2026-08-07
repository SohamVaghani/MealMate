from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerOrderViewSet, CustomerRestaurantViewSet, ValidateCouponView, AIRecommendationView, WalletView

router = DefaultRouter()
router.register(r'orders', CustomerOrderViewSet, basename='customer-orders')
router.register(r'restaurants', CustomerRestaurantViewSet, basename='customer-restaurants')

urlpatterns = [
    path('', include(router.urls)),
    path('validate_coupon/', ValidateCouponView.as_view(), name='validate-coupon'),
    path('recommendations/', AIRecommendationView.as_view(), name='ai-recommendations'),
    path('wallet/', WalletView.as_view(), name='wallet'),
]
