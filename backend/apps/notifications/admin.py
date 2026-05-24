from django.contrib import admin
from notifications.models import Notification

class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'is_read', 'read_at', 'notification_type', 'created_at')
    list_filter = ('is_read', 'notification_type', 'created_at')
    search_fields = ('user__username', 'title', 'message')

admin.site.register(Notification, NotificationAdmin)
