"""
bookings/serializers.py
"""
from rest_framework import serializers
from .models import Booking


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            'property', 'booking_type', 'payment_method',
            'start_date', 'end_date', 'notes',
        ]

    def validate(self, attrs):
        booking_type = attrs.get('booking_type')
        prop = attrs.get('property')

        # Check property type allows this booking type
        if booking_type == 'rent' and prop.property_type == 'buy':
            raise serializers.ValidationError(
                "This property is only for sale, not rent."
            )
        if booking_type == 'buy' and prop.property_type == 'rent':
            raise serializers.ValidationError(
                "This property is only for rent, not for sale."
            )

        # Rent requires dates
        if booking_type == 'rent':
            if not attrs.get('start_date') or not attrs.get('end_date'):
                raise serializers.ValidationError(
                    "Start date and end date are required for rent bookings."
                )
            if attrs['start_date'] >= attrs['end_date']:
                raise serializers.ValidationError(
                    "End date must be after start date."
                )

        # Set price snapshot
        attrs['total_price'] = prop.price

        return attrs

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class BookingDetailSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source='property.title', read_only=True)
    property_city = serializers.CharField(source='property.city', read_only=True)
    property_image = serializers.SerializerMethodField()
    is_paid = serializers.ReadOnlyField()

    class Meta:
        model = Booking
        fields = [
            'id', 'property', 'property_title', 'property_city',
            'property_image', 'booking_type', 'status', 'payment_method',
            'start_date', 'end_date', 'total_price', 'notes',
            'is_paid', 'created_at',
        ]

    def get_property_image(self, obj):
        img = obj.property.primary_image
        if img:
            request = self.context.get('request')
            return request.build_absolute_uri(img.image.url) if request else img.image.url
        return None
