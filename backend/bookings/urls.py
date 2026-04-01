"""
bookings/urls.py — prefixed /api/bookings/
"""
from django.urls import path
from .views import (
    BookingCreateView,
    MyBookingsView,
    BookingDetailView,
    CancelBookingView,
)

urlpatterns = [
    path('', BookingCreateView.as_view(), name='booking-create'),
    path('mine/', MyBookingsView.as_view(), name='my-bookings'),
    path('<int:pk>/', BookingDetailView.as_view(), name='booking-detail'),
    path('<int:pk>/cancel/', CancelBookingView.as_view(), name='booking-cancel'),
]
