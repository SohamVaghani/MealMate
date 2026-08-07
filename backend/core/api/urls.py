from django.urls import path, include
from .auth import login_view, signup_view

urlpatterns = [
    path('auth/login/', login_view, name='api-login'),
    path('auth/signup/', signup_view, name='api-signup'),
    path('admin/', include('core.api.admin_api.urls')),
    path('customer/', include('core.api.customer_api.urls')),
    path('restaurant/', include('core.api.restaurant_api.urls')),
    path('delivery/', include('core.api.delivery_api.urls')),
]
