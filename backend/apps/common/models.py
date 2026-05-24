import uuid
from django.db import models
from django.utils import timezone

class UUIDModel(models.Model):
    """
    Abstract model that uses UUID4 as primary key instead of auto-incrementing integers.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True

class TimestampedModel(models.Model):
    """
    Abstract model that automatically tracks creation and last updated timestamps.
    """
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class SoftDeleteQuerySet(models.QuerySet):
    def delete(self):
        # Bulk soft delete
        return self.update(is_deleted=True, deleted_at=timezone.now())

    def hard_delete(self):
        return super().delete()

class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        # Excludes soft deleted logs by default
        return SoftDeleteQuerySet(self.model, using=self._db).filter(is_deleted=False)

class SoftDeleteModel(models.Model):
    """
    Abstract model adding soft delete functionality to submodels.
    """
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = SoftDeleteManager()
    all_objects = models.Manager() # Expose backup manager for admin queries

    class Meta:
        abstract = True

    def delete(self, *args, **kwargs):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(update_fields=['is_deleted', 'deleted_at'])

    def restore(self):
        self.is_deleted = False
        self.deleted_at = None
        self.save(update_fields=['is_deleted', 'deleted_at'])

    def hard_delete(self, *args, **kwargs):
        super().delete(*args, **kwargs)


from django.conf import settings

class AuditLog(models.Model):
    """
    Database model to log security-sensitive events (logins, subscription/payment approvals, suspicious requests).
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audit_logs'
    )
    action = models.CharField(max_length=255, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    status = models.CharField(max_length=50, default="SUCCESS")
    details = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'common_audit_log'
        ordering = ['-timestamp']
        verbose_name = 'Audit Log'
        verbose_name_plural = 'Audit Logs'

    def __str__(self):
        actor_name = self.actor.username if self.actor else "Anonymous"
        return f"{self.timestamp} - {actor_name} - {self.action} ({self.status})"


def log_audit_event(actor, action, request=None, status="SUCCESS", details=None):
    ip = None
    ua = None
    if request:
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        ua = request.META.get('HTTP_USER_AGENT')

    AuditLog.objects.create(
        actor=actor if (actor and actor.is_authenticated) else None,
        action=action,
        ip_address=ip,
        user_agent=ua,
        status=status,
        details=details or {}
    )
