"""
config/urls.py — FINAL Root URLs (All Phases)
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from reviews.views import PropertyReviewsView, DeleteReviewView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Phase 1 — Auth
    path('api/auth/', include('users.urls')),

    # Phase 2 — Properties
    path('api/properties/', include('properties.urls')),

    # Phase 4 — Bookings + Payments
    path('api/bookings/', include('bookings.urls')),
    path('api/payments/', include('payments.urls')),

    # Phase 5 — Reviews (nested under properties)
    path('api/properties/<int:pk>/reviews/', PropertyReviewsView.as_view(), name='property-reviews'),
    path('api/reviews/<int:pk>/', DeleteReviewView.as_view(), name='delete-review'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
