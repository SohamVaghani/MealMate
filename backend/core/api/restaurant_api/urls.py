from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MenuItemViewSet, RestaurantOrderViewSet, UpdateCoverView

router = DefaultRouter()
router.register(r'menu', MenuItemViewSet, basename='restaurant-menu')
router.register(r'orders', RestaurantOrderViewSet, basename='restaurant-orders')

urlpatterns = [
    path('', include(router.urls)),
    path('update-cover/', UpdateCoverView.as_view(), name='update-cover'),
]
