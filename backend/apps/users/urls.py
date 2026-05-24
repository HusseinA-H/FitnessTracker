from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import RegisterView, AuditTokenObtainPairView

app_name = 'users'

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', AuditTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
