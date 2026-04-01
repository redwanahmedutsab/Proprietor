"""
properties/urls.py
All prefixed with /api/properties/ (set in config/urls.py)
"""
from django.urls import path
from .views import (
    PropertyListCreateView,
    PropertyDetailView,
    MyPropertiesView,
    PropertyImageUploadView,
    PropertyImageDeleteView,
    FeaturedPropertiesView,
    ApprovePropertyView,
    WishlistView,
    WishlistToggleView,
)

urlpatterns = [
    # ── Core CRUD ──────────────────────────────────────────
    path('', PropertyListCreateView.as_view(), name='property-list-create'),
    path('<int:pk>/', PropertyDetailView.as_view(), name='property-detail'),

    # ── My properties (dashboard) ──────────────────────────
    path('mine/', MyPropertiesView.as_view(), name='my-properties'),

    # ── Featured ───────────────────────────────────────────
    path('featured/', FeaturedPropertiesView.as_view(), name='featured-properties'),

    # ── Images ─────────────────────────────────────────────
    path('<int:pk>/images/', PropertyImageUploadView.as_view(), name='upload-images'),
    path('images/<int:pk>/delete/', PropertyImageDeleteView.as_view(), name='delete-image'),

    # ── Admin approval ─────────────────────────────────────
    path('<int:pk>/approve/', ApprovePropertyView.as_view(), {'action': 'approve'}, name='approve-property'),
    path('<int:pk>/reject/', ApprovePropertyView.as_view(), {'action': 'reject'}, name='reject-property'),

    # ── Wishlist ───────────────────────────────────────────
    path('wishlist/', WishlistView.as_view(), name='wishlist'),
    path('<int:pk>/wishlist/', WishlistToggleView.as_view(), name='wishlist-toggle'),
]
