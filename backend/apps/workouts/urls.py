from django.urls import path, include
from rest_framework.routers import DefaultRouter
from workouts.views import ExerciseViewSet, WorkoutViewSet, WorkoutLogViewSet

router = DefaultRouter()
router.register('exercises', ExerciseViewSet, basename='exercise')
router.register('logs', WorkoutLogViewSet, basename='workout-log')
router.register('', WorkoutViewSet, basename='workout')

app_name = 'workouts'

urlpatterns = [
    path('', include(router.urls)),
]
