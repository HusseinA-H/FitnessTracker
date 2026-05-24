import logging
import time
from rest_framework import viewsets, status, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import models, transaction
from django.utils import timezone
from ai.models import AIConversation, AIMessage, AIUsage
from ai.serializers import AIConversationListSerializer, AIConversationDetailSerializer, AIMessageSerializer, AdminAIUsageSerializer
from ai.groq_client import chat_completion, insights_completion
from ai.utils import sanitize_and_validate_prompt
from common.throttles import AIChatThrottle
from common.permissions import check_feature, IsAdminRole
from common.choices import UserRole, MessageRole, AIModelName, AIProvider, AIRequestType
from common.models import log_audit_event

logger = logging.getLogger('django')

MAX_CONTEXT_MESSAGES = 20
INSIGHTS_MONTHLY_LIMIT = 10


def _check_ai_quota(user, request_type=AIRequestType.CHAT):
    if user.role == UserRole.ADMIN:
        return True, None
    now = timezone.now()
    monthly_usage = AIUsage.objects.filter(
        user=user,
        date__year=now.year,
        date__month=now.month,
    ).count()

    user_ref = user.__class__.objects.select_related(
        'current_subscription', 'current_subscription__plan'
    ).get(pk=user.pk) if not getattr(user, 'current_subscription', None) else user
    sub = getattr(user_ref, 'current_subscription', None)

    if not sub or not sub.is_currently_active:
        return False, serializers.ValidationError({
            "detail": "An active subscription is required to use AI features."
        })

    features = sub.plan.features or {}
    ai_limit = features.get('ai_limit', 0)
    if isinstance(ai_limit, int) and ai_limit > 0 and monthly_usage >= ai_limit:
        return False, serializers.ValidationError({
            "detail": f"Monthly AI limit reached ({monthly_usage}/{ai_limit}). Upgrade your plan to continue."
        })
    return True, None


class AIConversationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, check_feature('ai_limit')]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AIConversationDetailSerializer
        return AIConversationListSerializer

    def get_queryset(self):
        return AIConversation.objects.filter(
            user=self.request.user
        ).prefetch_related('messages').order_by('-updated_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['get'], url_path='messages')
    def conversation_messages(self, request, pk=None):
        conversation = self.get_object()
        messages = conversation.messages.all().order_by('created_at')
        serializer = AIMessageSerializer(messages, many=True)
        return Response({
            "success": True,
            "data": serializer.data,
            "message": "Messages retrieved.",
            "errors": None
        })


class AIMessageViewSet(viewsets.ModelViewSet):
    serializer_class = AIMessageSerializer
    permission_classes = [IsAuthenticated, check_feature('ai_limit')]
    throttle_classes = [AIChatThrottle]

    def get_queryset(self):
        return AIMessage.objects.filter(
            conversation__user=self.request.user
        ).order_by('created_at')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        conversation = serializer.validated_data['conversation']

        if conversation.user != request.user:
            return Response({
                "success": False,
                "data": None,
                "message": "Conversation not found.",
                "errors": {"detail": "Conversation not found."}
            }, status=status.HTTP_404_NOT_FOUND)

        user = request.user

        quota_ok, quota_error = _check_ai_quota(user)
        if not quota_ok:
            raise quota_error

        content = serializer.validated_data.get('content', '')
        try:
            content = sanitize_and_validate_prompt(content)
        except serializers.ValidationError as e:
            log_audit_event(
                actor=user,
                action="SUSPICIOUS_AI_PROMPT_BLOCKED",
                request=request,
                status="FAILED",
                details={
                    "conversation_id": str(conversation.id),
                    "prompt_preview": content[:100],
                    "error": str(e.detail) if hasattr(e, 'detail') else str(e)
                }
            )
            raise

        with transaction.atomic():
            user_message = AIMessage.objects.create(
                conversation=conversation,
                role=MessageRole.USER,
                content=content,
                token_count=0,
                model_name=AIModelName.GROQ_LLAMA_3_3_70B
            )

            context_messages = AIMessage.objects.filter(
                conversation=conversation
            ).order_by('-created_at')[:MAX_CONTEXT_MESSAGES]

            groq_messages = []
            for msg in reversed(list(context_messages)):
                role = "assistant" if msg.role == MessageRole.ASSISTANT else "user"
                groq_messages.append({"role": role, "content": msg.content})

        try:
            result = chat_completion(
                messages=groq_messages,
                user=str(user.id)
            )
            ai_content = result["content"]
            prompt_tokens = result["prompt_tokens"]
            completion_tokens = result["completion_tokens"]
            total_tokens = result["total_tokens"]
            response_time = result["response_time"]
            model_name = result["model"]
            provider = result["provider"]

        except ValueError as e:
            logger.error(f"Groq configuration error: {e}")
            ai_content = "I'm temporarily unavailable. Please try again in a moment."
            prompt_tokens = 0
            completion_tokens = 0
            total_tokens = 0
            response_time = 0.0
            model_name = AIModelName.GROQ_LLAMA_3_3_70B
            provider = "GROQ"

        except Exception as e:
            logger.error(f"Groq API error: {e}")
            ai_content = "I'm having trouble connecting right now. Please try again shortly."
            prompt_tokens = 0
            completion_tokens = 0
            total_tokens = 0
            response_time = 0.0
            model_name = AIModelName.GROQ_LLAMA_3_3_70B
            provider = "GROQ"

        user_message.token_count = prompt_tokens
        user_message.save(update_fields=['token_count'])

        ai_message = AIMessage.objects.create(
            conversation=conversation,
            role=MessageRole.ASSISTANT,
            content=ai_content,
            token_count=completion_tokens,
            model_name=model_name
        )

        AIUsage.objects.create(
            user=user,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens,
            request_type=AIRequestType.CHAT,
            model_name=model_name,
            provider_name=provider,
            estimated_cost=round(
                (prompt_tokens * 0.00000059) + (completion_tokens * 0.00000079), 6
            ),
            response_time=response_time
        )

        conversation.updated_at = timezone.now()
        conversation.save(update_fields=['updated_at'])

        return Response({
            "success": True,
            "data": {
                "user_message": AIMessageSerializer(user_message).data,
                "assistant_message": AIMessageSerializer(ai_message).data,
            },
            "message": "AI assistant response generated.",
            "errors": None
        }, status=status.HTTP_201_CREATED)


class AIInsightsView(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, check_feature('ai_limit')]

    @action(detail=False, methods=['get'], url_path='performance')
    def performance(self, request):
        user = request.user

        quota_ok, quota_error = _check_ai_quota(user, request_type=AIRequestType.INSIGHTS)
        if not quota_ok and quota_error:
            raise quota_error

        if user.role != UserRole.ADMIN:
            now = timezone.now()
            insight_usage = AIUsage.objects.filter(
                user=user,
                date__year=now.year,
                date__month=now.month,
                request_type=AIRequestType.INSIGHTS
            ).count()

            sub = getattr(user, 'current_subscription', None)
            if sub is None:
                try:
                    user = user.__class__.objects.select_related(
                        'current_subscription', 'current_subscription__plan'
                    ).get(pk=user.pk)
                    sub = user.current_subscription
                except user.__class__.DoesNotExist:
                    pass

            if sub and sub.is_currently_active:
                features = sub.plan.features or {}
                ai_limit = features.get('ai_limit', 0)
                if isinstance(ai_limit, int) and ai_limit > 0 and insight_usage >= INSIGHTS_MONTHLY_LIMIT:
                    return Response({
                        "success": False,
                        "data": None,
                        "message": "Monthly insight limit reached.",
                        "errors": {"detail": f"Monthly insight generation limit reached ({insight_usage}/{INSIGHTS_MONTHLY_LIMIT})."}
                    }, status=status.HTTP_429_TOO_MANY_REQUESTS)

        from workouts.models import WorkoutLog
        from progress.models import ProgressLog
        from django.db.models import Count, Sum, Min, Max

        workout_logs = WorkoutLog.objects.filter(user=user)
        progress_logs = ProgressLog.objects.filter(user=user)

        total_workouts = workout_logs.values('workout').distinct().count()
        active_days = workout_logs.values('date').distinct().count()

        latest_progress = progress_logs.order_by('-date').first()
        weight_info = ""
        if latest_progress and latest_progress.weight:
            weight_info = f"Current weight: {latest_progress.weight}kg."

        recent_exercises_qs = workout_logs.values('exercise')[:5]
        exercise_names = ", ".join(
            str(e['exercise']) for e in recent_exercises_qs
        ) if recent_exercises_qs else "none yet"

        context_text = (
            f"User stats: {total_workouts} total workouts, {active_days} active days. "
            f"{weight_info} "
            f"Recent exercises: {exercise_names}. "
            f"Provide a brief, motivating performance insight in 2-3 sentences."
        )

        try:
            result = insights_completion(context_text=context_text)
            insight_text = result["insight"]
            prompt_tokens = result["prompt_tokens"]
            completion_tokens = result["completion_tokens"]
            total_tokens = result["total_tokens"]
            model_name = result["model"]
            response_time = result["response_time"]
        except Exception as e:
            logger.error(f"Groq insights API error: {e}")
            if total_workouts == 0:
                insight_text = "Start your discipline journey today! Log your first workout to begin tracking your progress."
            elif total_workouts <= 5:
                insight_text = "You're building consistency. Keep stacking wins to form a habit!"
            else:
                insight_text = "Great work maintaining your routine! You're showing real discipline."
            prompt_tokens = 0
            completion_tokens = 0
            total_tokens = 0
            model_name = AIModelName.GROQ_LLAMA_3_3_70B
            response_time = 0.0

        AIUsage.objects.create(
            user=user,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens,
            request_type=AIRequestType.INSIGHTS,
            model_name=model_name,
            provider_name="GROQ",
            estimated_cost=round(
                (prompt_tokens * 0.00000059) + (completion_tokens * 0.00000079), 6
            ),
            response_time=response_time
        )

        return Response({
            "success": True,
            "data": {"insight": insight_text},
            "message": "AI performance insight generated.",
            "errors": None
        })

    @action(detail=False, methods=['get'], url_path='workout-recommendations')
    def workout_recommendations(self, request):
        user = request.user

        quota_ok, quota_error = _check_ai_quota(user)
        if not quota_ok:
            raise quota_error

        from workouts.models import WorkoutLog
        from django.db.models import Count

        recent_logs_count = WorkoutLog.objects.filter(user=user).count()
        exercise_counts = (
            WorkoutLog.objects.filter(user=user)
            .values('exercise')
            .annotate(count=Count('id'))
            .order_by('-count')[:5]
        )
        top_exercises = ", ".join(
            str(e['exercise']) for e in exercise_counts
        ) if exercise_counts else "none"

        context_text = (
            f"User's top exercises: {top_exercises}. "
            f"Total workouts: {recent_logs_count}. "
            f"Based on their training history, suggest 3 specific workout recommendations "
            f"to improve their training. Be concise and practical."
        )

        try:
            result = chat_completion(
                messages=[{"role": "user", "content": context_text}],
                user=str(user.id)
            )
            recommendations = result["content"]
            model_name = result["model"]
            prompt_tokens = result["prompt_tokens"]
            completion_tokens = result["completion_tokens"]
            total_tokens = result["total_tokens"]
            response_time = result["response_time"]
        except Exception as e:
            logger.error(f"Groq workout recommendations error: {e}")
            recommendations = "Try adding compound movements like squats, deadlifts, and bench press to your routine for overall strength gains."
            model_name = AIModelName.GROQ_LLAMA_3_3_70B
            prompt_tokens = 0
            completion_tokens = 0
            total_tokens = 0
            response_time = 0.0

        AIUsage.objects.create(
            user=user,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens,
            request_type=AIRequestType.CHAT,
            model_name=model_name,
            provider_name="GROQ",
            estimated_cost=round(
                (prompt_tokens * 0.00000059) + (completion_tokens * 0.00000079), 6
            ),
            response_time=response_time
        )

        return Response({
            "success": True,
            "data": {"recommendations": recommendations},
            "message": "Workout recommendations generated.",
            "errors": None
        })

    @action(detail=False, methods=['get'], url_path='nutrition-tips')
    def nutrition_tips(self, request):
        user = request.user
        quota_ok, quota_error = _check_ai_quota(user)
        if not quota_ok:
            raise quota_error

        profile = getattr(user, 'profile', None)
        height = profile.height if profile else "unknown"
        weight = profile.weight if profile else "unknown"
        goal = profile.goal_weight if profile else "unknown"

        context_text = (
            f"User profile details: height={height}cm, weight={weight}kg, goal weight={goal}kg. "
            f"Provide 3 short, personalized daily nutrition tips (1-2 sentences each). Be practical and direct."
        )

        try:
            result = chat_completion(
                messages=[{"role": "user", "content": context_text}],
                user=str(user.id)
            )
            tips = result["content"]
            model_name = result["model"]
            prompt_tokens = result["prompt_tokens"]
            completion_tokens = result["completion_tokens"]
            total_tokens = result["total_tokens"]
            response_time = result["response_time"]
        except Exception as e:
            logger.error(f"Groq nutrition tips error: {e}")
            tips = "Ensure adequate protein intake, stay hydrated throughout the day, and eat complex carbs before training."
            model_name = AIModelName.GROQ_LLAMA_3_3_70B
            prompt_tokens = 0
            completion_tokens = 0
            total_tokens = 0
            response_time = 0.0

        AIUsage.objects.create(
            user=user,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens,
            request_type=AIRequestType.CHAT,
            model_name=model_name,
            provider_name="GROQ",
            estimated_cost=round(
                (prompt_tokens * 0.00000059) + (completion_tokens * 0.00000079), 6
            ),
            response_time=response_time
        )

        return Response({
            "success": True,
            "data": {"tips": tips},
            "message": "Nutrition tips generated.",
            "errors": None
        })


class AdminAIUsageViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Admin-only viewset to view AI usage metrics and logs across the platform.
    """
    queryset = AIUsage.objects.all().select_related('user').order_by('-created_at')
    serializer_class = AdminAIUsageSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        queryset = super().get_queryset()
        
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(user__username__icontains=search)

        req_type = self.request.query_params.get('request_type')
        if req_type:
            queryset = queryset.filter(request_type=req_type)

        model_name = self.request.query_params.get('model_name')
        if model_name:
            queryset = queryset.filter(model_name=model_name)

        return queryset

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Aggregated summary metrics of AI usages (tokens, estimated costs, queries).
        Also includes daily usage tracking for graphs.
        """
        totals = AIUsage.objects.aggregate(
            total_tokens=models.Sum('total_tokens'),
            total_cost=models.Sum('estimated_cost'),
            total_requests=models.Count('id'),
            avg_response_time=models.Avg('response_time')
        )

        thirty_days_ago = timezone.now().date() - timezone.timedelta(days=30)
        daily_usage = (
            AIUsage.objects.filter(date__gte=thirty_days_ago)
            .values('date')
            .annotate(
                tokens=models.Sum('total_tokens'),
                cost=models.Sum('estimated_cost'),
                requests=models.Count('id')
            )
            .order_by('date')
        )

        daily_data = [
            {
                "date": str(x['date']),
                "tokens": x['tokens'] or 0,
                "cost": float(x['cost'] or 0),
                "requests": x['requests'] or 0
            }
            for x in daily_usage
        ]

        model_share = (
            AIUsage.objects.values('model_name')
            .annotate(count=models.Count('id'))
            .order_by('-count')
        )
        model_data = [
            {"model": x['model_name'], "count": x['count']}
            for x in model_share
        ]

        return Response({
            "success": True,
            "data": {
                "total_tokens": totals['total_tokens'] or 0,
                "total_cost": float(totals['total_cost'] or 0),
                "total_requests": totals['total_requests'] or 0,
                "avg_response_time": float(totals['avg_response_time'] or 0),
                "daily_usage": daily_data,
                "model_share": model_data
            },
            "message": "AI Usage summary compiled successfully.",
            "errors": None
        })