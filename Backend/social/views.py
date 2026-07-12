from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from django.core.exceptions import ValidationError as DjangoValidationError

from users.models import EmployeeProfile
from .models import (
    CSRActivity,
    EmployeeParticipation,
    Training,
    DiversityMetric,
    DepartmentSocialScore
)
from .serializers import (
    CSRActivitySerializer,
    EmployeeParticipationSerializer,
    TrainingSerializer,
    DiversityMetricSerializer,
    DepartmentSocialScoreSerializer
)
from .services import (
    CSRService,
    TrainingService,
    SocialDashboardService
)


class StandardResultsSetPagination(PageNumberPagination):
    """
    Standard pagination for social ledger models.
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class CSRActivityViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing CSR Activities.
    """
    queryset = CSRActivity.objects.all().select_related('category')
    serializer_class = CSRActivitySerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'category']
    search_fields = ['title', 'description']
    ordering_fields = ['start_date', 'points']
    ordering = ['-start_date']

    @action(detail=True, methods=['post'], url_path='join')
    def join(self, request, pk=None):
        """
        Custom endpoint for an employee to join/register for a CSR activity.
        Expects employee ID in the post body, and optional file upload for evidence.
        """
        activity = self.get_object()
        employee_id = request.data.get('employee')
        evidence_file = request.FILES.get('evidence')

        if not employee_id:
            return Response(
                {"detail": "Employee field is required."},
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
            participation = CSRService.join_activity(
                employee=employee,
                activity=activity,
                evidence_file=evidence_file
            )
            serializer = EmployeeParticipationSerializer(participation)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except (DjangoValidationError, ValueError) as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class EmployeeParticipationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing CSR activity participations.
    """
    queryset = EmployeeParticipation.objects.all().select_related('employee__user', 'activity')
    serializer_class = EmployeeParticipationSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'employee', 'activity']
    ordering_fields = ['joined_date']
    ordering = ['-joined_date']

    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        """
        Custom workflow action to approve a participation and allocate points.
        """
        participation = self.get_object()
        try:
            updated = CSRService.approve_participation(participation)
            serializer = self.get_serializer(updated)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        """
        Custom workflow action to reject a participation.
        """
        participation = self.get_object()
        try:
            updated = CSRService.reject_participation(participation)
            serializer = self.get_serializer(updated)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class TrainingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing employee Learning & Trainings.
    """
    queryset = Training.objects.all().prefetch_related('employees__user')
    serializer_class = TrainingSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['title', 'trainer']
    ordering_fields = ['start_date', 'duration_hours']
    ordering = ['-start_date']

    @action(detail=True, methods=['post'], url_path='enroll')
    def enroll(self, request, pk=None):
        """
        Enrolls a list of employees or a single employee in the training program.
        """
        training = self.get_object()
        employee_id = request.data.get('employee')

        if not employee_id:
            return Response(
                {"detail": "Employee field is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            employee = EmployeeProfile.objects.get(pk=employee_id)
        except EmployeeProfile.DoesNotExist:
            return Response(
                {"detail": "Employee profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        TrainingService.enroll_employee(training, employee)
        return Response(
            {"detail": f"Employee {employee.employee_id} successfully enrolled in training."},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], url_path='unenroll')
    def unenroll(self, request, pk=None):
        """
        Removes an employee from the training program.
        """
        training = self.get_object()
        employee_id = request.data.get('employee')

        if not employee_id:
            return Response(
                {"detail": "Employee field is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            employee = EmployeeProfile.objects.get(pk=employee_id)
        except EmployeeProfile.DoesNotExist:
            return Response(
                {"detail": "Employee profile not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        TrainingService.unenroll_employee(training, employee)
        return Response(
            {"detail": f"Employee {employee.employee_id} successfully unenrolled from training."},
            status=status.HTTP_200_OK
        )


class DiversityMetricViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Diversity metrics records.
    """
    queryset = DiversityMetric.objects.all().select_related('department')
    serializer_class = DiversityMetricSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['department']
    ordering_fields = ['metric_date']
    ordering = ['-metric_date']


class DepartmentSocialScoreViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only view for department social performance rankings.
    """
    queryset = DepartmentSocialScore.objects.all().select_related('department')
    serializer_class = DepartmentSocialScoreSerializer
    permission_classes = [AllowAny]


class SocialDashboardViewSet(viewsets.ViewSet):
    """
    API endpoints for the Social Sustainability Analytical Dashboard.
    """
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'], url_path='monthly-trend')
    def monthly_trend(self, request):
        """
        Gets monthly CSR participation activity counts for the past year.
        """
        trend = SocialDashboardService.get_monthly_participation_trend()
        return Response(trend, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='department-points')
    def department_points(self, request):
        """
        Aggregated CSR scores and training average metrics by department.
        """
        data = SocialDashboardService.get_department_points_tracking()
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='diversity-distribution')
    def diversity_distribution(self, request):
        """
        Aggregated gender, age, and disability counts.
        """
        data = SocialDashboardService.get_diversity_distribution()
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='top-performing')
    def top_performing(self, request):
        """
        Gets top departments by Social score performance.
        """
        limit = int(request.query_params.get('limit', 5))
        data = SocialDashboardService.get_top_performing_departments(limit)
        return Response(data, status=status.HTTP_200_OK)
