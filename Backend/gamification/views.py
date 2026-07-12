from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from django.core.exceptions import ValidationError as DjangoValidationError

from users.models import EmployeeProfile
from .models import (
    Challenge,
    ChallengeParticipation,
    Badge,
    EmployeeBadge,
    Reward,
    RewardRedemption,
    EmployeeLeaderboard,
    DepartmentLeaderboard
)
from .serializers import (
    ChallengeSerializer,
    ChallengeParticipationSerializer,
    BadgeSerializer,
    EmployeeBadgeSerializer,
    RewardSerializer,
    RewardRedemptionSerializer,
    EmployeeLeaderboardSerializer,
    DepartmentLeaderboardSerializer
)
from .services import (
    ChallengeService,
    RewardService,
    LeaderboardService
)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class ChallengeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Challenges.
    """
    queryset = Challenge.objects.all().select_related('category')
    serializer_class = ChallengeSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'category']
    search_fields = ['title', 'description']
    ordering_fields = ['start_date', 'end_date', 'xp_reward']
    ordering = ['-created_at']

    @action(detail=True, methods=['post'], url_path='join')
    def join(self, request, pk=None):
        """
        Custom action for joining a challenge.
        Expects 'employee' in post body.
        """
        challenge_id = pk
        employee_id = request.data.get('employee')

        if not employee_id:
            return Response(
                {"detail": "employee field is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            employee = EmployeeProfile.objects.get(pk=employee_id)
        except EmployeeProfile.DoesNotExist:
            return Response(
                {"detail": "Employee profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            participation = ChallengeService.join_challenge(employee, challenge_id)
            serializer = ChallengeParticipationSerializer(participation)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except DjangoValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ChallengeParticipationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Challenge Participations.
    """
    queryset = ChallengeParticipation.objects.all().select_related('challenge', 'employee__user', 'approved_by__user')
    serializer_class = ChallengeParticipationSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'employee', 'challenge']
    ordering = ['-joined_date']

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        """
        Approves the challenge, granting XP to the participant.
        Expects 'approved_by' in post body.
        """
        participation = self.get_object()
        approver_id = request.data.get('approved_by')

        if not approver_id:
            return Response(
                {"detail": "approved_by field is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            approver = EmployeeProfile.objects.get(pk=approver_id)
        except EmployeeProfile.DoesNotExist:
            return Response(
                {"detail": "Approver profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            updated = ChallengeService.approve_participation(participation, approver)
            serializer = self.get_serializer(updated)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        """
        Rejects the challenge participation.
        Expects 'approved_by' in post body.
        """
        participation = self.get_object()
        approver_id = request.data.get('approved_by')

        if not approver_id:
            return Response(
                {"detail": "approved_by field is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            approver = EmployeeProfile.objects.get(pk=approver_id)
        except EmployeeProfile.DoesNotExist:
            return Response(
                {"detail": "Approver profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            updated = ChallengeService.reject_participation(participation, approver)
            serializer = self.get_serializer(updated)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class BadgeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Badges.
    """
    queryset = Badge.objects.all()
    serializer_class = BadgeSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering = ['criteria_xp']


class EmployeeBadgeViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only views for unlocked employee badges.
    """
    queryset = EmployeeBadge.objects.all().select_related('employee__user', 'badge')
    serializer_class = EmployeeBadgeSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee']


class RewardViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Reward items.
    """
    queryset = Reward.objects.all()
    serializer_class = RewardSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status']
    search_fields = ['title', 'description']
    ordering = ['xp_cost']


class RewardRedemptionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing reward redemptions. Handles checking points, stock, and status transitions.
    """
    queryset = RewardRedemption.objects.all().select_related('reward', 'employee__user', 'approved_by__user')
    serializer_class = RewardRedemptionSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'employee', 'reward']
    ordering = ['-redeemed_at']

    def create(self, request, *args, **kwargs):
        """
        Creates a redemption. Automatically checks constraints and deducts XP.
        """
        employee_id = request.data.get('employee')
        reward_id = request.data.get('reward')

        if not employee_id or not reward_id:
            return Response(
                {"detail": "employee and reward fields are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            employee = EmployeeProfile.objects.get(pk=employee_id)
        except EmployeeProfile.DoesNotExist:
            return Response(
                {"detail": "Employee profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            redemption = RewardService.redeem_reward(employee, reward_id)
            serializer = self.get_serializer(redemption)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except DjangoValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        """
        Approves a pending reward redemption.
        Expects 'approved_by' in post body.
        """
        redemption = self.get_object()
        approver_id = request.data.get('approved_by')

        if not approver_id:
            return Response(
                {"detail": "approved_by field is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            approver = EmployeeProfile.objects.get(pk=approver_id)
        except EmployeeProfile.DoesNotExist:
            return Response(
                {"detail": "Approver profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            updated = RewardService.approve_redemption(redemption, approver)
            serializer = self.get_serializer(updated)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        """
        Rejects a pending reward redemption, refunding employee XP and restoring stock.
        Expects 'approved_by' in post body.
        """
        redemption = self.get_object()
        approver_id = request.data.get('approved_by')

        if not approver_id:
            return Response(
                {"detail": "approved_by field is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            approver = EmployeeProfile.objects.get(pk=approver_id)
        except EmployeeProfile.DoesNotExist:
            return Response(
                {"detail": "Approver not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            updated = RewardService.reject_redemption(redemption, approver)
            serializer = self.get_serializer(updated)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class LeaderboardViewSet(viewsets.ViewSet):
    """
    API endpoints for querying leaderboards and rankings.
    """
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'], url_path='employee')
    def employee(self, request):
        """
        Gets list of ranked employees based on XP.
        """
        # Trigger recalculation to ensure accuracy
        LeaderboardService.recalculate_leaderboards()

        queryset = EmployeeLeaderboard.objects.all().select_related('employee__user', 'employee__department')
        
        # Paginate results
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        if page is not None:
            serializer = EmployeeLeaderboardSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = EmployeeLeaderboardSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='department')
    def department(self, request):
        """
        Gets list of ranked departments based on average XP.
        """
        # Trigger recalculation
        LeaderboardService.recalculate_leaderboards()

        queryset = DepartmentLeaderboard.objects.all().select_related('department')
        
        # Paginate results
        paginator = StandardResultsSetPagination()
        page = paginator.paginate_queryset(queryset, request, view=self)
        if page is not None:
            serializer = DepartmentLeaderboardSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = DepartmentLeaderboardSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
