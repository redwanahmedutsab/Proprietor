"""
properties/views.py — All Property API Views
"""
from rest_framework import generics, status, filters
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend

from .models import Property, PropertyImage, Wishlist
from .serializers import (
    PropertyListSerializer,
    PropertyDetailSerializer,
    PropertyCreateUpdateSerializer,
    PropertyImageSerializer,
    WishlistSerializer,
)
from .filters import PropertyFilter


# ── Helper permission ──────────────────────────────────────
class IsOwnerOrAdmin:
    """Mixin: only the property owner or admin can edit/delete."""

    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        if obj.owner != user and not user.is_staff:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You do not own this property.")
        return obj


# ── Property List & Create ─────────────────────────────────
class PropertyListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/properties/          → public list (approved only)
    POST /api/properties/          → create new (auth required)
    """
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = PropertyFilter
    ordering_fields = ['price', 'created_at', 'views_count']
    ordering = ['-created_at']

    def get_queryset(self):
        # Public sees only approved; owner sees all their own
        user = self.request.user
        if user.is_authenticated:
            from django.db.models import Q
            return Property.objects.filter(
                Q(status='approved') | Q(owner=user)
            ).select_related('owner').prefetch_related('images')
        return Property.objects.filter(
            status='approved'
        ).select_related('owner').prefetch_related('images')

    def get_serializer_class(self):
        return PropertyCreateUpdateSerializer if self.request.method == 'POST' \
            else PropertyListSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


# ── Property Detail, Update, Delete ───────────────────────
class PropertyDetailView(IsOwnerOrAdmin, generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/properties/<id>/   → public detail
    PUT    /api/properties/<id>/   → owner/admin update
    PATCH  /api/properties/<id>/   → partial update
    DELETE /api/properties/<id>/   → owner/admin delete
    """
    queryset = Property.objects.all().select_related('owner').prefetch_related('images')
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return PropertyCreateUpdateSerializer
        return PropertyDetailSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment view counter
        Property.objects.filter(pk=instance.pk).update(
            views_count=instance.views_count + 1
        )
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


# ── My Properties (dashboard) ─────────────────────────────
class MyPropertiesView(generics.ListAPIView):
    """
    GET /api/properties/mine/  → all properties by logged-in user
    """
    serializer_class = PropertyListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Property.objects.filter(
            owner=self.request.user
        ).prefetch_related('images').order_by('-created_at')


# ── Property Image Upload ──────────────────────────────────
class PropertyImageUploadView(generics.CreateAPIView):
    """
    POST /api/properties/<id>/images/
    Upload additional images to an existing property.
    """
    serializer_class = PropertyImageSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        property_id = self.kwargs.get('pk')
        try:
            prop = Property.objects.get(pk=property_id, owner=self.request.user)
        except Property.DoesNotExist:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Property not found or not yours.")
        serializer.save(property=prop)


class PropertyImageDeleteView(generics.DestroyAPIView):
    """
    DELETE /api/properties/images/<image_id>/
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PropertyImage.objects.filter(property__owner=self.request.user)


# ── Featured Properties ────────────────────────────────────
class FeaturedPropertiesView(generics.ListAPIView):
    """
    GET /api/properties/featured/
    """
    serializer_class = PropertyListSerializer
    queryset = Property.objects.filter(
        status='approved', is_featured=True
    ).prefetch_related('images').order_by('-created_at')[:8]


# ── Admin Approval ─────────────────────────────────────────
class ApprovePropertyView(APIView):
    """
    POST /api/properties/<id>/approve/
    POST /api/properties/<id>/reject/
    Admin only.
    """
    permission_classes = [IsAdminUser]

    def post(self, request, pk, action):
        try:
            prop = Property.objects.get(pk=pk)
        except Property.DoesNotExist:
            return Response({'error': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        if action == 'approve':
            prop.status = 'approved'
            prop.save()
            return Response({'message': f'"{prop.title}" approved.'})
        elif action == 'reject':
            prop.status = 'rejected'
            prop.save()
            return Response({'message': f'"{prop.title}" rejected.'})

        return Response({'error': 'Invalid action.'}, status=status.HTTP_400_BAD_REQUEST)


# ── Wishlist ───────────────────────────────────────────────
class WishlistView(generics.ListAPIView):
    """GET /api/properties/wishlist/ → user's saved properties"""
    serializer_class = WishlistSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(
            user=self.request.user
        ).select_related('property').prefetch_related('property__images')


class WishlistToggleView(APIView):
    """
    POST /api/properties/<id>/wishlist/
    Add if not saved, remove if already saved.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            prop = Property.objects.get(pk=pk, status='approved')
        except Property.DoesNotExist:
            return Response({'error': 'Property not found.'}, status=404)

        wishlist_item, created = Wishlist.objects.get_or_create(
            user=request.user, property=prop
        )
        if not created:
            wishlist_item.delete()
            return Response({'message': 'Removed from wishlist.', 'wishlisted': False})

        return Response({'message': 'Added to wishlist.', 'wishlisted': True},
                        status=status.HTTP_201_CREATED)
