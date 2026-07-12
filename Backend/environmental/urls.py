from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EmissionFactorViewSet,
    ProductESGProfileViewSet,
    EnvironmentalGoalViewSet,
    CarbonTransactionViewSet,
    DashboardViewSet
)

router = DefaultRouter()
router.register(r'emission-factors', EmissionFactorViewSet, basename='emission-factor')
router.register(r'product-esg', ProductESGProfileViewSet, basename='product-esg')
router.register(r'goals', EnvironmentalGoalViewSet, basename='goal')
router.register(r'transactions', CarbonTransactionViewSet, basename='transaction')
router.register(r'dashboard', DashboardViewSet, basename='environmental-dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
