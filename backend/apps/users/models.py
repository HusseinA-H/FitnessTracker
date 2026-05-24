from django.contrib.auth.models import AbstractUser
from django.db import models
from common.models import UUIDModel, TimestampedModel, SoftDeleteModel
from common.choices import UserRole, Gender, FitnessLevel

class User(AbstractUser, UUIDModel, TimestampedModel):
    email = models.EmailField(
        unique=True,
        db_index=True,
        error_messages={
            'unique': "A user with that email already exists.",
        }
    )
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.USER,
        db_index=True
    )
    # ✅ Fast-access current subscription link
    current_subscription = models.OneToOneField(
        'subscriptions.Subscription',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='current_for_user',
        help_text="Optimized link to the user's active subscription tier"
    )

    class Meta:
        db_table = 'users_user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.username} ({self.role})"


class Profile(UUIDModel, TimestampedModel, SoftDeleteModel):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
        db_index=True
    )
    height = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Height in cm")
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Current weight in kg")
    goal_weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Target weight in kg")
    fitness_level = models.CharField(
        max_length=20,
        choices=FitnessLevel.choices,
        default=FitnessLevel.BEGINNER
    )
    gender = models.CharField(
        max_length=20,
        choices=Gender.choices,
        default=Gender.OTHER
    )
    date_of_birth = models.DateField(null=True, blank=True)
    activity_level = models.DecimalField(max_digits=4, decimal_places=3, default=1.2, help_text="BMR activity multiplier")

    class Meta:
        db_table = 'users_profile'
        verbose_name = 'Profile'
        verbose_name_plural = 'Profiles'
        indexes = [
            models.Index(fields=['user', 'is_deleted']),
        ]

    def __str__(self):
        return f"Profile of {self.user.username}"
