"""
URL configuration for policybridge_backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from django.http import JsonResponse

def health_check(request):
    return JsonResponse({"status": "ok", "message": "PolicyBridge AI Backend is Running"})

urlpatterns = [
    path('', health_check),
    path('admin/', admin.site.urls),
    # Custom app URLs - make API endpoints clearer
    path('api/users/', include('users.urls')),
    path('api/policies/', include('policies.urls')),
    path('api/ai/', include('ai.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
