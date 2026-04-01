"""
payments/views.py — Payment Flow Views

Flow:
  1. POST /api/payments/initiate/<booking_id>/
     → Creates Payment record, calls SSLCommerz, returns redirect URL

  2. SSLCommerz redirects user to success/fail/cancel URLs
     → POST /api/payments/success/  (IPN from SSLCommerz)
     → POST /api/payments/fail/
     → POST /api/payments/cancel/

  3. Frontend polls GET /api/payments/status/<booking_id>/
     → Returns { is_paid, status }
"""
import uuid
import logging

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status

from bookings.models import Booking
from .models import Payment
from .sslcommerz import SSLCommerzGateway

logger = logging.getLogger(__name__)


class InitiatePaymentView(APIView):
    """
    POST /api/payments/initiate/<booking_id>/
    Initiates an SSLCommerz payment session for a booking.
    Returns { payment_url } to redirect the user.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, booking_id):
        try:
            booking = Booking.objects.get(pk=booking_id, user=request.user)
        except Booking.DoesNotExist:
            return Response({'error': 'Booking not found.'}, status=404)

        if booking.status == 'confirmed':
            return Response({'error': 'This booking is already paid.'}, status=400)

        # Generate a unique transaction ID
        tran_id = f"BDPROP-{booking.id}-{uuid.uuid4().hex[:8].upper()}"

        # Build callback URLs — frontend listens on these
        base = request.build_absolute_uri('/').rstrip('/')
        success_url = f"{base}/api/payments/success/"
        fail_url = f"{base}/api/payments/fail/"
        cancel_url = f"{base}/api/payments/cancel/"

        user = request.user

        payment_data = {
            'tran_id': tran_id,
            'total_amount': str(booking.total_price),
            'success_url': success_url,
            'fail_url': fail_url,
            'cancel_url': cancel_url,
            'product_name': f"Property: {booking.property.title}",

            # Customer info
            'cus_name': user.get_full_name() or user.username,
            'cus_email': user.email,
            'cus_phone': user.phone or '01700000000',
            'cus_add1': user.address or 'Dhaka',
            'cus_city': booking.property.city,
            'cus_country': 'Bangladesh',
            'cus_postcode': '1000',
        }

        try:
            gateway = SSLCommerzGateway()
            response = gateway.initiate_session(payment_data)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_502_BAD_GATEWAY)

        # Save payment record
        Payment.objects.update_or_create(
            booking=booking,
            defaults={
                'tran_id': tran_id,
                'amount': booking.total_price,
                'status': 'pending',
                'session_key': response.get('sessionkey', ''),
                'gateway_response': response,
            }
        )

        return Response({
            'payment_url': response['GatewayPageURL'],
            'tran_id': tran_id,
        })


@method_decorator(csrf_exempt, name='dispatch')
class PaymentSuccessView(APIView):
    """
    POST /api/payments/success/
    SSLCommerz IPN — called by the gateway after successful payment.
    Verifies transaction server-side then marks booking as confirmed.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        data = request.POST
        val_id = data.get('val_id')
        tran_id = data.get('tran_id')
        amount = data.get('amount')

        if not val_id or not tran_id:
            logger.warning("SSLCommerz IPN missing val_id or tran_id")
            return self._redirect_frontend('fail')

        try:
            payment = Payment.objects.get(tran_id=tran_id)
        except Payment.DoesNotExist:
            logger.error(f"Payment not found for tran_id {tran_id}")
            return self._redirect_frontend('fail')

        # ── Server-side verification ────────────────────────
        try:
            gateway = SSLCommerzGateway()
            verify_resp = gateway.verify_transaction(val_id, amount)
        except ValueError as e:
            logger.error(f"Verification failed: {e}")
            return self._redirect_frontend('fail')

        if verify_resp.get('status') != 'VALID':
            logger.warning(f"Transaction invalid: {verify_resp}")
            payment.status = 'failed'
            payment.gateway_response = verify_resp
            payment.save()
            return self._redirect_frontend('fail')

        # ── Mark payment and booking as confirmed ───────────
        payment.val_id = val_id
        payment.status = 'verified'
        payment.is_verified = True
        payment.gateway_response = verify_resp
        payment.save()

        booking = payment.booking
        booking.status = 'confirmed'
        booking.save()

        logger.info(f"Payment verified: {tran_id} — Booking {booking.id} confirmed")
        return self._redirect_frontend('success', booking.id)

    def _redirect_frontend(self, result, booking_id=None):
        from django.http import HttpResponseRedirect
        from django.conf import settings
        base = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        if result == 'success' and booking_id:
            return HttpResponseRedirect(f"{base}/payment/success?booking={booking_id}")
        return HttpResponseRedirect(f"{base}/payment/{result}")


@method_decorator(csrf_exempt, name='dispatch')
class PaymentFailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        tran_id = request.POST.get('tran_id')
        if tran_id:
            Payment.objects.filter(tran_id=tran_id).update(status='failed')
        from django.http import HttpResponseRedirect
        from django.conf import settings
        base = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        return HttpResponseRedirect(f"{base}/payment/fail")


@method_decorator(csrf_exempt, name='dispatch')
class PaymentCancelView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        tran_id = request.POST.get('tran_id')
        if tran_id:
            Payment.objects.filter(tran_id=tran_id).update(status='cancelled')
        from django.http import HttpResponseRedirect
        from django.conf import settings
        base = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        return HttpResponseRedirect(f"{base}/payment/cancel")


class PaymentStatusView(APIView):
    """
    GET /api/payments/status/<booking_id>/
    Frontend polls this to check payment result.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, booking_id):
        try:
            booking = Booking.objects.get(pk=booking_id, user=request.user)
        except Booking.DoesNotExist:
            return Response({'error': 'Not found.'}, status=404)

        payment = getattr(booking, 'payment', None)
        return Response({
            'booking_id': booking.id,
            'booking_status': booking.status,
            'is_paid': booking.is_paid,
            'payment_status': payment.status if payment else None,
            'tran_id': payment.tran_id if payment else None,
        })
