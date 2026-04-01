"""
reviews/urls.py
"""
from django.urls import path
from .views import PropertyReviewsView, DeleteReviewView

urlpatterns = [
    path('', DeleteReviewView.as_view(), name='delete-review'),  # /api/reviews/<id>/
]

# Note: PropertyReviewsView is wired under /api/properties/<id>/reviews/
# in config/urls.py directly (see config/urls.py below)
