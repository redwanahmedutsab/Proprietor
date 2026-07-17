import re
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser, EmailOTP


class RegisterSerializer(serializers.ModelSerializer):
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

    def validate_username(self, value):
        if len(value) < 6:
            raise serializers.ValidationError(
                "Username must be at least 6 characters."
            )
        return value

    def validate_phone(self, value):
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

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password2": "Passwords do not match."}
            )

        email = attrs.get('email')
        verified = EmailOTP.objects.filter(email=email, is_verified=True).exists()
        if not verified:
            raise serializers.ValidationError(
                {"email": "Please verify this email with the OTP sent to it before signing up."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        password = validated_data.pop('password')
        user = CustomUser(**validated_data)
        user.set_password(password)  # bcrypt hash — never stored plain
        user.save()
        # OTP has served its purpose — clear it so it can't be reused.
        EmailOTP.objects.filter(email=user.email).delete()
        return user


class SendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        value = value.lower()
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered.")
        return value


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp_code = serializers.CharField(min_length=6, max_length=6)

    def validate_email(self, value):
        return value.lower()


class UserProfileSerializer(serializers.ModelSerializer):
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
