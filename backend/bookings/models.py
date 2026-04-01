"""
bookings/models.py — Booking Model
"""
from django.db import models
from django.conf import settings


class Booking(models.Model):
    BOOKING_TYPE = (
        ('rent', 'Rent'),
        ('buy', 'Buy'),
    )

    STATUS_CHOICES = (
        ('pending', 'Pending Payment'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    )

    PAYMENT_METHOD = (
        ('online', 'Online (SSLCommerz)'),
        ('meet_pay', 'Meet & Pay Later'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    property = models.ForeignKey(
        'properties.Property',
        on_delete=models.CASCADE,
        related_name='bookings'
    )

    booking_type = models.CharField(max_length=10, choices=BOOKING_TYPE)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=15, choices=PAYMENT_METHOD, default='online')

    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    total_price = models.DecimalField(max_digits=12, decimal_places=2)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} — {self.property.title} ({self.booking_type})"

    def is_paid(self):
        try:
            return self.payment.is_verified
        except Exception:
            return False
