from rest_framework import serializers
from ai.models import AIUsage, AIConversation, AIMessage

class AIUsageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIUsage
        fields = (
            'id', 'user', 'prompt_tokens', 'completion_tokens', 'total_tokens',
            'request_type', 'model_name', 'provider_name', 'estimated_cost', 'response_time', 'date'
        )
        read_only_fields = ('id', 'user', 'total_tokens', 'date')


class AIMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIMessage
        fields = ('id', 'conversation', 'role', 'content', 'token_count', 'model_name', 'created_at')
        read_only_fields = ('id', 'role', 'token_count', 'model_name', 'created_at')


class AIConversationListSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = AIConversation
        fields = ('id', 'user', 'title', 'last_message', 'created_at', 'updated_at')
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')

    def get_last_message(self, obj):
        last = obj.messages.order_by('-created_at').first()
        if last:
            return {"role": last.role, "content": last.content[:80], "created_at": last.created_at}
        return None


class AdminAIUsageSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = AIUsage
        fields = (
            'id', 'user', 'username', 'prompt_tokens', 'completion_tokens', 'total_tokens',
            'request_type', 'model_name', 'provider_name', 'estimated_cost', 'response_time', 'date', 'created_at'
        )
        read_only_fields = fields



class AIConversationDetailSerializer(serializers.ModelSerializer):
    messages = AIMessageSerializer(many=True, read_only=True)

    class Meta:
        model = AIConversation
        fields = ('id', 'user', 'title', 'messages', 'created_at', 'updated_at')
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')