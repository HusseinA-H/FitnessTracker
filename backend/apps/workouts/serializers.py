import uuid
from rest_framework import serializers
from workouts.models import Exercise, Workout, WorkoutLog

class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ('id', 'name', 'description', 'category', 'equipment', 'muscles', 'muscles_secondary')


class WorkoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workout
        fields = ('id', 'user', 'name', 'description', 'is_blueprint', 'level', 'created_at', 'updated_at')
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')


class WorkoutLogSerializer(serializers.ModelSerializer):
    exercise_details = ExerciseSerializer(source='exercise', read_only=True)
    exercise = serializers.CharField(write_only=True)

    class Meta:
        model = WorkoutLog
        fields = ('id', 'user', 'workout', 'exercise', 'exercise_details', 'sets', 'reps', 'weight', 'date', 'is_locked', 'locked_at')
        read_only_fields = ('id', 'user', 'is_locked', 'locked_at')

    def validate_exercise(self, value):
        # 1. Check if it is a valid UUID
        try:
            val_uuid = uuid.UUID(value)
            ex = Exercise.objects.filter(id=val_uuid).first()
            if ex:
                return ex
        except ValueError:
            pass

        # 2. Case-insensitive lookup or create
        ex, created = Exercise.objects.get_or_create(
            name=value.strip(),
            defaults={
                'category': 'General',
                'equipment': [],
                'muscles': []
            }
        )
        return ex

    def validate(self, attrs):
        # Block modifications if log is locked
        if self.instance and self.instance.is_locked:
            raise serializers.ValidationError("This workout log is locked and cannot be modified.")
        return attrs
