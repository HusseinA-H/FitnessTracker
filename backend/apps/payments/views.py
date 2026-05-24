from rest_framework import viewsets, status, serializers
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from payments.models import Payment
from payments.serializers import PaymentSerializer
from common.choices import UserRole, PaymentStatus, SubscriptionStatus
from common.permissions import IsAdminRole
from common.models import log_audit_event

class PaymentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Payments.
    Regular users can submit payments and view their own transactions history.
    Admins can view all payments and manually approve them.
    """
    serializer_class = PaymentSerializer

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminRole()]
        if self.action == 'approve':
            return [IsAuthenticated(), IsAdminRole()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == UserRole.ADMIN:
            return Payment.objects.all().select_related('user', 'subscription')
        return Payment.objects.filter(user=user).select_related('user', 'subscription')

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
            payment_status=PaymentStatus.PENDING
        )

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsAdminRole])
    def approve(self, request, pk=None):
        """
        Admin-only endpoint to manually approve and mark a payment transaction as successful.
        Also activates the related subscription if one is linked.
        """
        payment = self.get_object()
        
        if payment.payment_status == PaymentStatus.SUCCESS:
            return Response({
                "success": False,
                "data": None,
                "message": "Payment has already been approved and marked successful.",
                "errors": {"detail": "Payment is already successful."}
            }, status=status.HTTP_400_BAD_REQUEST)

        payment.payment_status = PaymentStatus.SUCCESS
        payment.save()

        subscription_activated = False
        subscription = getattr(payment, 'subscription', None)
        if subscription and not subscription.is_approved:
            subscription.is_approved = True
            subscription.approved_by = request.user
            subscription.approved_at = payment.created_at
            subscription.status = SubscriptionStatus.ACTIVE
            if not subscription.start_date:
                subscription.start_date = payment.created_at
            subscription.save()

            user = payment.user
            from subscriptions.models import Subscription
            previous_sub = user.current_subscription
            if previous_sub and previous_sub.pk != subscription.pk and previous_sub.is_currently_active:
                previous_sub.status = SubscriptionStatus.EXPIRED
                previous_sub.save()
            user.current_subscription = subscription
            user.save()
            subscription_activated = True

        log_audit_event(
            actor=request.user,
            action="PAYMENT_APPROVAL",
            request=request,
            status="SUCCESS",
            details={
                "payment_id": str(payment.id),
                "amount": str(payment.amount),
                "currency": payment.currency,
                "payer_username": payment.user.username,
                "subscription_activated": subscription_activated
            }
        )

        return Response({
            "success": True,
            "data": PaymentSerializer(payment).data,
            "message": "Payment approved successfully." + (" Subscription activated." if subscription_activated else ""),
            "errors": None
        })
