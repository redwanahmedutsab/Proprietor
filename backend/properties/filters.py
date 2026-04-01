"""
properties/filters.py — Search & Filter Logic
Uses django-filter for clean, reusable query params.

Available query params:
  ?property_type=rent
  ?category=apartment
  ?city=Dhaka
  ?area=Gulshan
  ?min_price=5000
  ?max_price=50000
  ?bedrooms=3
  ?status=approved
  ?search=gulshan 2 bed
"""
import django_filters
from .models import Property


class PropertyFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')
    min_area_sqft = django_filters.NumberFilter(field_name='area_sqft', lookup_expr='gte')
    city = django_filters.CharFilter(field_name='city', lookup_expr='icontains')
    area = django_filters.CharFilter(field_name='area', lookup_expr='icontains')
    search = django_filters.CharFilter(method='filter_search')

    class Meta:
        model = Property
        fields = ['property_type', 'category', 'status',
                  'bedrooms', 'bathrooms', 'is_featured']

    def filter_search(self, queryset, name, value):
        """Full-text search across title, description, address, city, area."""
        from django.db.models import Q
        return queryset.filter(
            Q(title__icontains=value) |
            Q(description__icontains=value) |
            Q(address__icontains=value) |
            Q(city__icontains=value) |
            Q(area__icontains=value)
        )
