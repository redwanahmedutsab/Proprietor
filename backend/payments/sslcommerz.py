"""
payments/sslcommerz.py — SSLCommerz Gateway Helper

Docs: https://developer.sslcommerz.com/doc/v4/
Sandbox store:   https://sandbox.sslcommerz.com
Production store: https://securepay.sslcommerz.com
"""
import requests
import hashlib
import logging

logger = logging.getLogger(__name__)


class SSLCommerzGateway:
    """
    Wraps SSLCommerz API calls.

    Usage:
        gateway = SSLCommerzGateway()
        result  = gateway.initiate_session(payment_data)
        # Redirect user to result['GatewayPageURL']
    """

    SANDBOX_URL = 'https://sandbox.sslcommerz.com'
    PRODUCTION_URL = 'https://securepay.sslcommerz.com'

    def __init__(self):
        from django.conf import settings
        self.store_id = settings.SSLCOMMERZ_STORE_ID
        self.store_pass = settings.SSLCOMMERZ_STORE_PASS
        self.is_sandbox = settings.SSLCOMMERZ_SANDBOX
        self.base_url = self.SANDBOX_URL if self.is_sandbox else self.PRODUCTION_URL

    # ── Initiate Payment Session ────────────────────────────
    def initiate_session(self, data: dict) -> dict:
        """
        Call SSLCommerz to get a payment session + redirect URL.

        Required keys in `data`:
          tran_id, total_amount, success_url, fail_url, cancel_url,
          cus_name, cus_email, cus_phone, cus_add1, cus_city, cus_country

        Returns the full SSLCommerz response dict.
        Raises ValueError if the API call fails.
        """
        payload = {
            'store_id': self.store_id,
            'store_passwd': self.store_pass,
            'currency': data.get('currency', 'BDT'),
            'product_category': 'real_estate',
            'shipping_method': 'NO',
            'num_of_item': 1,
            'product_name': data.get('product_name', 'Property Booking'),
            'product_profile': 'general',
            # Pass-through fields
            **data,
        }

        url = f"{self.base_url}/gwprocess/v4/api.php"
        try:
            resp = requests.post(url, data=payload, timeout=15)
            resp.raise_for_status()
            result = resp.json()
        except requests.RequestException as e:
            logger.error(f"SSLCommerz initiate error: {e}")
            raise ValueError(f"Payment gateway connection failed: {e}")

        if result.get('status') != 'SUCCESS':
            logger.error(f"SSLCommerz rejected session: {result}")
            raise ValueError(result.get('failedreason', 'Gateway rejected the request.'))

        return result

    # ── Verify IPN / Transaction ────────────────────────────
    def verify_transaction(self, val_id: str, amount: str, currency: str = 'BDT') -> dict:
        """
        Verify a completed transaction using the val_id from IPN.
        Always verify server-side — never trust the frontend alone.

        Returns the verification response dict.
        """
        url = f"{self.base_url}/validator/api/validationserverAPI.php"
        params = {
            'val_id': val_id,
            'store_id': self.store_id,
            'store_passwd': self.store_pass,
            'format': 'json',
        }
        try:
            resp = requests.get(url, params=params, timeout=15)
            resp.raise_for_status()
            return resp.json()
        except requests.RequestException as e:
            logger.error(f"SSLCommerz verify error: {e}")
            raise ValueError(f"Verification request failed: {e}")

    # ── Hash Verification (IPN security) ───────────────────
    def verify_hash(self, post_data: dict) -> bool:
        """
        Verify the MD5 hash in the IPN POST to confirm it's from SSLCommerz.
        Prevents fake IPN notifications.
        """
        received_hash = post_data.get('verify_hash', '')
        if not received_hash:
            return False

        # Build string to hash — SSLCommerz spec
        params_to_hash = {
            k: v for k, v in post_data.items()
            if k != 'verify_hash'
        }
        # Sort keys and join
        hash_string = ''.join(
            str(v) for _, v in sorted(params_to_hash.items())
        ) + self.store_pass

        calculated = hashlib.md5(hash_string.encode()).hexdigest()
        return calculated.upper() == received_hash.upper()
