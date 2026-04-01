"""
payments/models.py — Payment Model
"""
from django.db import models


class Payment(models.Model):
    STATUS_CHOICES = (
        ('initiated', 'Initiated'),
        ('pending', 'Pending'),
        ('verified', 'Verified / Successful'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    )

    booking = models.OneToOneField(
        'bookings.Booking',
        on_delete=models.CASCADE,
        related_name='payment'
    )

    # SSLCommerz fields
    tran_id = models.CharField(max_length=100, unique=True)  # our generated ID
    val_id = models.CharField(max_length=100, blank=True)  # SSLCommerz val_id after success
    session_key = models.CharField(max_length=200, blank=True)  # SSLCommerz session

    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=5, default='BDT')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='initiated')

    # Raw response from SSLCommerz (stored for auditing)
    gateway_response = models.JSONField(null=True, blank=True)

    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment {self.tran_id} — {self.status} — {self.amount} {self.currency}"
