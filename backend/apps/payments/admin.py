from django.contrib import admin
from payments.models import Payment
from common.choices import PaymentStatus, SubscriptionStatus
from django.utils import timezone

class PaymentAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'currency', 'payment_method', 'payment_status', 'reference_number', 'has_proof')
    list_filter = ('payment_status', 'payment_method')
    search_fields = ('user__username', 'reference_number', 'transaction_id')
    readonly_fields = ('transaction_id',)
    
    actions = ['mark_as_success', 'mark_as_failed']

    def has_proof(self, obj):
        return bool(obj.proof_image)
    has_proof.boolean = True
    has_proof.short_description = "Proof Uploaded"

    @admin.action(description="Mark selected payments as Successful & activate subscriptions")
    def mark_as_success(self, request, queryset):
        # Update payment status
        rows_updated = queryset.update(payment_status=PaymentStatus.SUCCESS)
        
        # Proactively approve & activate related subscriptions
        for payment in queryset:
            if payment.subscription:
                payment.subscription.is_approved = True
                payment.subscription.approved_by = request.user
                payment.subscription.approved_at = timezone.now()
                payment.subscription.status = SubscriptionStatus.ACTIVE
                payment.subscription.save()

        self.message_user(request, f"Successfully processed {rows_updated} payments and activated related subscriptions.")

    @admin.action(description="Mark selected payments as Failed")
    def mark_as_failed(self, request, queryset):
        rows_updated = queryset.update(payment_status=PaymentStatus.FAILED)
        self.message_user(request, f"Successfully marked {rows_updated} payments as Failed.")

admin.site.register(Payment, PaymentAdmin)
