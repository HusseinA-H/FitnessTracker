from django.db import models
from django.conf import settings
from common.models import UUIDModel, TimestampedModel, SoftDeleteModel

class Exercise(UUIDModel, TimestampedModel):
    """
    Catalog of global and customizable exercises.
    """
    name = models.CharField(max_length=200, db_index=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, db_index=True, help_text="e.g. Chest, Back, Legs")
    equipment = models.JSONField(default=list, blank=True, help_text="List of required equipment")
    muscles = models.JSONField(default=list, blank=True, help_text="List of primary target muscles")
    muscles_secondary = models.JSONField(default=list, blank=True, help_text="List of secondary target muscles")

    class Meta:
        db_table = 'workouts_exercise'
        verbose_name = 'Exercise'
        verbose_name_plural = 'Exercises'
        ordering = ['name']

    def __str__(self):
        return self.name


class Workout(UUIDModel, TimestampedModel, SoftDeleteModel):
    """
    Routines templates (blueprints) and logged training sessions.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='workouts',
        db_index=True
    )
    name = models.CharField(max_length=250)
    description = models.TextField(blank=True)
    is_blueprint = models.BooleanField(default=False, db_index=True, help_text="True if this is a pre-built program template")
    level = models.CharField(max_length=100, blank=True, help_text="e.g. Beginner, Intermediate, Advanced")

    class Meta:
        db_table = 'workouts_workout'
        verbose_name = 'Workout'
        verbose_name_plural = 'Workouts'
        indexes = [
            models.Index(fields=['user', 'is_blueprint', 'is_deleted']),
        ]

    def __str__(self):
        type_str = "Blueprint" if self.is_blueprint else "Logged Session"
        return f"{self.name} - {type_str} ({self.user.username})"


class WorkoutLog(UUIDModel, TimestampedModel):
    """
    Individual exercise performance logs inside a session.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='workout_logs',
        db_index=True
    )
    workout = models.ForeignKey(
        Workout,
        on_delete=models.SET_NULL,
        related_name='logs',
        null=True,
        blank=True,
        db_index=True
    )
    exercise = models.ForeignKey(
        Exercise,
        on_delete=models.PROTECT,
        related_name='logs',
        db_index=True
    )
    sets = models.PositiveIntegerField(help_text="Number of sets completed")
    reps = models.CharField(max_length=50, help_text="e.g. '8-10', '12', 'AMRAP'")
    weight = models.DecimalField(max_digits=6, decimal_places=2, help_text="Weight lifted in kg")
    date = models.DateField(db_index=True)
    
    # ✅ Log integrity features
    is_locked = models.BooleanField(default=False, db_index=True, help_text="True if this log is locked and cannot be modified")
    locked_at = models.DateTimeField(null=True, blank=True, help_text="Timestamp when this log was locked")

    class Meta:
        db_table = 'workouts_workout_log'
        verbose_name = 'Workout Log'
        verbose_name_plural = 'Workout Logs'
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['user', 'exercise', 'date']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.exercise.name} ({self.sets}x{self.reps} @ {self.weight}kg) on {self.date}"
