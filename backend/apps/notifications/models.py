from django.db import models
from django.conf import settings
from django.utils import timezone
from common.models import UUIDModel, TimestampedModel
from common.choices import NotificationType

class Notification(UUIDModel, TimestampedModel):
    """
    In-app alerts and notifications logs directed to platform users.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
        db_index=True
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False, db_index=True)
    read_at = models.DateTimeField(null=True, blank=True)
    notification_type = models.CharField(
        max_length=30,
        choices=NotificationType.choices,
        default=NotificationType.SYSTEM,
        db_index=True
    )
    # ✅ Redirect link for notifications
    action_url = models.CharField(max_length=500, blank=True, null=True, help_text="Redirect link for notifications actions")

    class Meta:
        db_table = 'notifications_notification'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']
        # ✅ Added composite performance indexes
        indexes = [
            models.Index(fields=['user', 'is_read', 'notification_type']),
            models.Index(fields=['user', 'created_at']),
        ]

    def __str__(self):
        status_str = "Read" if self.is_read else "Unread"
        return f"{self.user.username} - {self.title} ({status_str})"

    def mark_as_read(self):
        """
        Marks this notification as read and registers the read timestamp.
        """
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save(update_fields=['is_read', 'read_at'])
