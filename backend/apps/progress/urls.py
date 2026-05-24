from django.urls import path, include
from rest_framework.routers import DefaultRouter
from progress.views import ProgressLogViewSet

router = DefaultRouter()
router.register('', ProgressLogViewSet, basename='progress-log')

app_name = 'progress'

urlpatterns = [
    path('', include(router.urls)),
]
