from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny

from .models import Department, Category, EmployeeProfile, OrganizationSettings, NotificationSettings
from .serializers import (
    DepartmentSerializer,
    CategorySerializer,
    EmployeeProfileSerializer,
    OrganizationSettingsSerializer,
    NotificationSettingsSerializer
)
from .services import DepartmentService, OrganizationSettingsService


class StandardResultsSetPagination(PageNumberPagination):
    """
    Standard pagination for ESG platforms.
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class DepartmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Department CRUD, hierarchy representation, and dropdown selection.
    """
    queryset = Department.objects.all().select_related('parent_department', 'head__user')
    serializer_class = DepartmentSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'parent_department']
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'code', 'employee_count']
    ordering = ['name']

    @action(detail=False, methods=['get'], url_path='hierarchy')
    def hierarchy(self, request):
        """
        Custom endpoint to fetch tree hierarchy of active departments.
        """
        hierarchy_tree = DepartmentService.get_hierarchy()
        return Response(hierarchy_tree, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='dropdown')
    def dropdown(self, request):
        """
        Custom lightweight endpoint for fetching active departments for dropdowns.
        """
        active_depts = self.queryset.filter(status='active').values('id', 'name', 'code')
        return Response(active_depts, status=status.HTTP_200_OK)


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Category CRUD and dropdown selection.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'type']
    search_fields = ['name', 'description']
    ordering_fields = ['name']
    ordering = ['name']

    @action(detail=False, methods=['get'], url_path='dropdown')
    def dropdown(self, request):
        """
        Custom lightweight endpoint for fetching active categories for dropdowns.
        """
        active_cats = self.queryset.filter(status='active').values('id', 'name', 'type')
        return Response(active_cats, status=status.HTTP_200_OK)


class EmployeeProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for EmployeeProfile CRUD.
    """
    queryset = EmployeeProfile.objects.all().select_related('user', 'department')
    serializer_class = EmployeeProfileSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'department', 'joining_date']
    search_fields = ['employee_id', 'user__username', 'user__first_name', 'user__last_name', 'designation']
    ordering_fields = ['employee_id', 'joining_date']
    ordering = ['employee_id']

    @action(detail=False, methods=['get'], url_path='dropdown')
    def dropdown(self, request):
        """
        Custom lightweight endpoint for fetching active employees for dropdowns.
        """
        active_employees = self.queryset.filter(status='active').values(
            'id', 'employee_id', 'designation'
        )
        # Add full name manually to response mapping
        response_data = []
        for emp in self.queryset.filter(status='active'):
            response_data.append({
                'id': emp.id,
                'employee_id': emp.employee_id,
                'name': emp.user.get_full_name() or emp.user.username,
                'designation': emp.designation
            })
        return Response(response_data, status=status.HTTP_200_OK)


class OrganizationSettingsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for accessing and updating the global Organization Settings singleton.
    """
    queryset = OrganizationSettings.objects.all()
    serializer_class = OrganizationSettingsSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        return OrganizationSettingsService.get_settings()

    def list(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request, *args, **kwargs):
        # Create requests are converted to update on singleton
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data, status=status.HTTP_200_OK)


class NotificationSettingsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing individual notification preferences.
    """
    queryset = NotificationSettings.objects.all().select_related('employee__user')
    serializer_class = NotificationSettingsSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = [
        'employee', 'email_notifications', 'badge_notifications',
        'csr_notifications', 'challenge_notifications', 'policy_notifications',
        'compliance_notifications'
    ]
    ordering_fields = ['id']
    ordering = ['id']
