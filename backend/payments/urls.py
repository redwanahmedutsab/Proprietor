"""
payments/urls.py — prefixed /api/payments/
"""
from django.urls import path
from .views import (
    InitiatePaymentView,
    PaymentSuccessView,
    PaymentFailView,
    PaymentCancelView,
    PaymentStatusView,
)

urlpatterns = [
    # Initiate payment for a booking
    path('initiate/<int:booking_id>/', InitiatePaymentView.as_view(), name='pay-initiate'),

    # SSLCommerz IPN callbacks (POST from gateway)
    path('success/', PaymentSuccessView.as_view(), name='pay-success'),
    path('fail/', PaymentFailView.as_view(), name='pay-fail'),
    path('cancel/', PaymentCancelView.as_view(), name='pay-cancel'),

    # Frontend polling endpoint
    path('status/<int:booking_id>/', PaymentStatusView.as_view(), name='pay-status'),
]
