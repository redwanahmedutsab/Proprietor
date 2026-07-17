from django.utils import timezone
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from .models import CustomUser, EmailOTP
from .serializers import (
    RegisterSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    SendOTPSerializer,
    VerifyOTPSerializer,
)
from utils.emails import send_otp_email

RESEND_COOLDOWN_SECONDS = 60


class SendOTPView(APIView):
    """Send (or resend) a signup verification code to an email.

    Enforces a 60-second cooldown between sends for the same email so the
    frontend's "Resend OTP" button has something real to rate-limit against.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        last_otp = EmailOTP.objects.filter(email=email).order_by('-created_at').first()
        if last_otp:
            elapsed = (timezone.now() - last_otp.created_at).total_seconds()
            if elapsed < RESEND_COOLDOWN_SECONDS:
                retry_after = int(RESEND_COOLDOWN_SECONDS - elapsed)
                return Response(
                    {
                        "error": f"Please wait {retry_after}s before requesting another OTP.",
                        "retry_after": retry_after,
                    },
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                )

        otp = EmailOTP.create_for_email(email)
        send_otp_email(email, otp.otp_code)

        return Response(
            {
                "message": "A verification code has been sent to your email.",
                "retry_after": RESEND_COOLDOWN_SECONDS,
            },
            status=status.HTTP_200_OK,
        )


class VerifyOTPView(APIView):
    """Check the code the user typed against the most recent OTP on file."""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        code = serializer.validated_data['otp_code']

        otp = EmailOTP.objects.filter(email=email, is_verified=False).order_by('-created_at').first()

        if not otp:
            return Response(
                {"error": "No pending verification code for this email. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if otp.is_expired():
            return Response(
                {"error": "This code has expired. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if otp.attempts >= EmailOTP.MAX_ATTEMPTS:
            return Response(
                {"error": "Too many incorrect attempts. Please request a new code."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if otp.otp_code != code:
            otp.attempts += 1
            otp.save(update_fields=['attempts'])
            remaining = EmailOTP.MAX_ATTEMPTS - otp.attempts
            return Response(
                {"error": f"Incorrect code. {remaining} attempt(s) left."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        otp.is_verified = True
        otp.save(update_fields=['is_verified'])
        return Response({"message": "Email verified successfully."}, status=status.HTTP_200_OK)


class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "message": "Account created successfully.",
                "user": UserProfileSerializer(user).data,
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user

        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {"old_password": "Current password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response(
            {"message": "Password updated successfully."},
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response(
                    {"error": "Refresh token is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"message": "Logged out successfully."},
                status=status.HTTP_205_RESET_CONTENT,
            )
        except Exception:
            return Response(
                {"error": "Invalid or expired token."},
                status=status.HTTP_400_BAD_REQUEST,
            )
