from django.contrib import admin
from django.utils import timezone
from subscriptions.models import SubscriptionPlan, Subscription
from common.choices import SubscriptionStatus

class SubscriptionPlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'currency', 'duration_days')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'description')


class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'plan', 'status', 'start_date', 'end_date', 'is_approved', 'approved_by', 'approved_at')
    list_filter = ('status', 'is_approved', 'plan')
    search_fields = ('user__username', 'user__email', 'stripe_subscription_id')
    readonly_fields = ('approved_by', 'approved_at')

    # ✅ Admin action to manually approve pending subscriptions
    actions = ['approve_subscriptions']

    @admin.action(description="Manually approve and activate selected subscriptions")
    def approve_subscriptions(self, request, queryset):
        rows_updated = queryset.update(
            is_approved=True,
            approved_by=request.user,
            approved_at=timezone.now(),
            status=SubscriptionStatus.ACTIVE
        )
        self.message_user(request, f"Successfully approved & activated {rows_updated} subscriptions.")

admin.site.register(SubscriptionPlan, SubscriptionPlanAdmin)
admin.site.register(Subscription, SubscriptionAdmin)
