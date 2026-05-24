from rest_framework import serializers
from notifications.models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ('id', 'user', 'title', 'message', 'is_read', 'read_at', 'notification_type', 'action_url', 'created_at')
        read_only_fields = ('id', 'user', 'is_read', 'read_at', 'created_at')
