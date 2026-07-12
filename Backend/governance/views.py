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
    search_fields = ['title', 'department__name', 'auditor__user__first_name', 'auditor__user__last_name', 'auditor__employee_id', 'status']
    ordering_fields = ['audit_date', 'score']
    ordering = ['-audit_date']

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)

        # Query linked compliance issues for this department
        issues = ComplianceIssue.objects.filter(department=instance.department)
        issues_serializer = ComplianceIssueSerializer(issues, many=True)

        data = serializer.data
        data['linked_compliance_issues'] = issues_serializer.data
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='export')
    def export(self, request):
        """
        Export compliance audits as PDF, Excel, or CSV.
        """
        queryset = self.queryset

        # Apply filters
        department = request.query_params.get('department')
        auditor = request.query_params.get('auditor')
        status_param = request.query_params.get('status')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if department:
            queryset = queryset.filter(department_id=department)
        if auditor:
            queryset = queryset.filter(auditor_id=auditor)
        if status_param:
            queryset = queryset.filter(status=status_param)
        if start_date:
            queryset = queryset.filter(audit_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(audit_date__lte=end_date)

        # Retrieve export format
        export_format = request.query_params.get('export', 'csv').lower()

        # Build data for ReportEngine
        title = "Compliance Audits Report"
        headers = ["Audit ID", "Title", "Scope", "Department", "Auditor", "Audit Date", "Score", "Status"]

        rows = []
        for audit in queryset:
            dept_name = audit.department.name if audit.department else "Organization-Wide"
            auditor_name = audit.auditor.user.get_full_name() if audit.auditor else ''
            rows.append([
                str(audit.id),
                audit.title,
                audit.scope,
                dept_name,
                auditor_name,
                audit.audit_date.strftime('%Y-%m-%d') if audit.audit_date else '',
                float(audit.score),
                audit.get_status_display() if hasattr(audit, 'get_status_display') else audit.status
            ])

        # Prepare summary dictionary
        summary = {
            "Total Audits": len(rows),
            "Published Audits": queryset.filter(status='published').count(),
            "Draft Audits": queryset.filter(status='draft').count(),
            "Average Score": f"{float(sum(audit.score for audit in queryset) / len(queryset)):.2f}%" if queryset.exists() else "N/A"
        }

        # Import ReportEngine dynamically to avoid circular dependencies
        from reports.services import ReportEngine
        from django.http import HttpResponse

        if export_format == 'csv':
            csv_data = ReportEngine.export_as_csv(title, headers, rows)
            response = HttpResponse(csv_data, content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="compliance_audits.csv"'
            return response

        elif export_format == 'excel':
            excel_data = ReportEngine.export_as_excel(title, headers, rows, summary)
            response = HttpResponse(excel_data, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = f'attachment; filename="compliance_audits.xlsx"'
            return response

        elif export_format == 'pdf':
            pdf_data = ReportEngine.export_as_pdf(title, headers, rows, summary)
            response = HttpResponse(pdf_data, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="compliance_audits.pdf"'
            return response

        return Response({"detail": "Invalid export format"}, status=status.HTTP_400_BAD_REQUEST)


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

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        """
        Gets a summary of compliance issues and audits for the dashboard.
        """
        total_audits = Audit.objects.count()
        open_issues = ComplianceIssue.objects.filter(status='open').count()
        resolved_issues = ComplianceIssue.objects.filter(status='resolved').count()
        high_severity_issues = ComplianceIssue.objects.filter(severity__in=['high', 'critical']).count()
        medium_severity_issues = ComplianceIssue.objects.filter(severity='medium').count()
        low_severity_issues = ComplianceIssue.objects.filter(severity='low').count()
        pending_reviews = Audit.objects.filter(status='draft').count()

        return Response({
            'total_audits': total_audits,
            'open_issues': open_issues,
            'resolved_issues': resolved_issues,
            'high_severity_issues': high_severity_issues,
            'medium_severity_issues': medium_severity_issues,
            'low_severity_issues': low_severity_issues,
            'pending_reviews': pending_reviews
        }, status=status.HTTP_200_OK)

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
