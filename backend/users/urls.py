"""
URL patterns for users app
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

app_name = 'users'

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('auth/login/', views.UserLoginView.as_view(), name='user-login'),
    path('auth/logout/', views.logout_view, name='user-logout'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # User management endpoints
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('stats/', views.user_stats_view, name='user-stats'),
    path('list/', views.UserListView.as_view(), name='user-list'),
]
