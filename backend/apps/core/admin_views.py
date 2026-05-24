from rest_framework.views import APIView
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db import models
from django.contrib.auth import get_user_model

from common.permissions import IsAdminRole
from core.models import Announcement, ContentSettings, NutritionTemplate
from core.admin_serializers import AnnouncementSerializer, ContentSettingsSerializer, NutritionTemplateSerializer
from subscriptions.models import Subscription
from payments.models import Payment
from workouts.models import WorkoutLog
from ai.models import AIUsage

User = get_user_model()

class AdminDashboardAnalyticsView(APIView):
    """
    Admin-only endpoint providing global statistics, analytics aggregates,
    registration charts, and recent activity timelines.
    """
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request, *args, **kwargs):
        # 1. Base counts
        total_users = User.objects.count()
        active_subscriptions = Subscription.objects.filter(
            status='ACTIVE',
            is_approved=True,
            end_date__gte=timezone.now()
        ).count()
        pending_subscriptions = Subscription.objects.filter(
            status='PENDING_APPROVAL'
        ).count()

        # 2. AI Usages aggregates
        ai_totals = AIUsage.objects.aggregate(
            total_tokens=models.Sum('total_tokens'),
            total_cost=models.Sum('estimated_cost'),
            total_requests=models.Count('id')
        )
        total_tokens = ai_totals.get('total_tokens') or 0
        total_cost = ai_totals.get('total_cost') or 0
        total_ai_requests = ai_totals.get('total_requests') or 0

        # 3. Workouts aggregates
        total_workouts = WorkoutLog.objects.count()

        # 4. Growth Analytics: User registrations in the last 30 days
        thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
        daily_registrations = (
            User.objects.filter(created_at__gte=thirty_days_ago)
            .extra(select={'day': "date(created_at)"})
            .values('day')
            .annotate(count=models.Count('id'))
            .order_by('day')
        )
        growth_data = [
            {"date": str(x['day']), "count": x['count']} 
            for x in daily_registrations
        ]

        # 5. Recent Activity lists
        recent_users = User.objects.all().order_by('-created_at')[:5]
        recent_payments = Payment.objects.all().select_related('user').order_by('-created_at')[:5]
        recent_workouts = WorkoutLog.objects.all().select_related('user').order_by('-created_at')[:5]

        activities = []
        for u in recent_users:
            activities.append({
                "type": "USER_REGISTER",
                "message": f"User '{u.username}' registered",
                "time": u.created_at,
                "user": u.username
            })
        for p in recent_payments:
            activities.append({
                "type": "PAYMENT_SUBMIT",
                "message": f"Payment of {p.amount} {p.currency} submitted (Status: {p.payment_status})",
                "time": p.created_at,
                "user": p.user.username
            })
        for w in recent_workouts:
            activities.append({
                "type": "WORKOUT_LOG",
                "message": f"Logged '{w.exercise_details.name if w.exercise_details else w.exercise}' ({w.sets} sets)",
                "time": w.created_at,
                "user": w.user.username
            })

        # Sort activities desc by time
        activities = sorted(activities, key=lambda x: x['time'], reverse=True)[:10]

        # Format stats response
        return Response({
            "success": True,
            "data": {
                "stats": {
                    "total_users": total_users,
                    "active_subscriptions": active_subscriptions,
                    "pending_subscriptions": pending_subscriptions,
                    "total_tokens": total_tokens,
                    "total_cost": float(total_cost),
                    "total_ai_requests": total_ai_requests,
                    "total_workouts": total_workouts,
                },
                "growth_analytics": growth_data,
                "recent_activity": activities
            },
            "message": "Analytics retrieved successfully.",
            "errors": None
        })


class AnnouncementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for portal Announcements.
    List/Retrieve are open to authenticated users.
    Create/Update/Delete are restricted to admins.
    """
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminRole()]
        return [IsAuthenticated()]


class ContentSettingsView(APIView):
    """
    View to retrieve or update homepage content settings (key-value config map).
    Get is open to public; Post/Put are restricted to AdminRole.
    """
    def get_permissions(self):
        if self.request.method in ['POST', 'PUT', 'PATCH']:
            return [IsAuthenticated(), IsAdminRole()]
        return []

    def get(self, request, *args, **kwargs):
        settings_objs = ContentSettings.objects.all()
        config_map = {obj.key: obj.value for obj in settings_objs}
        return Response({
            "success": True,
            "data": config_map,
            "message": "Settings retrieved.",
            "errors": None
        })

    def post(self, request, *args, **kwargs):
        for key, val in request.data.items():
            ContentSettings.objects.update_or_create(
                key=key,
                defaults={"value": str(val)}
            )
        settings_objs = ContentSettings.objects.all()
        config_map = {obj.key: obj.value for obj in settings_objs}
        return Response({
            "success": True,
            "data": config_map,
            "message": "Settings updated successfully.",
            "errors": None
        })


class NutritionTemplateViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Nutrition Templates.
    List/Retrieve are open to authenticated users.
    Create/Update/Delete are restricted to admins.
    """
    queryset = NutritionTemplate.objects.all()
    serializer_class = NutritionTemplateSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminRole()]
        return [IsAuthenticated()]
