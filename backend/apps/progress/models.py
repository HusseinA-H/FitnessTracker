from django.db import models
from django.conf import settings
from common.models import UUIDModel, TimestampedModel, SoftDeleteModel

class ProgressLog(UUIDModel, TimestampedModel, SoftDeleteModel):
    """
    User progress log capturing body weight and fat percentage,
    automatically calculating muscle (lean) and fat masses.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='progress_logs',
        db_index=True
    )
    weight = models.DecimalField(max_digits=5, decimal_places=2, help_text="Body weight in kg")
    body_fat = models.DecimalField(max_digits=4, decimal_places=2, help_text="Body fat percentage %")
    lean_mass = models.DecimalField(max_digits=5, decimal_places=2, help_text="Auto-calculated lean muscle mass in kg", editable=False)
    fat_mass = models.DecimalField(max_digits=5, decimal_places=2, help_text="Auto-calculated fat mass in kg", editable=False)
    date = models.DateField(db_index=True)

    class Meta:
        db_table = 'progress_progress_log'
        verbose_name = 'Progress Log'
        verbose_name_plural = 'Progress Logs'
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['user', 'date', 'is_deleted']),
        ]

    def __str__(self):
        return f"{self.user.username} - Progress on {self.date} (Weight: {self.weight}kg, Fat: {self.body_fat}%)"

    def save(self, *args, **kwargs):
        # ✅ Auto-compute lean mass & fat mass before saving
        if self.weight is not None and self.body_fat is not None:
            self.fat_mass = self.weight * (self.body_fat / 100)
            self.lean_mass = self.weight - self.fat_mass
        super().save(*args, **kwargs)
