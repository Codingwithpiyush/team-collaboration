from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.http import HttpResponse
from django.utils.dateparse import parse_date

from .services import ReportEngine


class ReportViewSet(viewsets.ViewSet):
    """
    Report generation viewset. Provides endpoints to generate corporate reports and export them as PDF, Excel, or CSV.
    """
    permission_classes = [AllowAny]

    def _get_filters(self, request):
        """
        Parses filter parameters from the query params.
        """
        filters = {}
        for param in ['department', 'employee', 'challenge', 'category', 'module', 'status']:
            val = request.query_params.get(param)
            if val:
                filters[param] = val

        # Handle Date Range
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        if start_date_str:
            filters['start_date'] = parse_date(start_date_str)
        if end_date_str:
            filters['end_date'] = parse_date(end_date_str)

        return filters

    def _handle_response(self, report_data, request):
        """
        Helper to return either JSON or downloadable file formats.
        """
        export_format = request.query_params.get('export')
        if not export_format:
            return Response(report_data, status=status.HTTP_200_OK)

        export_format = export_format.lower()
        title = report_data['title']
        headers = report_data['headers']
        rows = report_data['rows']
        summary = report_data.get('summary')

        if export_format == 'csv':
            csv_data = ReportEngine.export_as_csv(title, headers, rows)
            response = HttpResponse(csv_data, content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="{title.lower().replace(" ", "_")}.csv"'
            return response

        elif export_format == 'excel':
            excel_data = ReportEngine.export_as_excel(title, headers, rows, summary)
            response = HttpResponse(excel_data, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = f'attachment; filename="{title.lower().replace(" ", "_")}.xlsx"'
            return response

        elif export_format == 'pdf':
            pdf_data = ReportEngine.export_as_pdf(title, headers, rows, summary)
            response = HttpResponse(pdf_data, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{title.lower().replace(" ", "_")}.pdf"'
            return response

        return Response(
            {"detail": f"Unsupported export format '{export_format}'. Use csv, excel, or pdf."},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=False, methods=['get'], url_path='environmental')
    def environmental(self, request):
        """
        Generates carbon ledger and target progress data.
        """
        filters = self._get_filters(request)
        data = ReportEngine.get_environmental_data(filters)
        return self._handle_response(data, request)

    @action(detail=False, methods=['get'], url_path='social')
    def social(self, request):
        """
        Generates corporate learning and CSR activities report.
        """
        filters = self._get_filters(request)
        data = ReportEngine.get_social_data(filters)
        return self._handle_response(data, request)

    @action(detail=False, methods=['get'], url_path='governance')
    def governance(self, request):
        """
        Generates compliance tracking and policy audits report.
        """
        filters = self._get_filters(request)
        data = ReportEngine.get_governance_data(filters)
        return self._handle_response(data, request)

    @action(detail=False, methods=['get'], url_path='department')
    def department(self, request):
        """
        Generates detailed reports for a selected department.
        """
        filters = self._get_filters(request)
        dept_id = request.query_params.get('department')
        if not dept_id:
            return Response(
                {"detail": "department query parameter is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            data = ReportEngine.get_department_data(dept_id, filters)
            return self._handle_response(data, request)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], url_path='employee')
    def employee(self, request):
        """
        Generates detailed reports for a selected employee profile.
        """
        filters = self._get_filters(request)
        emp_id = request.query_params.get('employee')
        if not emp_id:
            return Response(
                {"detail": "employee query parameter is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            data = ReportEngine.get_employee_data(emp_id, filters)
            return self._handle_response(data, request)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], url_path='esg-summary')
    def esg_summary(self, request):
        """
        Aggregates environmental, social, and governance indicators at corporate scale.
        """
        filters = self._get_filters(request)
        data = ReportEngine.get_esg_summary(filters)
        return self._handle_response(data, request)

    @action(detail=False, methods=['get'], url_path='custom')
    def custom(self, request):
        """
        Custom report builder querying data across modules dynamically based on user selections.
        """
        filters = self._get_filters(request)
        try:
            data = ReportEngine.get_custom_report(filters)
            return self._handle_response(data, request)
        except ValueError as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
