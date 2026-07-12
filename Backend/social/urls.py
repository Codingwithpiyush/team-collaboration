from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CSRActivityViewSet,
    EmployeeParticipationViewSet,
    TrainingViewSet,
    DiversityMetricViewSet,
    DepartmentSocialScoreViewSet,
    SocialDashboardViewSet
)

router = DefaultRouter()
router.register(r'activities', CSRActivityViewSet, basename='activity')
router.register(r'participations', EmployeeParticipationViewSet, basename='participation')
router.register(r'trainings', TrainingViewSet, basename='training')
router.register(r'diversity-metrics', DiversityMetricViewSet, basename='diversity-metric')
router.register(r'social-scores', DepartmentSocialScoreViewSet, basename='social-score')
router.register(r'dashboard', SocialDashboardViewSet, basename='social-dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
