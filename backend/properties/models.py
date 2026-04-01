"""
properties/models.py — Property & PropertyImage Models
"""
from django.db import models
from django.conf import settings


class Property(models.Model):
    TYPE_CHOICES = (
        ('rent', 'For Rent'),
        ('buy', 'For Sale'),
        ('both', 'Rent & Sale'),
    )

    STATUS_CHOICES = (
        ('pending', 'Pending Approval'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('sold', 'Sold / Rented'),
    )

    CATEGORY_CHOICES = (
        ('apartment', 'Apartment'),
        ('house', 'House'),
        ('office', 'Office'),
        ('shop', 'Shop / Commercial'),
        ('land', 'Land'),
    )

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='properties'
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    property_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='rent')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='apartment')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    # Location
    address = models.CharField(max_length=500)
    city = models.CharField(max_length=100)
    area = models.CharField(max_length=100, blank=True)  # e.g. Dhanmondi, Gulshan
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    # Details
    bedrooms = models.PositiveIntegerField(default=0)
    bathrooms = models.PositiveIntegerField(default=0)
    area_sqft = models.PositiveIntegerField(null=True, blank=True)
    floor = models.PositiveIntegerField(null=True, blank=True)

    # 3D Tour / Virtual Tour
    tour_url = models.URLField(blank=True, null=True,
                               help_text="Matterport or YouTube 3D tour link")

    # Meta
    is_featured = models.BooleanField(default=False)
    views_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Properties'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.get_property_type_display()}) — {self.city}"

    @property
    def primary_image(self):
        img = self.images.filter(is_primary=True).first()
        return img or self.images.first()


class PropertyImage(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE,
                                 related_name='images')
    image = models.ImageField(upload_to='properties/%Y/%m/')
    caption = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_primary', 'uploaded_at']

    def __str__(self):
        return f"Image for {self.property.title}"

    def save(self, *args, **kwargs):
        # Only one primary image per property
        if self.is_primary:
            PropertyImage.objects.filter(
                property=self.property, is_primary=True
            ).update(is_primary=False)
        super().save(*args, **kwargs)


class Wishlist(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             on_delete=models.CASCADE, related_name='wishlist')
    property = models.ForeignKey(Property, on_delete=models.CASCADE,
                                 related_name='wishlisted_by')
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'property')

    def __str__(self):
        return f"{self.user.email} ♥ {self.property.title}"
