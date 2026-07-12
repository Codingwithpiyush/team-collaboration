from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from django.http import HttpResponse

from .models import (
    EmissionFactor,
    ProductESGProfile,
    EnvironmentalGoal,
    CarbonTransaction,
    DepartmentEnvironmentalScore
)
from .serializers import (
    EmissionFactorSerializer,
    ProductESGProfileSerializer,
    EnvironmentalGoalSerializer,
    CarbonTransactionSerializer,
    DepartmentEnvironmentalScoreSerializer
)
from .services import DashboardService


class StandardResultsSetPagination(PageNumberPagination):
    """
    Standard pagination for ESG environmental ledger logs.
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class EmissionFactorViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Emission Factors.
    """
    queryset = EmissionFactor.objects.all()
    serializer_class = EmissionFactorSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'category']
    search_fields = ['name', 'category']
    ordering_fields = ['name', 'factor']
    ordering = ['name']


class ProductESGProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Product ESG Profiles.
    """
    queryset = ProductESGProfile.objects.all()
    serializer_class = ProductESGProfileSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status']
    search_fields = ['product_name', 'sku']
    ordering_fields = ['product_name', 'carbon_footprint', 'recyclability_rate']
    ordering = ['product_name']


class EnvironmentalGoalViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Environmental Goals.
    """
    queryset = EnvironmentalGoal.objects.all().select_related('department')
    serializer_class = EnvironmentalGoalSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'target_type', 'department']
    search_fields = ['name', 'department__name', 'status']
    ordering_fields = ['target_date', 'target_value']
    ordering = ['target_date']

    @action(detail=False, methods=['get'], url_path='export')
    def export(self, request):
        """
        Export environmental goals as PDF, Excel, or CSV.
        """
        queryset = self.queryset

        # Apply filters
        department = request.query_params.get('department')
        status_param = request.query_params.get('status')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if department:
            queryset = queryset.filter(department_id=department)
        if status_param:
            queryset = queryset.filter(status=status_param)
        if start_date:
            queryset = queryset.filter(target_date__gte=start_date)
        if end_date:
            queryset = queryset.filter(target_date__lte=end_date)

        # Retrieve export format
        export_format = request.query_params.get('export', 'csv').lower()

        # Build data for ReportEngine
        title = "Environmental Goals Report"
        headers = ["Goal ID", "Goal Name", "Target Type", "Department", "Start Date", "Target Date", "Target Value", "Current Value", "Status"]

        rows = []
        for goal in queryset:
            dept_name = goal.department.name if goal.department else "Organization-Wide"
            rows.append([
                str(goal.id),
                goal.name,
                goal.get_target_type_display() if hasattr(goal, 'get_target_type_display') else goal.target_type,
                dept_name,
                goal.start_date.strftime('%Y-%m-%d') if goal.start_date else '',
                goal.target_date.strftime('%Y-%m-%d') if goal.target_date else '',
                float(goal.target_value),
                float(goal.current_value),
                goal.get_status_display() if hasattr(goal, 'get_status_display') else goal.status
            ])

        # Prepare summary dictionary
        summary = {
            "Total Goals": len(rows),
            "Active Goals": queryset.filter(status='active').count(),
            "Achieved Goals": queryset.filter(status='achieved').count(),
            "Failed Goals": queryset.filter(status='failed').count(),
            "Cancelled Goals": queryset.filter(status='cancelled').count()
        }

        # Import ReportEngine dynamically to avoid circular dependencies
        from reports.services import ReportEngine

        if export_format == 'csv':
            csv_data = ReportEngine.export_as_csv(title, headers, rows)
            response = HttpResponse(csv_data, content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="environmental_goals.csv"'
            return response

        elif export_format == 'excel':
            excel_data = ReportEngine.export_as_excel(title, headers, rows, summary)
            response = HttpResponse(excel_data, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = f'attachment; filename="environmental_goals.xlsx"'
            return response

        elif export_format == 'pdf':
            pdf_data = ReportEngine.export_as_pdf(title, headers, rows, summary)
            response = HttpResponse(pdf_data, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="environmental_goals.pdf"'
            return response

        return Response(
            {"detail": f"Unsupported export format '{export_format}'. Use csv, excel, or pdf."},
            status=status.HTTP_400_BAD_REQUEST
        )


class CarbonTransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Carbon Transactions (CO2 emissions ledger).
    """
    queryset = CarbonTransaction.objects.all().select_related('department', 'employee__user', 'emission_factor')
    serializer_class = CarbonTransactionSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['department', 'employee', 'activity_type', 'transaction_date']
    search_fields = ['activity_type', 'notes']
    ordering_fields = ['transaction_date', 'calculated_co2']
    ordering = ['-transaction_date']


class DashboardViewSet(viewsets.ViewSet):
    """
    API endpoints for the Environmental Analytical Dashboard.
    """
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'], url_path='monthly-trend')
    def monthly_trend(self, request):
        """
        Fetches month-by-month CO2 emissions for the past 12 months.
        """
        trend = DashboardService.get_monthly_carbon_trend()
        return Response(trend, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='department-tracking')
    def department_tracking(self, request):
        """
        Tracks total carbon emissions per department.
        """
        data = DashboardService.get_department_carbon_tracking()
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='goal-progress')
    def goal_progress(self, request):
        """
        Fetches progress percentages and status for all active environmental goals.
        """
        data = DashboardService.get_goal_progress()
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='environmental-scores')
    def environmental_scores(self, request):
        """
        Lists environmental health scores per department.
        """
        data = DashboardService.get_department_environmental_scores()
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='top-polluters')
    def top_polluters(self, request):
        """
        Returns top polluting departments based on emissions.
        """
        limit = int(request.query_params.get('limit', 5))
        data = DashboardService.get_top_polluting_departments(limit)
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='top-sustainable')
    def top_sustainable(self, request):
        """
        Returns top sustainable departments based on environmental scores.
        """
        limit = int(request.query_params.get('limit', 5))
        data = DashboardService.get_top_sustainable_departments(limit)
        return Response(data, status=status.HTTP_200_OK)
