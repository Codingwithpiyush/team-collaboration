from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from django.core.exceptions import ValidationError as DjangoValidationError

from users.models import EmployeeProfile
from .models import (
    Policy,
    PolicyAcknowledgement,
    Audit,
    ComplianceIssue,
    DepartmentGovernanceScore
)
from .serializers import (
    PolicySerializer,
    PolicyAcknowledgementSerializer,
    AuditSerializer,
    ComplianceIssueSerializer,
    DepartmentGovernanceScoreSerializer
)
from .services import (
    PolicyService,
    ComplianceService,
    GovernanceDashboardService
)


class StandardResultsSetPagination(PageNumberPagination):
    """
    Standard pagination configuration.
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class PolicyViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Policies.
    """
    queryset = Policy.objects.all().select_related('owner__user', 'created_by')
    serializer_class = PolicySerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'owner']
    search_fields = ['title', 'code', 'description']
    ordering_fields = ['code', 'created_at']
    ordering = ['code']

    def perform_create(self, serializer):
        # Attach currently authenticated user if present
        user = self.request.user if self.request.user.is_authenticated else None
        serializer.save(created_by=user)

    @action(detail=True, methods=['post'], url_path='new-version')
    def new_version(self, request, pk=None):
        """
        Creates a new draft version of an existing policy and archives the old version.
        Expects 'version' in post body.
        """
        policy = self.get_object()
        new_version = request.data.get('version')
        user = request.user if request.user.is_authenticated else None

        if not new_version:
            return Response(
                {"detail": "version field is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            new_policy = PolicyService.create_new_version(policy, new_version, user)
            serializer = self.get_serializer(new_policy)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except (DjangoValidationError, ValueError) as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'], url_path='acknowledge')
    def acknowledge(self, request, pk=None):
        """
        Acknowledge the policy for a given employee.
        Expects 'employee' in post body.
        """
        policy = self.get_object()
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
            ack = PolicyService.acknowledge_policy(employee, policy)
            serializer = PolicyAcknowledgementSerializer(ack)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except DjangoValidationError as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class PolicyAcknowledgementViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing policy acknowledgements.
    """
    queryset = PolicyAcknowledgement.objects.all().select_related('policy', 'employee__user')
    serializer_class = PolicyAcknowledgementSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['policy', 'employee']
    ordering_fields = ['acknowledged_at']
    ordering = ['-acknowledged_at']


class AuditViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing compliance Audits.
    """
    queryset = Audit.objects.all().select_related('department', 'auditor__user')
    serializer_class = AuditSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'department', 'auditor']
    search_fields = ['title', 'scope', 'findings']
    ordering_fields = ['audit_date', 'score']
    ordering = ['-audit_date']


class ComplianceIssueViewSet(viewsets.ModelViewSet):
    """
    ViewSet for tracking and managing Compliance Issues.
    """
    queryset = ComplianceIssue.objects.all().select_related('department', 'assigned_to__user')
    serializer_class = ComplianceIssueSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'severity', 'department', 'assigned_to']
    search_fields = ['title', 'description']
    ordering_fields = ['due_date', 'created_at']
    ordering = ['due_date']

    @action(detail=True, methods=['post'], url_path='assign')
    def assign(self, request, pk=None):
        """
        Assigns the issue to an employee. Expects 'employee' in body.
        """
        issue = self.get_object()
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
            updated = ComplianceService.assign_issue(issue, employee)
            serializer = self.get_serializer(updated)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='resolve')
    def resolve(self, request, pk=None):
        """
        Resolves the compliance issue. Expects 'resolution_notes' in body.
        """
        issue = self.get_object()
        resolution_notes = request.data.get('resolution_notes')

        if not resolution_notes:
            return Response(
                {"detail": "resolution_notes field is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            updated = ComplianceService.resolve_issue(issue, resolution_notes)
            serializer = self.get_serializer(updated)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except DjangoValidationError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class DepartmentGovernanceScoreViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only views for department governance rankings.
    """
    queryset = DepartmentGovernanceScore.objects.all().select_related('department')
    serializer_class = DepartmentGovernanceScoreSerializer
    permission_classes = [AllowAny]


class GovernanceDashboardViewSet(viewsets.ViewSet):
    """
    Analytical Dashboard for corporate governance status.
    """
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'], url_path='acknowledgement-rates')
    def acknowledgement_rates(self, request):
        """
        Gets percentage of employee acknowledgements per active policy.
        """
        rates = GovernanceDashboardService.get_policy_acknowledgement_rates()
        return Response(rates, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='compliance-stats')
    def compliance_stats(self, request):
        """
        Gets count summaries of compliance issues by status and severity.
        """
        stats = GovernanceDashboardService.get_compliance_issue_stats()
        return Response(stats, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='audit-trends')
    def audit_trends(self, request):
        """
        Gets timeline values of latest audit performance scores.
        """
        trends = GovernanceDashboardService.get_audit_trends()
        return Response(trends, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='department-scores')
    def department_scores(self, request):
        """
        Gets average compliance parameters and governance ratings per department.
        """
        scores = GovernanceDashboardService.get_department_score_tracking()
        return Response(scores, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='top-performing')
    def top_performing(self, request):
        """
        Gets list of highest performing departments by overall governance index.
        """
        limit = int(request.query_params.get('limit', 5))
        data = GovernanceDashboardService.get_top_performing_departments(limit)
        return Response(data, status=status.HTTP_200_OK)
