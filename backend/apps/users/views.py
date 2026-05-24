from rest_framework import generics, status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.exceptions import ValidationError, AuthenticationFailed
from django.db.models import Q
from users.models import User, Profile
from users.serializers import RegisterSerializer, ProfileSerializer, UserSerializer, AdminUserSerializer
from common.models import log_audit_event
from common.permissions import IsAdminRole

class RegisterView(generics.CreateAPIView):
    """
    Public endpoint for registering a new user. Automatically generates a Profile via signal.
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Serialize user detail for response
        user_serializer = UserSerializer(user)
        return Response({
            "success": True,
            "data": user_serializer.data,
            "message": "User registered successfully.",
            "errors": None
        }, status=status.HTTP_201_CREATED)


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    Authenticated endpoint to view or update personal height, weight, and goals.
    """
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        try:
            profile = Profile.objects.get(user=self.request.user)
        except Profile.DoesNotExist:
            profile, _ = Profile.objects.get_or_create(user=self.request.user)
        except Exception:
            profile = Profile.all_objects.filter(user=self.request.user).first()
            if profile and profile.is_deleted:
                profile.is_deleted = False
                profile.deleted_at = None
                profile.save(update_fields=['is_deleted', 'deleted_at'])
            elif not profile:
                profile = Profile.objects.create(user=self.request.user)
        return profile


class AuditTokenObtainPairView(TokenObtainPairView):
    """
    Subclass of SimpleJWT TokenObtainPairView to write logging of
    authentication login success and failures to the database audit trail.
    """
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        try:
            response = super().post(request, *args, **kwargs)
            if response.status_code == 200:
                user = User.objects.filter(username=username).first()
                log_audit_event(
                    actor=user,
                    action="AUTHENTICATION_LOGIN_SUCCESS",
                    request=request,
                    status="SUCCESS",
                    details={"username": username}
                )
            return response
        except (ValidationError, AuthenticationFailed) as e:
            log_audit_event(
                actor=None,
                action="AUTHENTICATION_LOGIN_FAILURE",
                request=request,
                status="FAILED",
                details={"username_attempted": username, "error": str(e)}
            )
            raise


class AdminUserViewSet(viewsets.ModelViewSet):
    """
    Admin-only ViewSet for full User management capabilities:
    list, retrieve, update, destroy, toggle active status, change roles.
    """
    queryset = User.objects.all().select_related('profile', 'current_subscription', 'current_subscription__plan').order_by('-date_joined')
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search) | 
                Q(email__icontains=search)
            )

        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)

        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            active_val = is_active.lower() in ['true', '1']
            queryset = queryset.filter(is_active=active_val)

        return queryset

    @action(detail=True, methods=['post'], url_path='toggle-active')
    def toggle_active(self, request, pk=None):
        user = self.get_object()
        if user == request.user:
            return Response({
                "success": False,
                "data": None,
                "message": "You cannot deactivate your own account.",
                "errors": {"detail": "Self-deactivation is forbidden."}
            }, status=status.HTTP_400_BAD_REQUEST)

        user.is_active = not user.is_active
        user.save()

        log_audit_event(
            actor=request.user,
            action="USER_TOGGLE_ACTIVE",
            request=request,
            status="SUCCESS",
            details={"target_username": user.username, "new_active_status": user.is_active}
        )

        return Response({
            "success": True,
            "data": AdminUserSerializer(user).data,
            "message": f"User status changed successfully. Active: {user.is_active}",
            "errors": None
        })

    @action(detail=True, methods=['post'], url_path='change-role')
    def change_role(self, request, pk=None):
        user = self.get_object()
        new_role = request.data.get('role')
        from common.choices import UserRole
        if new_role not in UserRole.values:
            return Response({
                "success": False,
                "data": None,
                "message": "Invalid role specified.",
                "errors": {"role": "Must be one of " + ", ".join(UserRole.values)}
            }, status=status.HTTP_400_BAD_REQUEST)

        if user == request.user and new_role != UserRole.ADMIN:
            return Response({
                "success": False,
                "data": None,
                "message": "You cannot change your own admin role.",
                "errors": {"detail": "Self-demotion is forbidden."}
            }, status=status.HTTP_400_BAD_REQUEST)

        user.role = new_role
        user.save()

        log_audit_event(
            actor=request.user,
            action="USER_CHANGE_ROLE",
            request=request,
            status="SUCCESS",
            details={"target_username": user.username, "new_role": user.role}
        )

        return Response({
            "success": True,
            "data": AdminUserSerializer(user).data,
            "message": f"User role successfully updated to {user.role}.",
            "errors": None
        })
