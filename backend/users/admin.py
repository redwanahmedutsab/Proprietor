from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, EmailOTP


@admin.register(EmailOTP)
class EmailOTPAdmin(admin.ModelAdmin):
    list_display = ('email', 'otp_code', 'is_verified', 'attempts', 'created_at', 'expires_at')
    list_filter = ('is_verified',)
    search_fields = ('email',)
    ordering = ('-created_at',)
    readonly_fields = ('otp_code', 'created_at')


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'full_name', 'role', 'is_verified', 'created_at')
    list_filter = ('role', 'is_verified', 'is_staff')
    search_fields = ('email', 'username', 'first_name', 'last_name', 'phone')
    ordering = ('-created_at',)

    fieldsets = UserAdmin.fieldsets + (
        ('Extra Info', {
            'fields': ('phone', 'address', 'role', 'profile_picture', 'is_verified')
        }),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Extra Info', {
            'fields': ('email', 'first_name', 'last_name', 'phone', 'address', 'role')
        }),
    )
