from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ChallengeViewSet,
    ChallengeParticipationViewSet,
    BadgeViewSet,
    EmployeeBadgeViewSet,
    RewardViewSet,
    RewardRedemptionViewSet,
    LeaderboardViewSet,
    BadgeGalleryViewSet,
    GamificationDashboardViewSet
)

router = DefaultRouter()
router.register(r'challenges', ChallengeViewSet, basename='challenge')
router.register(r'participations', ChallengeParticipationViewSet, basename='challenge-participation')
router.register(r'badges', BadgeViewSet, basename='badge')
router.register(r'employee-badges', EmployeeBadgeViewSet, basename='employee-badge')
router.register(r'rewards', RewardViewSet, basename='reward')
router.register(r'redemptions', RewardRedemptionViewSet, basename='reward-redemption')
router.register(r'leaderboard', LeaderboardViewSet, basename='gamification-leaderboard')
router.register(r'badge-gallery', BadgeGalleryViewSet, basename='badge-gallery')
router.register(r'dashboard', GamificationDashboardViewSet, basename='gamification-dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
