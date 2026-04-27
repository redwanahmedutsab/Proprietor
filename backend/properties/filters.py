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
        from django.db.models import Q
        return queryset.filter(
            Q(title__icontains=value) |
            Q(description__icontains=value) |
            Q(address__icontains=value) |
            Q(city__icontains=value) |
            Q(area__icontains=value)
        )
