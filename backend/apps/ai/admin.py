from django.contrib import admin
from ai.models import AIUsage, AIConversation, AIMessage

class AIUsageAdmin(admin.ModelAdmin):
    list_display = ('user', 'request_type', 'model_name', 'total_tokens', 'estimated_cost', 'response_time', 'date')
    list_filter = ('model_name', 'request_type', 'date')
    search_fields = ('user__username', 'request_type')
    readonly_fields = ('total_tokens', 'estimated_cost', 'response_time', 'date')


class AIMessageInline(admin.TabularInline):
    model = AIMessage
    extra = 1


class AIConversationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'created_at', 'updated_at')
    search_fields = ('user__username', 'title')
    inlines = [AIMessageInline]

admin.site.register(AIUsage, AIUsageAdmin)
admin.site.register(AIConversation, AIConversationAdmin)
