from django.db import models
from django.conf import settings
from django.utils import timezone
from common.models import UUIDModel, TimestampedModel
from common.choices import SubscriptionStatus

class SubscriptionPlan(UUIDModel, TimestampedModel):
    """
    SaaS membership tier specifications and billing cycles.
    """
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2, help_text="Plan price")
    currency = models.CharField(max_length=3, default='USD')
    duration_days = models.PositiveIntegerField(help_text="Duration in days, e.g. 30, 365")
    
    # Schema properties inside features JSON:
    # {
    #   "workout_limit": 5,           // integer count
    #   "ai_limit": 10,               // monthly prompt limit
    #   "dashboard_access": false,    // boolean
    #   "feature_flags": {            // dict of custom sub-features
    #       "premium_tracker": false,
    #       "advanced_analytics": false
    #   }
    # }
    features = models.JSONField(
        default=dict,
        help_text="JSON mapping for workout limits, AI usage thresholds, dashboard flags, and premium configurations."
    )

    class Meta:
        db_table = 'subscriptions_subscription_plan'
        verbose_name = 'Subscription Plan'
        verbose_name_plural = 'Subscription Plans'

    def __str__(self):
        return f"{self.name} ({self.price} {self.currency}/{self.duration_days} days)"


class SubscriptionQuerySet(models.QuerySet):
    def active(self):
        now = timezone.now()
        return self.filter(
            status=SubscriptionStatus.ACTIVE,
            is_approved=True,
            start_date__lte=now,
            end_date__gte=now
        )

class SubscriptionManager(models.Manager):
    def get_queryset(self):
        return SubscriptionQuerySet(self.model, using=self._db)

    def get_active_subscription(self, user):
        """
        Retrieves the active, approved subscription for a given user.
        """
        return self.get_queryset().active().filter(user=user).select_related('plan').first()


class Subscription(UUIDModel, TimestampedModel):
    """
    SaaS active user subscriptions records mapping payment plans and credentials.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='subscriptions',
        db_index=True
    )
    plan = models.ForeignKey(
        SubscriptionPlan,
        on_delete=models.PROTECT,
        related_name='subscriptions',
        db_index=True
    )
    status = models.CharField(
        max_length=30,
        choices=SubscriptionStatus.choices,
        default=SubscriptionStatus.PENDING_APPROVAL,
        db_index=True
    )
    start_date = models.DateTimeField(db_index=True)
    end_date = models.DateTimeField(db_index=True)
    
    # ✅ Manual Admin-Controlled Approvals
    is_approved = models.BooleanField(default=False, db_index=True, help_text="True if approved by an Administrator")
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_subscriptions',
        help_text="The administrator who manually approved this subscription"
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    
    stripe_subscription_id = models.CharField(max_length=255, blank=True, null=True, db_index=True)

    objects = SubscriptionManager()
    all_objects = models.Manager() # Expose default manager for unbounded access

    class Meta:
        db_table = 'subscriptions_subscription'
        verbose_name = 'Subscription'
        verbose_name_plural = 'Subscriptions'
        indexes = [
            models.Index(fields=['user', 'status', 'is_approved']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.plan.name} ({self.status})"

    @property
    def is_currently_active(self):
        now = timezone.now()
        return (
            self.status == SubscriptionStatus.ACTIVE and
            self.is_approved and
            self.start_date <= now <= self.end_date
        )
