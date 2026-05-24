from rest_framework import serializers
from progress.models import ProgressLog

class ProgressLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgressLog
        fields = ('id', 'user', 'weight', 'body_fat', 'lean_mass', 'fat_mass', 'date')
        read_only_fields = ('id', 'user', 'lean_mass', 'fat_mass')
