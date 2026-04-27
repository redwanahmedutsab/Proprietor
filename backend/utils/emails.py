from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

SITE_NAME = "BDProperty"
FROM_EMAIL = settings.DEFAULT_FROM_EMAIL


def _send(subject, message, recipient):
    try:
        send_mail(
            subject=f"[{SITE_NAME}] {subject}",
            message=message,
            from_email=FROM_EMAIL,
            recipient_list=[recipient],
            fail_silently=False,
        )
        logger.info(f"Email sent to {recipient}: {subject}")
    except Exception as e:
        logger.error(f"Email failed to {recipient}: {e}")


def send_welcome_email(user):
    _send(
        subject="Welcome to BDProperty!",
        message=(
            f"Hi {user.first_name},\n\n"
            f"Welcome to {SITE_NAME} — Bangladesh's real estate platform.\n\n"
            f"You can now browse properties, post listings, and make bookings.\n\n"
            f"Happy house hunting!\n— The {SITE_NAME} Team"
        ),
        recipient=user.email,
    )


def send_booking_created_email(booking):
    _send(
        subject=f"Booking Received — {booking.property.title}",
        message=(
            f"Hi {booking.user.first_name},\n\n"
            f"Your booking request has been received:\n\n"
            f"  Property : {booking.property.title}\n"
            f"  Type     : {booking.get_booking_type_display()}\n"
            f"  Amount   : BDT {booking.total_price}\n"
            f"  Payment  : {booking.get_payment_method_display()}\n"
            f"  Status   : Pending\n\n"
            f"The property owner will be in touch shortly.\n\n"
            f"— The {SITE_NAME} Team"
        ),
        recipient=booking.user.email,
    )


def send_payment_confirmed_email(booking):
    _send(
        subject=f"Payment Confirmed — {booking.property.title}",
        message=(
            f"Hi {booking.user.first_name},\n\n"
            f"Great news! Your payment has been confirmed.\n\n"
            f"  Property  : {booking.property.title}\n"
            f"  Amount    : BDT {booking.total_price}\n"
            f"  Tran ID   : {booking.payment.tran_id}\n"
            f"  Status    : Confirmed ✅\n\n"
            f"The owner will contact you to arrange access.\n\n"
            f"— The {SITE_NAME} Team"
        ),
        recipient=booking.user.email,
    )


def send_property_approved_email(prop):
    _send(
        subject=f"Your Listing is Live — {prop.title}",
        message=(
            f"Hi {prop.owner.first_name},\n\n"
            f"Your property listing has been approved and is now live:\n\n"
            f"  Title    : {prop.title}\n"
            f"  City     : {prop.city}\n"
            f"  Price    : BDT {prop.price}\n\n"
            f"Buyers and renters can now find your property.\n\n"
            f"— The {SITE_NAME} Team"
        ),
        recipient=prop.owner.email,
    )
