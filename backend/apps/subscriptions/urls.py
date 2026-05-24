from django.urls import path, include
from rest_framework.routers import DefaultRouter
from subscriptions.views import SubscriptionPlanViewSet, SubscriptionViewSet

router = DefaultRouter()
router.register('plans', SubscriptionPlanViewSet, basename='subscription-plan')
router.register('', SubscriptionViewSet, basename='subscription')

app_name = 'subscriptions'

urlpatterns = [
    path('', include(router.urls)),
]
