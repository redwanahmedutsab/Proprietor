"""
payments/admin.py
"""
from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('tran_id', 'booking', 'amount', 'currency',
                    'status', 'is_verified', 'created_at')
    list_filter = ('status', 'is_verified', 'currency')
    search_fields = ('tran_id', 'val_id', 'booking__user__email')
    ordering = ('-created_at',)
    readonly_fields = ('tran_id', 'val_id', 'session_key',
                       'gateway_response', 'created_at', 'updated_at')
