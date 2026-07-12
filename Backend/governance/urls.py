from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PolicyViewSet,
    PolicyAcknowledgementViewSet,
    AuditViewSet,
    ComplianceIssueViewSet,
    DepartmentGovernanceScoreViewSet,
    GovernanceDashboardViewSet
)

router = DefaultRouter()
router.register(r'policies', PolicyViewSet, basename='policy')
router.register(r'acknowledgements', PolicyAcknowledgementViewSet, basename='acknowledgement')
router.register(r'audits', AuditViewSet, basename='audit')
router.register(r'issues', ComplianceIssueViewSet, basename='compliance-issue')
router.register(r'governance-scores', DepartmentGovernanceScoreViewSet, basename='governance-score')
router.register(r'dashboard', GovernanceDashboardViewSet, basename='governance-dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
