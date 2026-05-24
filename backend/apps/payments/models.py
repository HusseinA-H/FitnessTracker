from django.db import models
from django.conf import settings
from common.models import UUIDModel, TimestampedModel
from common.choices import PaymentMethod, PaymentStatus
from common.validators import validate_secure_image, secure_proof_upload_path

class Payment(UUIDModel, TimestampedModel):
    """
    Financial transactions histories for plan upgrades, supporting
    automated gateway checkouts (Stripe) and manual bank receipt verification.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='payments',
        db_index=True
    )
    subscription = models.ForeignKey(
        'subscriptions.Subscription',
        on_delete=models.SET_NULL,
        related_name='payments',
        null=True,
        blank=True,
        db_index=True
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="Transaction amount")
    currency = models.CharField(max_length=3, default='USD')
    payment_method = models.CharField(
        max_length=30,
        choices=PaymentMethod.choices,
        default=PaymentMethod.STRIPE,
        db_index=True
    )
    payment_status = models.CharField(
        max_length=30,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
        db_index=True
    )
    reference_number = models.CharField(
        max_length=150,
        blank=True,
        null=True,
        db_index=True,
        help_text="Reference/Transaction ID from the bank transfer or payment gateway"
    )
    proof_image = models.ImageField(
        upload_to=secure_proof_upload_path,
        validators=[validate_secure_image],
        blank=True,
        null=True,
        help_text="Uploaded image proof of payment for manual bank transfers"
    )
    transaction_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        unique=True,
        db_index=True,
        help_text="Stripe charge or transaction session ID"
    )

    class Meta:
        db_table = 'payments_payment'
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'payment_status', 'payment_method']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.amount} {self.currency} ({self.payment_status})"
