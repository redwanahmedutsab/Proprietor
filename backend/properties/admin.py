from django.contrib import admin
from django.utils.html import format_html
from .models import Property, PropertyImage, Wishlist


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1
    fields = ('image', 'caption', 'is_primary', 'uploaded_at')
    readonly_fields = ('uploaded_at',)


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'property_type', 'category',
                    'price', 'city', 'status', 'is_featured', 'created_at')
    list_filter = ('status', 'property_type', 'category', 'city', 'is_featured')
    search_fields = ('title', 'description', 'address', 'city', 'owner__email')
    list_editable = ('status', 'is_featured')
    ordering = ('-created_at',)
    inlines = [PropertyImageInline]

    actions = ['approve_properties', 'reject_properties', 'mark_featured']

    def approve_properties(self, request, queryset):
        queryset.update(status='approved')
        self.message_user(request, f"{queryset.count()} properties approved.")

    approve_properties.short_description = "✅ Approve selected properties"

    def reject_properties(self, request, queryset):
        queryset.update(status='rejected')
        self.message_user(request, f"{queryset.count()} properties rejected.")

    reject_properties.short_description = "❌ Reject selected properties"

    def mark_featured(self, request, queryset):
        queryset.update(is_featured=True)
        self.message_user(request, f"{queryset.count()} properties marked as featured.")

    mark_featured.short_description = "⭐ Mark as featured"


@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display = ('property', 'is_primary', 'uploaded_at')
    list_filter = ('is_primary',)


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ('user', 'property', 'added_at')
    list_filter = ('added_at',)
    search_fields = ('user__email', 'property__title')
