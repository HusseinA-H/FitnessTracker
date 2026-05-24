from django.contrib import admin
from workouts.models import Exercise, Workout, WorkoutLog

class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'created_at')
    list_filter = ('category',)
    search_fields = ('name', 'description')


class WorkoutAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'is_blueprint', 'level', 'is_deleted')
    list_filter = ('is_blueprint', 'level', 'is_deleted')
    search_fields = ('name', 'user__username', 'description')


class WorkoutLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'exercise', 'sets', 'reps', 'weight', 'date')
    list_filter = ('date', 'exercise__category')
    search_fields = ('user__username', 'exercise__name')

admin.site.register(Exercise, ExerciseAdmin)
admin.site.register(Workout, WorkoutAdmin)
admin.site.register(WorkoutLog, WorkoutLogAdmin)
