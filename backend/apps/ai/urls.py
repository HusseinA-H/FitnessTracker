from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ai.views import AIConversationViewSet, AIMessageViewSet, AIInsightsView

router = DefaultRouter()
router.register('conversations', AIConversationViewSet, basename='ai-conversation')
router.register('messages', AIMessageViewSet, basename='ai-message')
router.register('insights', AIInsightsView, basename='ai-insights')

app_name = 'ai'

urlpatterns = [
    path('', include(router.urls)),
]