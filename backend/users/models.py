import random
from datetime import timedelta
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('buyer', 'Buyer'),
        ('seller', 'Seller'),
        ('admin', 'Admin'),
    )

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='buyer')
    profile_picture = models.ImageField(
        upload_to='profile_pictures/', blank=True, null=True
    )
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"

    @property
    def full_name(self):
        return self.get_full_name()


class EmailOTP(models.Model):
    """One-time verification code sent to an email during signup.

    A new row is created every time an OTP is (re)sent; the most recent
    row for an email is the one that counts for both verification and
    resend-cooldown checks.
    """
    OTP_VALID_MINUTES = 10
    MAX_ATTEMPTS = 5

    email = models.EmailField(db_index=True)
    otp_code = models.CharField(max_length=6)
    is_verified = models.BooleanField(default=False)
    attempts = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Email OTP'
        verbose_name_plural = 'Email OTPs'

    def __str__(self):
        return f"OTP for {self.email} ({'verified' if self.is_verified else 'pending'})"

    @staticmethod
    def generate_code():
        return f"{random.randint(0, 999999):06d}"

    @classmethod
    def create_for_email(cls, email):
        return cls.objects.create(
            email=email,
            otp_code=cls.generate_code(),
            expires_at=timezone.now() + timedelta(minutes=cls.OTP_VALID_MINUTES),
        )

    def is_expired(self):
        return timezone.now() > self.expires_at
