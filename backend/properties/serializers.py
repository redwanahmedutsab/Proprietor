"""
properties/serializers.py
"""
from rest_framework import serializers
from .models import Property, PropertyImage, Wishlist


class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'caption', 'is_primary', 'uploaded_at']
        read_only_fields = ['uploaded_at']


class PropertyListSerializer(serializers.ModelSerializer):
    """Lightweight — used for list/search views."""
    primary_image = serializers.SerializerMethodField()
    owner_name = serializers.CharField(source='owner.full_name', read_only=True)

    class Meta:
        model = Property
        fields = [
            'id', 'title', 'price', 'property_type', 'category',
            'status', 'city', 'area', 'bedrooms', 'bathrooms',
            'area_sqft', 'is_featured', 'views_count',
            'primary_image', 'owner_name', 'created_at',
        ]

    def get_primary_image(self, obj):
        img = obj.primary_image
        if img:
            request = self.context.get('request')
            return request.build_absolute_uri(img.image.url) if request else img.image.url
        return None


class PropertyDetailSerializer(serializers.ModelSerializer):
    """Full detail — includes nested images + owner info."""
    images = PropertyImageSerializer(many=True, read_only=True)
    owner_name = serializers.CharField(source='owner.full_name', read_only=True)
    owner_phone = serializers.CharField(source='owner.phone', read_only=True)
    owner_email = serializers.EmailField(source='owner.email', read_only=True)
    is_wishlisted = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            'id', 'title', 'description', 'price', 'property_type',
            'category', 'status', 'address', 'city', 'area',
            'latitude', 'longitude', 'bedrooms', 'bathrooms',
            'area_sqft', 'floor', 'tour_url', 'is_featured',
            'views_count', 'images', 'owner_name', 'owner_phone',
            'owner_email', 'is_wishlisted', 'created_at', 'updated_at',
        ]
        read_only_fields = ['status', 'views_count', 'is_featured', 'created_at', 'updated_at']

    def get_is_wishlisted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Wishlist.objects.filter(user=request.user, property=obj).exists()
        return False


class PropertyCreateUpdateSerializer(serializers.ModelSerializer):
    """Used for POST / PUT / PATCH by property owner."""
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )

    class Meta:
        model = Property
        fields = [
            'title', 'description', 'price', 'property_type', 'category',
            'address', 'city', 'area', 'latitude', 'longitude',
            'bedrooms', 'bathrooms', 'area_sqft', 'floor',
            'tour_url', 'uploaded_images',
        ]

    def create(self, validated_data):
        images_data = validated_data.pop('uploaded_images', [])
        # Owner is set from the request user in the view
        property_obj = Property.objects.create(**validated_data)
        for i, image in enumerate(images_data):
            PropertyImage.objects.create(
                property=property_obj,
                image=image,
                is_primary=(i == 0)  # first image is primary
            )
        return property_obj

    def update(self, instance, validated_data):
        images_data = validated_data.pop('uploaded_images', [])
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        for i, image in enumerate(images_data):
            PropertyImage.objects.create(
                property=instance,
                image=image,
                is_primary=False
            )
        return instance


class WishlistSerializer(serializers.ModelSerializer):
    property = PropertyListSerializer(read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'property', 'added_at']
