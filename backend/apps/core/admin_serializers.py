from rest_framework import serializers
from core.models import Announcement, ContentSettings, NutritionTemplate

class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Announcement
        fields = ['id', 'title', 'content', 'type', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ContentSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentSettings
        fields = ['id', 'key', 'value', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class NutritionTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NutritionTemplate
        fields = ['id', 'name', 'description', 'calories', 'protein', 'carbs', 'fats', 'meals_data', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
