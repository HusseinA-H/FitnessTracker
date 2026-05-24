from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from users.models import User, Profile

class ProfileInline(admin.StackedInline):
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile'


class UserAdmin(BaseUserAdmin):
    inlines = (ProfileInline,)
    list_display = ('username', 'email', 'role', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('role', 'is_staff', 'is_active')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Custom Roles & Identity', {'fields': ('role',)}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Custom Roles & Identity', {
            'classes': ('wide',),
            'fields': ('role',),
        }),
    )


class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'height', 'weight', 'goal_weight', 'fitness_level', 'gender', 'is_deleted')
    list_filter = ('fitness_level', 'gender', 'is_deleted')
    search_fields = ('user__username', 'user__email')

admin.site.register(User, UserAdmin)
admin.site.register(Profile, ProfileAdmin)
