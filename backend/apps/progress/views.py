from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from progress.models import ProgressLog
from progress.serializers import ProgressLogSerializer

class ProgressLogViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ProgressLog CRUD operations.
    Enforces user isolation, only allowing users to manage their own progress logs.
    """
    serializer_class = ProgressLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Isolation: return only non-deleted logs belonging to the user
        return ProgressLog.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
