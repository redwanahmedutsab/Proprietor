from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from django.db.models import Avg

from .models import Review
from .serializers import ReviewSerializer
from properties.models import Property


class PropertyReviewsView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return Review.objects.filter(
            property_id=self.kwargs['pk']
        ).select_related('user')

    def create(self, request, *args, **kwargs):
        property_id = self.kwargs['pk']

        if Review.objects.filter(user=request.user, property_id=property_id).exists():
            return Response(
                {'error': 'You have already reviewed this property.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            prop = Property.objects.get(pk=property_id, status='approved')
        except Property.DoesNotExist:
            return Response({'error': 'Property not found.'}, status=404)

        serializer = self.get_serializer(data=request.data,
                                         context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user, property=prop)

        avg = Review.objects.filter(property=prop).aggregate(
            avg=Avg('rating')
        )['avg'] or 0

        return Response({
            'review': serializer.data,
            'new_average_rating': round(avg, 1),
        }, status=status.HTTP_201_CREATED)


class DeleteReviewView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(user=self.request.user)
