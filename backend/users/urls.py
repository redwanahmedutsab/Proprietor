from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from .views import (
    RegisterView,
    ProfileView,
    ChangePasswordView,
    LogoutView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth-register'),

    path('login/', TokenObtainPairView.as_view(), name='auth-login'),

    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    path('token/verify/', TokenVerifyView.as_view(), name='token-verify'),

    path('profile/', ProfileView.as_view(), name='auth-profile'),

    path('change-password/', ChangePasswordView.as_view(), name='change-password'),

    path('logout/', LogoutView.as_view(), name='auth-logout'),
]
