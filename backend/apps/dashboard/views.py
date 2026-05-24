from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Count, F, ExpressionWrapper, DecimalField, Min, Max
from workouts.models import WorkoutLog
from progress.models import ProgressLog
from common.permissions import check_feature
from django.utils import timezone
from datetime import timedelta

class DashboardStatsView(APIView):
    """
    Dashboard statistics endpoint.
    Aggregates training volume, workout logs count, and weight progress chart data.
    Requires dashboard_access subscription feature.
    """
    permission_classes = [IsAuthenticated, check_feature('dashboard_access')]

    def get(self, request):
        user = request.user

        try:
            workout_logs = WorkoutLog.objects.filter(user=user)
            progress_logs = ProgressLog.objects.filter(user=user)

            total_workouts = workout_logs.values('workout').distinct().count()
            total_sets = workout_logs.aggregate(total=Sum('sets'))['total'] or 0

            total_volume_result = workout_logs.annotate(
                volume=ExpressionWrapper(F('sets') * F('weight'), output_field=DecimalField())
            ).aggregate(total_volume=Sum('volume'))
            total_volume = float(total_volume_result['total_volume'] or 0)

            active_days = workout_logs.values('date').distinct().count()

            streak_data = self._calculate_streak(workout_logs)
            current_streak = streak_data['current_streak']
            best_streak = streak_data['best_streak']

            progress_bounds = progress_logs.aggregate(
                first_date=Min('date'),
                last_date=Max('date'),
                first_weight=Min('weight'),
                last_weight=Max('weight')  
            )

            current_weight = float(progress_bounds['last_weight']) if progress_bounds['last_weight'] is not None else None
            starting_weight = float(progress_bounds['first_weight']) if progress_bounds['first_weight'] is not None else None

            if current_weight is not None and starting_weight is not None:
                weight_change = round(current_weight - starting_weight, 2)
            else:
                weight_change = None

            thirty_days_ago = timezone.now().date() - timedelta(days=30)

            workout_history = (
                workout_logs.filter(date__gte=thirty_days_ago)
                .values('date')
                .annotate(count=Count('id', distinct=True))
                .order_by('date')
            )

            workout_chart = [
                {"date": item['date'].strftime('%Y-%m-%d'), "count": item['count']}
                for item in workout_history
            ]

            weight_history = progress_logs.filter(date__gte=thirty_days_ago).order_by('date')
            weight_chart = [
                {
                    "date": log.date.strftime('%Y-%m-%d'),
                    "weight": float(log.weight),
                    "body_fat": float(log.body_fat) if log.body_fat is not None else None
                }
                for log in weight_history
            ]

            return Response({
                "success": True,
                "data": {
                    "summary": {
                        "total_workouts": total_workouts,
                        "total_sets": total_sets,
                        "total_volume_kg": round(total_volume, 2),
                        "active_days": active_days,
                        "current_streak": current_streak,
                        "best_streak": best_streak,
                        "current_weight_kg": current_weight,
                        "starting_weight_kg": starting_weight,
                        "weight_change_kg": weight_change,
                    },
                    "charts": {
                        "workout_activity": workout_chart,
                        "weight_progress": weight_chart
                    }
                },
                "message": "Dashboard analytics retrieved successfully.",
                "errors": None
            })

        except Exception as e:
            return Response({
                "success": False,
                "data": None,
                "message": "Failed to load dashboard statistics.",
                "errors": {"detail": str(e)}
            }, status=500)

    def _calculate_streak(self, workout_logs):
        dates = list(workout_logs.values_list('date', flat=True).distinct().order_by('date'))
        if not dates:
            return {"current_streak": 0, "best_streak": 0}

        today = timezone.now().date()
        best_streak = 1
        current_streak = 0

        sorted_dates = sorted(set(dates))
        temp_streak = 1
        for i in range(1, len(sorted_dates)):
            diff = (sorted_dates[i] - sorted_dates[i - 1]).days
            if diff == 1:
                temp_streak += 1
                best_streak = max(best_streak, temp_streak)
            else:
                temp_streak = 1

        for d in reversed(sorted_dates):
            if d == today or d == today - timedelta(days=(today - d).days):
                current_streak += 1
            else:
                break

        if current_streak == 0 and sorted_dates and sorted_dates[-1] >= today - timedelta(days=1):
            current_streak = 1

        best_streak = max(best_streak, current_streak)
        return {"current_streak": current_streak, "best_streak": best_streak}