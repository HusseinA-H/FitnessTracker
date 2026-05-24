from django.contrib import admin
from progress.models import ProgressLog

class ProgressLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'weight', 'body_fat', 'lean_mass', 'fat_mass', 'date', 'is_deleted')
    list_filter = ('date', 'is_deleted')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('lean_mass', 'fat_mass')

admin.site.register(ProgressLog, ProgressLogAdmin)
