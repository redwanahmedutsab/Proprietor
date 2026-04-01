"""
bookings/views.py
"""
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Booking
from .serializers import BookingCreateSerializer, BookingDetailSerializer


class BookingCreateView(generics.CreateAPIView):
    """
    POST /api/bookings/
    Create a new booking. User + price set automatically.
    """
    serializer_class = BookingCreateSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data,
                                         context={'request': request})
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        return Response(
            BookingDetailSerializer(booking, context={'request': request}).data,
            status=status.HTTP_201_CREATED,
        )


class MyBookingsView(generics.ListAPIView):
    """
    GET /api/bookings/mine/
    All bookings made by the logged-in user.
    """
    serializer_class = BookingDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(
            user=self.request.user
        ).select_related('property').prefetch_related('property__images')


class BookingDetailView(generics.RetrieveAPIView):
    """
    GET /api/bookings/<id>/
    """
    serializer_class = BookingDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Booking.objects.filter(user=self.request.user)


class CancelBookingView(APIView):
    """
    POST /api/bookings/<id>/cancel/
    Cancel a pending booking.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            booking = Booking.objects.get(pk=pk, user=request.user)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found.'}, status=404)

        if booking.status not in ('pending',):
            return Response(
                {'error': f'Cannot cancel a booking with status "{booking.status}".'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        booking.status = 'cancelled'
        booking.save()
        return Response({'message': 'Booking cancelled successfully.'})
