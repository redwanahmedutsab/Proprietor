"""
users/urls.py — Auth URL Patterns

All routes are prefixed with /api/auth/ (set in config/urls.py)
"""
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
    # ── Registration ──────────────────────────────────────
    path('register/', RegisterView.as_view(), name='auth-register'),

    # ── JWT Tokens ────────────────────────────────────────
    # POST { email, password } → { access, refresh }
    path('login/', TokenObtainPairView.as_view(), name='auth-login'),

    # POST { refresh } → { access }
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    # POST { token } → 200 OK if valid
    path('token/verify/', TokenVerifyView.as_view(), name='token-verify'),

    # ── Profile ───────────────────────────────────────────
    path('profile/', ProfileView.as_view(), name='auth-profile'),

    # ── Password ──────────────────────────────────────────
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),

    # ── Logout (blacklist refresh token) ──────────────────
    path('logout/', LogoutView.as_view(), name='auth-logout'),
]
