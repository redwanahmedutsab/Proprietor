import os
import requests
import logging

logger = logging.getLogger(__name__)

SITE_NAME = "Proprietor"

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
# Use Resend's shared sending domain until you verify your own domain in
# the Resend dashboard. Once verified, set RESEND_FROM_EMAIL to something
# like "Proprietor <noreply@yourdomain.com>".
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "Proprietor <onboarding@resend.dev>")


def _send(subject, message, recipient):
    if not RESEND_API_KEY:
        logger.error("RESEND_API_KEY is not set — cannot send email to %s", recipient)
        return

    try:
        response = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "from": RESEND_FROM_EMAIL,
                "to": [recipient],
                "subject": f"[{SITE_NAME}] {subject}",
                "text": message,
            },
            timeout=10,
        )
        if response.status_code >= 400:
            logger.error(
                "Email failed to %s: %s %s", recipient, response.status_code, response.text
            )
        else:
            logger.info("Email sent to %s: %s", recipient, subject)
    except requests.RequestException as e:
        logger.error("Email failed to %s: %s", recipient, e)


def send_otp_email(email, code):
    _send(
        subject="Your Verification Code",
        message=(
            f"Hi,\n\n"
            f"Your {SITE_NAME} verification code is: {code}\n\n"
            f"This code expires in 10 minutes. If you didn't request this, "
            f"you can safely ignore this email.\n\n"
            f"— The {SITE_NAME} Team"
        ),
        recipient=email,
    )


def send_welcome_email(user):
    _send(
        subject="Welcome to Proprietor!",
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
