from django.db import models
from django.conf import settings
from django.utils import timezone
from common.models import UUIDModel, TimestampedModel
from common.choices import AIRequestType, AIModelName, MessageRole, AIProvider

class AIUsageManager(models.Manager):
    def get_monthly_token_count(self, user, year=None, month=None):
        """
        Retrieves the total token consumption for the user in the specified month.
        Defaults to the current calendar month.
        """
        now = timezone.now()
        y = year or now.year
        m = month or now.month
        
        return self.filter(
            user=user,
            date__year=y,
            date__month=m
        ).aggregate(total=models.Sum('total_tokens'))['total'] or 0


class AIUsage(UUIDModel, TimestampedModel):
    """
    Detailed analytics logging the utilization of AI engines, tokens consumed,
    estimated credit costs, and latency metrics to regulate billing thresholds.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ai_usages',
        db_index=True
    )
    prompt_tokens = models.PositiveIntegerField(default=0)
    completion_tokens = models.PositiveIntegerField(default=0)
    total_tokens = models.PositiveIntegerField(default=0, db_index=True, editable=False)
    request_type = models.CharField(
        max_length=50,
        choices=AIRequestType.choices,
        default=AIRequestType.CHAT,
        db_index=True
    )
    model_name = models.CharField(
        max_length=50,
        choices=AIModelName.choices,
        default=AIModelName.GROQ_LLAMA_3_3_70B,
        db_index=True
    )
    provider_name = models.CharField(
        max_length=50,
        choices=AIProvider.choices,
        default=AIProvider.GROQ,
        db_index=True
    )
    estimated_cost = models.DecimalField(
        max_digits=10, 
        decimal_places=6, 
        default=0.000000,
        help_text="Estimated token usage cost in USD"
    )
    response_time = models.FloatField(
        default=0.0,
        help_text="Response time/latency in seconds"
    )
    date = models.DateField(default=timezone.now, db_index=True)

    objects = AIUsageManager()
    all_objects = models.Manager()

    class Meta:
        db_table = 'ai_ai_usage'
        verbose_name = 'AI Usage'
        verbose_name_plural = 'AI Usages'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'date', 'request_type']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.request_type} ({self.total_tokens} tokens on {self.date})"

    def save(self, *args, **kwargs):
        # ✅ Auto-compute total tokens before saving
        self.total_tokens = self.prompt_tokens + self.completion_tokens
        super().save(*args, **kwargs)


class AIConversation(UUIDModel, TimestampedModel):
    """
    Conversational threads grouping individual chat messages.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ai_conversations',
        db_index=True
    )
    title = models.CharField(max_length=255, default="New Conversation")

    class Meta:
        db_table = 'ai_ai_conversation'
        verbose_name = 'AI Conversation'
        verbose_name_plural = 'AI Conversations'
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.user.username} - {self.title} ({self.updated_at.strftime('%Y-%m-%d %H:%M')})"


class AIMessage(UUIDModel, TimestampedModel):
    """
    Individual chat messages in an AI conversation thread.
    """
    conversation = models.ForeignKey(
        AIConversation,
        on_delete=models.CASCADE,
        related_name='messages',
        db_index=True
    )
    role = models.CharField(
        max_length=20,
        choices=MessageRole.choices,
        default=MessageRole.USER,
        db_index=True
    )
    content = models.TextField()
    
    # ✅ Added token metrics and model names to messages
    token_count = models.PositiveIntegerField(default=0, help_text="Tokens consumed by this message")
    model_name = models.CharField(
        max_length=50,
        choices=AIModelName.choices,
        default=AIModelName.GROQ_LLAMA_3_3_70B,
        db_index=True
    )

    class Meta:
        db_table = 'ai_ai_message'
        verbose_name = 'AI Message'
        verbose_name_plural = 'AI Messages'
        ordering = ['created_at']
        # ✅ Added fast-access performance index
        indexes = [
            models.Index(fields=['conversation', 'created_at']),
        ]

    def __str__(self):
        return f"{self.role.capitalize()}: {self.content[:50]}..."

