from django.urls import path
from .views import (
    InitiatePaymentView,
    PaymentSuccessView,
    PaymentFailView,
    PaymentCancelView,
    PaymentStatusView,
)

urlpatterns = [
    path('initiate/<int:booking_id>/', InitiatePaymentView.as_view(), name='pay-initiate'),

    path('success/', PaymentSuccessView.as_view(), name='pay-success'),
    path('fail/', PaymentFailView.as_view(), name='pay-fail'),
    path('cancel/', PaymentCancelView.as_view(), name='pay-cancel'),

    path('status/<int:booking_id>/', PaymentStatusView.as_view(), name='pay-status'),
]
