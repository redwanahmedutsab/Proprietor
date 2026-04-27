from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='user.full_name', read_only=True)
    author_avatar = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'rating', 'comment', 'author_name',
                  'author_avatar', 'created_at']
        read_only_fields = ['created_at']

    def get_author_avatar(self, obj):
        if obj.user.profile_picture:
            req = self.context.get('request')
            return req.build_absolute_uri(obj.user.profile_picture.url) if req else None
        return None

    def validate_rating(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value
