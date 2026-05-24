from rest_framework import serializers
from users.models import User, Profile
from common.choices import UserRole

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    first_name = serializers.CharField(source='user.first_name', required=False, allow_blank=True)
    last_name = serializers.CharField(source='user.last_name', required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, style={'input_type': 'password'})
    role = serializers.CharField(source='user.role', read_only=True)
    subscription = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Profile
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 'password',
            'role', 'subscription',
            'height', 'weight', 'goal_weight', 
            'fitness_level', 'gender', 'date_of_birth', 'activity_level'
        )

    def get_subscription(self, obj):
        sub = obj.user.current_subscription
        if sub and sub.is_currently_active:
            return {
                "id": str(sub.id),
                "plan_name": sub.plan.name,
                "plan_slug": sub.plan.slug,
                "features": sub.plan.features,
                "end_date": sub.end_date.isoformat()
            }
        return None

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        password = validated_data.pop('password', None)
        
        if user_data or password:
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            if password:
                user.set_password(password)
            user.save()
        
        return super().update(instance, validated_data)


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'role', 
            'first_name', 'last_name', 'profile', 'date_joined'
        )
        read_only_fields = ('id', 'role', 'date_joined')


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': False, 'allow_blank': True},
            'last_name': {'required': False, 'allow_blank': True},
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('role', None)
        user = User.objects.create_user(password=password, role=UserRole.USER, **validated_data)
        return user


class AdminUserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    subscription_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'role', 'is_active',
            'first_name', 'last_name', 'profile', 'date_joined',
            'subscription_details'
        )
        read_only_fields = ('id', 'date_joined', 'subscription_details')

    def get_subscription_details(self, obj):
        sub = obj.current_subscription
        if sub:
            return {
                "id": str(sub.id),
                "plan_name": sub.plan.name,
                "status": sub.status,
                "start_date": sub.start_date.isoformat() if sub.start_date else None,
                "end_date": sub.end_date.isoformat() if sub.end_date else None,
                "is_approved": sub.is_approved
            }
        return None

