from django.db import models
from common.models import UUIDModel, TimestampedModel

class Announcement(UUIDModel, TimestampedModel):
    title = models.CharField(max_length=200)
    content = models.TextField()
    type = models.CharField(
        max_length=20,
        choices=[
            ('info', 'Information'),
            ('warning', 'Warning'),
            ('success', 'Success'),
            ('danger', 'Critical Alert'),
        ],
        default='info'
    )
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        db_table = 'core_announcement'
        verbose_name = 'Announcement'
        verbose_name_plural = 'Announcements'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class ContentSettings(UUIDModel, TimestampedModel):
    key = models.CharField(max_length=100, unique=True, db_index=True)
    value = models.TextField(blank=True, default='')

    class Meta:
        db_table = 'core_content_settings'
        verbose_name = 'Content Settings'
        verbose_name_plural = 'Content Settings'

    def __str__(self):
        return self.key


class NutritionTemplate(UUIDModel, TimestampedModel):
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True, default='')
    calories = models.PositiveIntegerField(help_text="Target calories in kcal")
    protein = models.PositiveIntegerField(help_text="Target protein in grams")
    carbs = models.PositiveIntegerField(help_text="Target carbohydrates in grams")
    fats = models.PositiveIntegerField(help_text="Target fats in grams")
    meals_data = models.JSONField(default=dict, help_text="Detailed meal structures", blank=True)
    is_active = models.BooleanField(default=True, db_index=True)

    class Meta:
        db_table = 'core_nutrition_template'
        verbose_name = 'Nutrition Template'
        verbose_name_plural = 'Nutrition Templates'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.calories} kcal)"
