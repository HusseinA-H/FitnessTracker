from rest_framework.permissions import BasePermission
from common.choices import UserRole

class IsAdminRole(BasePermission):
    """
    Grants access only to users with the ADMIN role.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == UserRole.ADMIN)

class IsCoachRole(BasePermission):
    """
    Grants access only to users with the COACH role.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == UserRole.COACH)

class IsUserRole(BasePermission):
    """
    Grants access only to users with the USER role.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == UserRole.USER)

class HasFeatureAccess(BasePermission):
    """
    Permission class that checks the view's 'required_feature' attribute against
    the user's current subscription features.
    """
    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        if user.role == UserRole.ADMIN:
            return True

        sub = getattr(user, 'current_subscription', None)
        if sub is None:
            try:
                user = user.__class__.objects.select_related('current_subscription', 'current_subscription__plan').get(pk=user.pk)
                sub = user.current_subscription
            except user.__class__.DoesNotExist:
                return False

        if not sub or not sub.is_currently_active:
            return False

        required_feature = getattr(view, 'required_feature', None)
        if not required_feature:
            return True

        plan = getattr(sub, 'plan', None)
        if plan is None:
            sub = Subscription.objects.select_related('plan').get(pk=sub.pk)
            plan = sub.plan

        features = plan.features or {}

        # 1. Direct boolean flags
        if features.get(required_feature) is True:
            return True

        # 2. Limit thresholds
        limit = features.get(required_feature)
        if isinstance(limit, int) and limit > 0:
            return True

        # 3. Custom feature_flags sub-dictionary
        feature_flags = features.get("feature_flags", {})
        if isinstance(feature_flags, dict) and feature_flags.get(required_feature) is True:
            return True

        return False

def check_feature(feature_name):
    """
    Helper function to dynamically generate a feature-gate permission class.
    Usage: permission_classes = [check_feature('dashboard_access')]
    """
    class DynamicFeaturePermission(HasFeatureAccess):
        def has_permission(self, request, view):
            # Temporarily set required_feature on view
            old_feature = getattr(view, 'required_feature', None)
            view.required_feature = feature_name
            result = super().has_permission(request, view)
            view.required_feature = old_feature
            return result
    return DynamicFeaturePermission
