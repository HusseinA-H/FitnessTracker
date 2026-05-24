from rest_framework import serializers
from subscriptions.models import SubscriptionPlan, Subscription

class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = ('id', 'name', 'slug', 'description', 'price', 'currency', 'duration_days', 'features')


class SubscriptionSerializer(serializers.ModelSerializer):
    plan_details = SubscriptionPlanSerializer(source='plan', read_only=True)

    class Meta:
        model = Subscription
        fields = (
            'id', 'user', 'plan', 'plan_details', 'status',
            'start_date', 'end_date', 'is_approved', 'approved_by', 'approved_at',
            'stripe_subscription_id'
        )
        read_only_fields = ('id', 'user', 'is_approved', 'approved_by', 'approved_at', 'stripe_subscription_id')
        extra_kwargs = {
            'start_date': {'required': False},
            'end_date': {'required': False},
        }
