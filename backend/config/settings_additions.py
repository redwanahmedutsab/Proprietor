# ─────────────────────────────────────────────────────────
# ADD THESE LINES to the bottom of config/settings.py
# ─────────────────────────────────────────────────────────
import os

# Phase 4 apps — add to INSTALLED_APPS:
# 'bookings',
# 'payments',

# ── SSLCommerz ────────────────────────────────────────────
SSLCOMMERZ_STORE_ID = os.getenv('SSLCOMMERZ_STORE_ID', 'your_store_id')
SSLCOMMERZ_STORE_PASS = os.getenv('SSLCOMMERZ_STORE_PASS', 'your_store_pass')
SSLCOMMERZ_SANDBOX = os.getenv('SSLCOMMERZ_SANDBOX', 'True') == 'True'

# ── Frontend URL (for payment redirects) ──────────────────
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
