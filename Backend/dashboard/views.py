from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action

from users.models import EmployeeProfile
from .services import ExecutiveDashboardService


class ExecutiveDashboardViewSet(viewsets.ViewSet):
    """
    Executive Dashboard exposing real-time ESG metrics, statistics, and charts.
    """
    permission_classes = [AllowAny]

    def list(self, request):
        """
        Returns full Flutter-ready JSON dataset representing the Executive Dashboard.
        Supports optional 'employee' query parameter for personalized notification contexts.
        """
        employee_id = request.query_params.get('employee')
        employee = None

        if employee_id:
            try:
                employee = EmployeeProfile.objects.get(pk=employee_id)
            except EmployeeProfile.DoesNotExist:
                pass

        # If user is authenticated, default to their employee profile if profile exists
        if not employee and request.user.is_authenticated:
            employee = getattr(request.user, 'profile', None)

        data = ExecutiveDashboardService.get_dashboard_data(employee=employee)
        return Response(data, status=status.HTTP_200_OK)
