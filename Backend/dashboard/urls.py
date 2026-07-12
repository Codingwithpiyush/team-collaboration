from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExecutiveDashboardViewSet, DepartmentESGRankingViewSet, RecentActivitiesViewSet

router = DefaultRouter()
router.register(r'executive', ExecutiveDashboardViewSet, basename='executive-dashboard')
router.register(r'department-esg-ranking', DepartmentESGRankingViewSet, basename='department-esg-ranking')
router.register(r'recent-activities', RecentActivitiesViewSet, basename='recent-activities')

urlpatterns = [
    path('', include(router.urls)),
]
