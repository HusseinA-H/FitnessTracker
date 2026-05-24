from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from subscriptions.models import SubscriptionPlan, Subscription
from subscriptions.serializers import SubscriptionPlanSerializer, SubscriptionSerializer
from common.permissions import IsAdminRole
from common.choices import SubscriptionStatus, UserRole
from notifications.models import Notification
from common.choices import NotificationType
from common.models import log_audit_event

class SubscriptionPlanViewSet(viewsets.ModelViewSet):
    """
    ViewSet for SubscriptionPlans.
    Anyone can view plans; only admins can create, modify, or delete plans.
    """
    queryset = SubscriptionPlan.objects.all()
    serializer_class = SubscriptionPlanSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminRole()]
        return [AllowAny()]


class SubscriptionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Subscriptions.
    Users can view and create subscriptions (pending approval).
    List is scoped to the requesting user; admins see all.
    PUT/PATCH/DELETE restricted to admin only.
    Admins can manually approve subscriptions using /approve/.
    """
    serializer_class = SubscriptionSerializer

    def get_permissions(self):
        if self.action in ['approve', 'cancel', 'manual_activate']:
            return [IsAuthenticated(), IsAdminRole()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminRole()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == UserRole.ADMIN:
            return Subscription.objects.all().select_related('plan', 'user', 'user__current_subscription')
        return Subscription.objects.filter(user=user).select_related('plan', 'user', 'user__current_subscription')

    def perform_create(self, serializer):
        existing_pending = Subscription.objects.filter(
            user=self.request.user,
            status=SubscriptionStatus.PENDING_APPROVAL
        ).first()
        if existing_pending:
            raise serializers.ValidationError({
                "detail": "You already have a pending subscription request. Please wait for admin approval."
            })

        plan = serializer.validated_data.get('plan')
        start_date = serializer.validated_data.get('start_date') or timezone.now()
        end_date = start_date + timezone.timedelta(days=plan.duration_days)
        
        serializer.save(
            user=self.request.user,
            start_date=start_date,
            end_date=end_date,
            status=SubscriptionStatus.PENDING_APPROVAL,
            is_approved=False
        )

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """
        Admin-only endpoint to manually approve a subscription.
        Sets is_approved to True, marks status as ACTIVE, updates user.current_subscription,
        deactivates any previous active subscription, and fires a notification.
        """
        subscription = self.get_object()
        
        if subscription.is_approved:
            return Response({
                "success": False,
                "data": None,
                "message": "This subscription is already approved.",
                "errors": {"detail": "Subscription is already approved."}
            }, status=status.HTTP_400_BAD_REQUEST)

        subscription.is_approved = True
        subscription.approved_by = request.user
        subscription.approved_at = timezone.now()
        subscription.status = SubscriptionStatus.ACTIVE
        subscription.save()

        user = subscription.user

        previous_sub = user.current_subscription
        if previous_sub and previous_sub.pk != subscription.pk and previous_sub.is_currently_active:
            previous_sub.status = SubscriptionStatus.EXPIRED
            previous_sub.save()

        user.current_subscription = subscription
        user.save()

        Notification.objects.create(
            user=user,
            title="Subscription Approved!",
            message=f"Your request for the '{subscription.plan.name}' membership tier has been manually approved and is now active.",
            notification_type=NotificationType.SUBSCRIPTION
        )

        log_audit_event(
            actor=request.user,
            action="SUBSCRIPTION_MANUAL_APPROVAL",
            request=request,
            status="SUCCESS",
            details={
                "subscription_id": str(subscription.id),
                "plan_name": subscription.plan.name,
                "subscriber_username": user.username
            }
        )

        return Response({
            "success": True,
            "data": SubscriptionSerializer(subscription).data,
            "message": "Subscription approved and activated successfully.",
            "errors": None
        })

    @action(detail=False, methods=['get'], url_path='status')
    def status(self, request):
        """
        Returns the current user's active subscription status.
        """
        user = request.user
        active_sub = Subscription.objects.filter(
            user=user, status=SubscriptionStatus.ACTIVE, is_approved=True,
            start_date__lte=timezone.now(), end_date__gte=timezone.now()
        ).select_related('plan').first()

        if not active_sub:
            current_sub = getattr(user, 'current_subscription', None)
            if current_sub:
                plan_data = SubscriptionPlanSerializer(current_sub.plan).data
                return Response({
                    "success": True,
                    "data": {
                        "is_active": False,
                        "status": current_sub.status,
                        "plan": plan_data,
                        "end_date": current_sub.end_date,
                        "is_approved": current_sub.is_approved,
                    },
                    "message": "No active subscription.",
                    "errors": None
                })
            return Response({
                "success": True,
                "data": {
                    "is_active": False,
                    "status": None,
                    "plan": None,
                    "end_date": None,
                    "is_approved": False,
                },
                "message": "No subscription found.",
                "errors": None
            })

        plan_data = SubscriptionPlanSerializer(active_sub.plan).data
        return Response({
            "success": True,
            "data": {
                "is_active": True,
                "status": active_sub.status,
                "plan": plan_data,
                "start_date": active_sub.start_date,
                "end_date": active_sub.end_date,
                "is_approved": active_sub.is_approved,
                "features": plan_data.get('features', {}),
            },
            "message": "Active subscription found.",
            "errors": None
        })

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Admin-only endpoint to cancel a subscription.
        Sets status to CANCELLED. If it was active, sets user.current_subscription to None.
        """
        subscription = self.get_object()
        if subscription.status == SubscriptionStatus.CANCELLED:
            return Response({
                "success": False,
                "data": None,
                "message": "Subscription is already cancelled.",
                "errors": {"detail": "Already cancelled."}
            }, status=status.HTTP_400_BAD_REQUEST)

        was_active = subscription.is_currently_active
        subscription.status = SubscriptionStatus.CANCELLED
        subscription.save()

        user = subscription.user
        if was_active and user.current_subscription == subscription:
            user.current_subscription = None
            user.save()

        Notification.objects.create(
            user=user,
            title="Subscription Cancelled",
            message=f"Your '{subscription.plan.name}' subscription has been cancelled by an administrator.",
            notification_type=NotificationType.SUBSCRIPTION
        )

        log_audit_event(
            actor=request.user,
            action="SUBSCRIPTION_CANCEL",
            request=request,
            status="SUCCESS",
            details={
                "subscription_id": str(subscription.id),
                "subscriber_username": user.username,
                "plan_name": subscription.plan.name
            }
        )

        return Response({
            "success": True,
            "data": SubscriptionSerializer(subscription).data,
            "message": "Subscription cancelled successfully.",
            "errors": None
        })

    @action(detail=False, methods=['post'], url_path='manual-activate')
    def manual_activate(self, request):
        """
        Admin-only endpoint to create and immediately activate a subscription for a user.
        Payload: { "user_id": "...", "plan_id": "...", "duration_days": 30 }
        """
        user_id = request.data.get('user_id')
        plan_id = request.data.get('plan_id')
        duration_days = request.data.get('duration_days')

        if not user_id or not plan_id:
            return Response({
                "success": False,
                "data": None,
                "message": "user_id and plan_id are required.",
                "errors": {"detail": "Missing arguments."}
            }, status=status.HTTP_400_BAD_REQUEST)

        from django.contrib.auth import get_user_model
        UserClass = get_user_model()
        try:
            target_user = UserClass.objects.get(pk=user_id)
        except UserClass.DoesNotExist:
            return Response({
                "success": False,
                "data": None,
                "message": "User not found.",
                "errors": {"detail": "User not found."}
            }, status=status.HTTP_404_NOT_FOUND)

        try:
            plan = SubscriptionPlan.objects.get(pk=plan_id)
        except SubscriptionPlan.DoesNotExist:
            return Response({
                "success": False,
                "data": None,
                "message": "Plan not found.",
                "errors": {"detail": "Plan not found."}
            }, status=status.HTTP_404_NOT_FOUND)

        days = int(duration_days) if duration_days else plan.duration_days
        start_date = timezone.now()
        end_date = start_date + timezone.timedelta(days=days)

        subscription = Subscription.objects.create(
            user=target_user,
            plan=plan,
            start_date=start_date,
            end_date=end_date,
            status=SubscriptionStatus.ACTIVE,
            is_approved=True,
            approved_by=request.user,
            approved_at=timezone.now()
        )

        previous_sub = target_user.current_subscription
        if previous_sub and previous_sub.is_currently_active:
            previous_sub.status = SubscriptionStatus.EXPIRED
            previous_sub.save()

        target_user.current_subscription = subscription
        target_user.save()

        Notification.objects.create(
            user=target_user,
            title="Subscription Activated!",
            message=f"An administrator has manually activated your '{plan.name}' membership tier.",
            notification_type=NotificationType.SUBSCRIPTION
        )

        log_audit_event(
            actor=request.user,
            action="SUBSCRIPTION_MANUAL_ACTIVATION",
            request=request,
            status="SUCCESS",
            details={
                "subscription_id": str(subscription.id),
                "subscriber_username": target_user.username,
                "plan_name": plan.name
            }
        )

        return Response({
            "success": True,
            "data": SubscriptionSerializer(subscription).data,
            "message": "Subscription manually activated successfully.",
            "errors": None
        })
