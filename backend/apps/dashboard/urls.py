from django.urls import path
from dashboard.views import DashboardStatsView

app_name = 'dashboard'

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='stats'),
]