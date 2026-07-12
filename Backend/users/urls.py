from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DepartmentViewSet,
    CategoryViewSet,
    EmployeeProfileViewSet,
    OrganizationSettingsViewSet,
    NotificationSettingsViewSet,
    SettingsDashboardViewSet
)

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'employees', EmployeeProfileViewSet, basename='employee')
router.register(r'organization-settings', OrganizationSettingsViewSet, basename='organization-settings')
router.register(r'notification-settings', NotificationSettingsViewSet, basename='notification-settings')
router.register(r'settings', SettingsDashboardViewSet, basename='settings')

urlpatterns = [
    path('', include(router.urls)),
]
