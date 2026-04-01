"""
users/serializers.py — Serializers with Validation
"""
import re
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser


class RegisterSerializer(serializers.ModelSerializer):
    """
    Handles new user registration with strong validation.
    """
    password = serializers.CharField(write_only=True, required=True,
                                     validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True,
                                      label='Confirm Password')

    class Meta:
        model = CustomUser
        fields = [
            'username', 'email', 'first_name', 'last_name',
            'phone', 'address', 'role', 'password', 'password2',
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }

    # ── Field-level validators ─────────────────────────────

    def validate_username(self, value):
        if len(value) < 6:
            raise serializers.ValidationError(
                "Username must be at least 6 characters."
            )
        return value

    def validate_phone(self, value):
        """
        Accepts Bangladesh mobile numbers:
        +8801XXXXXXXXX  or  01XXXXXXXXX  (11 digits)
        """
        if value:
            pattern = r'^(\+8801|01)[3-9]\d{8}$'
            if not re.match(pattern, value):
                raise serializers.ValidationError(
                    "Enter a valid Bangladesh phone number (e.g. 01712345678)."
                )
        return value

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value.lower()

    # ── Object-level validators ────────────────────────────

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password2": "Passwords do not match."}
            )
        return attrs

    # ── Create ────────────────────────────────────────────

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = CustomUser(**validated_data)
        user.set_password(password)  # bcrypt hash — never stored plain
        user.save()
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Read/update the authenticated user's profile.
    """
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'phone', 'address', 'role',
            'profile_picture', 'is_verified', 'created_at',
        ]
        read_only_fields = ['id', 'email', 'is_verified', 'created_at']


class ChangePasswordSerializer(serializers.Serializer):
    """
    Let authenticated users update their password.
    """
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True,
                                         validators=[validate_password])
    new_password2 = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password2']:
            raise serializers.ValidationError(
                {"new_password2": "New passwords do not match."}
            )
        return attrs
