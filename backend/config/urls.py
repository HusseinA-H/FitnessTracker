from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter

from core.views import health_check
from users.views import ProfileView, AdminUserViewSet
from ai.views import AdminAIUsageViewSet
from core.admin_views import AdminDashboardAnalyticsView, AnnouncementViewSet, ContentSettingsView, NutritionTemplateViewSet
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

admin_router = DefaultRouter()
admin_router.register('users', AdminUserViewSet, basename='admin-users')
admin_router.register('ai', AdminAIUsageViewSet, basename='admin-ai')
admin_router.register('announcements', AnnouncementViewSet, basename='admin-announcements')
admin_router.register('nutrition-templates', NutritionTemplateViewSet, basename='admin-nutrition-templates')

urlpatterns = [
    path('admin/', admin.site.urls),

    # ✅ API v1 Versioned Endpoint Registry
    path('api/v1/health/', health_check, name='health-check'),
    path('api/v1/auth/', include('users.urls', namespace='users')),
    path('api/v1/profile/', ProfileView.as_view(), name='profile'),
    path('api/v1/workouts/', include('workouts.urls', namespace='workouts')),
    path('api/v1/progress/', include('progress.urls', namespace='progress')),
    path('api/v1/subscriptions/', include('subscriptions.urls', namespace='subscriptions')),
    path('api/v1/payments/', include('payments.urls', namespace='payments')),
    path('api/v1/notifications/', include('notifications.urls', namespace='notifications')),
    path('api/v1/dashboard/', include('dashboard.urls', namespace='dashboard')),
    path('api/v1/ai/', include('ai.urls', namespace='ai')),
    
    # Admin Panel routes
    path('api/v1/admin/analytics/', AdminDashboardAnalyticsView.as_view(), name='admin-analytics'),
    path('api/v1/admin/content-control/', ContentSettingsView.as_view(), name='admin-content-control'),
    path('api/v1/admin/', include(admin_router.urls)),
    
    # OpenAPI v3 Documentation
    path('api/v1/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/v1/schema/swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/v1/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

# Serve media and static files in development mode
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
