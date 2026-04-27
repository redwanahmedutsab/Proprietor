from django.urls import path
from .views import PropertyReviewsView, DeleteReviewView

urlpatterns = [
    path('', DeleteReviewView.as_view(), name='delete-review'),
]
