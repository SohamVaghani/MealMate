from django.urls import path
from .views import AdminDashboardStatsView, DispatchOrderView, SeedDataView, ProcessPartnerView, ManageRestaurantView, ManageUserView, ManageFoodItemView, ManageDriverView

urlpatterns = [
    path('dashboard/', AdminDashboardStatsView.as_view(), name='admin_dashboard_stats'),
    path('dispatch/', DispatchOrderView.as_view(), name='admin_dispatch_order'),
    path('process_partner/', ProcessPartnerView.as_view(), name='admin_process_partner'),
    path('manage_restaurant/', ManageRestaurantView.as_view(), name='admin_manage_restaurant'),
    path('manage_user/', ManageUserView.as_view(), name='admin_manage_user'),
    path('manage_food_item/', ManageFoodItemView.as_view(), name='admin_manage_food_item'),
    path('manage_driver/', ManageDriverView.as_view(), name='admin_manage_driver'),
    path('seed/', SeedDataView.as_view(), name='admin_seed_data'),
]
