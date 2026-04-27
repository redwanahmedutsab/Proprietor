from django.contrib import admin
from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('user', 'property', 'booking_type', 'status',
                    'payment_method', 'total_price', 'created_at')
    list_filter = ('status', 'booking_type', 'payment_method')
    search_fields = ('user__email', 'property__title')
    ordering = ('-created_at',)
    list_editable = ('status',)

    actions = ['mark_confirmed', 'mark_completed']

    def mark_confirmed(self, request, queryset):
        queryset.update(status='confirmed')

    mark_confirmed.short_description = "✅ Mark as confirmed"

    def mark_completed(self, request, queryset):
        queryset.update(status='completed')

    mark_completed.short_description = "🏁 Mark as completed"
