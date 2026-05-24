from rest_framework import viewsets, status, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from common.choices import UserRole
from workouts.models import Exercise, Workout, WorkoutLog
from workouts.serializers import ExerciseSerializer, WorkoutSerializer, WorkoutLogSerializer
from common.permissions import IsAdminRole, IsCoachRole

class ExerciseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and managing Exercises.
    Authenticated users can view; only Admin or Coach can create, update, or delete.
    """
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Only admin or coach can modify exercise catalog
            return [IsAuthenticated(), (IsAdminRole | IsCoachRole)()]
        return [IsAuthenticated()]


class WorkoutViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Workouts.
    Supports user isolation: regular users only see their own logged sessions and public blueprints.
    Only admin or coach can create/modify public blueprints.
    """
    serializer_class = WorkoutSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Admins and coaches can see all non-deleted workouts
        if user.role in [UserRole.ADMIN, UserRole.COACH]:
            return Workout.objects.all()
        # Normal users see their own workouts plus any pre-built blueprints
        return Workout.objects.filter(Q(user=user) | Q(is_blueprint=True))

    def perform_create(self, serializer):
        # Enforce that normal users cannot create public blueprints
        is_blueprint = serializer.validated_data.get('is_blueprint', False)
        if is_blueprint and self.request.user.role not in [UserRole.ADMIN, UserRole.COACH]:
            raise serializers.ValidationError({"is_blueprint": "Only admins and coaches can create public blueprints."})
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        instance = self.get_object()
        # Non-owners cannot modify personal workouts
        if not instance.is_blueprint and instance.user != self.request.user and self.request.user.role != UserRole.ADMIN:
            self.permission_denied(self.request)
        
        # Regular users cannot modify blueprints
        if instance.is_blueprint and self.request.user.role not in [UserRole.ADMIN, UserRole.COACH]:
            raise serializers.ValidationError("Only admins and coaches can modify public blueprints.")
            
        serializer.save()

    def perform_destroy(self, instance):
        # Non-owners cannot delete personal workouts
        if not instance.is_blueprint and instance.user != self.request.user and self.request.user.role != UserRole.ADMIN:
            self.permission_denied(self.request)
            
        # Regular users cannot delete blueprints
        if instance.is_blueprint and self.request.user.role not in [UserRole.ADMIN, UserRole.COACH]:
            raise serializers.ValidationError("Only admins and coaches can delete public blueprints.")
            
        instance.delete()


class WorkoutLogViewSet(viewsets.ModelViewSet):
    """
    ViewSet for WorkoutLogs.
    Enforces strict queryset isolation (users see only their own logs).
    Prevents modifying/deleting locked workout logs.
    """
    serializer_class = WorkoutLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Select related to optimize DB queries
        return WorkoutLog.objects.filter(user=self.request.user).select_related('exercise', 'workout')

    def perform_create(self, serializer):
        # Ensure workout and exercise belong to/are accessible to user
        workout = serializer.validated_data.get('workout')
        if workout and workout.user != self.request.user and not workout.is_blueprint:
            raise serializers.ValidationError({"workout": "Selected workout routine is not accessible."})
        serializer.save(user=self.request.user)

    def perform_destroy(self, instance):
        if instance.is_locked:
            raise serializers.ValidationError("This workout log is locked and cannot be deleted.")
        instance.delete()
