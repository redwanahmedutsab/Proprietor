from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

from reviews.views import PropertyReviewsView, DeleteReviewView


def health_check(request):
    """
    Lightweight, dependency-free endpoint used by the frontend to detect
    when the Render free-tier instance has finished spinning up.
    Deliberately avoids touching the database so it responds as fast as
    possible the moment the process is alive.
    """
    return JsonResponse({'status': 'ok'})


urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/health/', health_check, name='health-check'),

    path('api/auth/', include('users.urls')),

    path('api/properties/', include('properties.urls')),

    path('api/bookings/', include('bookings.urls')),
    path('api/payments/', include('payments.urls')),

    path('api/properties/<int:pk>/reviews/', PropertyReviewsView.as_view(), name='property-reviews'),
    path('api/reviews/<int:pk>/', DeleteReviewView.as_view(), name='delete-review'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
