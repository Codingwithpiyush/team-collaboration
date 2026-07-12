from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action

from decimal import Decimal
from datetime import datetime, time as dt_time
from django.utils.timezone import is_aware, make_aware, get_current_timezone
from django.db.models import F, Value, DecimalField, ExpressionWrapper, Avg
from django.db.models.functions import Coalesce

from users.models import Department, EmployeeProfile, OrganizationSettings
from environmental.models import CarbonTransaction, DepartmentEnvironmentalScore
from social.models import EmployeeParticipation, DepartmentSocialScore
from governance.models import PolicyAcknowledgement, ComplianceIssue, DepartmentGovernanceScore
from gamification.models import ChallengeParticipation
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


class DepartmentESGRankingViewSet(viewsets.ViewSet):
    """
    Endpoint for department ESG ranking based on weighted scores.
    """
    permission_classes = [AllowAny]

    def list(self, request):
        # 1. Organization Weights
        settings, _ = OrganizationSettings.objects.get_or_create(
            id=1,
            defaults={
                'environment_weight': Decimal('33.33'),
                'social_weight': Decimal('33.33'),
                'governance_weight': Decimal('33.34'),
            }
        )
        env_w = settings.environment_weight
        soc_w = settings.social_weight
        gov_w = settings.governance_weight

        # 2. Query and annotate active departments
        departments = Department.objects.filter(status='active').select_related(
            'environmental_score',
            'social_score',
            'governance_score'
        ).annotate(
            env_val=Coalesce(F('environmental_score__score'), Value(Decimal('100.00'))),
            soc_val=Coalesce(F('social_score__score'), Value(Decimal('100.00'))),
            gov_val=Coalesce(F('governance_score__score'), Value(Decimal('100.00'))),
            overall_esg_score=ExpressionWrapper(
                (F('env_val') * env_w + F('soc_val') * soc_w + F('gov_val') * gov_w) / Decimal('100.00'),
                output_field=DecimalField(max_digits=5, decimal_places=2)
            )
        ).order_by('-overall_esg_score')

        # 3. Calculate corporate average using aggregate()
        avg_esg = departments.aggregate(avg=Avg('overall_esg_score'))['avg'] or Decimal('100.00')

        rankings = []
        for index, dept in enumerate(departments):
            rankings.append({
                'id': dept.id,
                'name': dept.name,
                'code': dept.code,
                'environmental_score': float(dept.env_val),
                'social_score': float(dept.soc_val),
                'governance_score': float(dept.gov_val),
                'overall_esg_score': float(dept.overall_esg_score),
                'rank': index + 1
            })

        # Return list with custom HTTP Header for corporate average ESG Score
        response = Response(rankings, status=status.HTTP_200_OK)
        response['X-Corporate-Average-ESG'] = str(float(avg_esg))
        return response


class RecentActivitiesViewSet(viewsets.ViewSet):
    """
    Endpoint for fetching unified recent activities from different ESG modules.
    """
    permission_classes = [AllowAny]

    def list(self, request):
        # Helper to convert dates and naive datetimes to aware datetimes
        def to_datetime(date_or_datetime):
            if isinstance(date_or_datetime, datetime):
                return date_or_datetime if is_aware(date_or_datetime) else make_aware(date_or_datetime)
            tz = get_current_timezone()
            return make_aware(datetime.combine(date_or_datetime, dt_time.min), tz)

        # 1. Fetch latest 20 items from each source to guarantee finding the overall latest 20
        txs = CarbonTransaction.objects.select_related('department').order_by('-transaction_date')[:20]
        csrs = EmployeeParticipation.objects.select_related('employee__user', 'activity').order_by('-joined_date')[:20]
        challenges = ChallengeParticipation.objects.select_related('employee__user', 'challenge').order_by('-joined_date')[:20]
        acks = PolicyAcknowledgement.objects.select_related('employee__user', 'policy').order_by('-acknowledged_at')[:20]
        issues = ComplianceIssue.objects.select_related('department').order_by('-created_at')[:20]

        activities = []

        # 2. Normalize and append items
        for tx in txs:
            activities.append({
                'type': 'environmental',
                'title': 'Carbon Emission Logged',
                'description': f"Carbon transaction logged: {tx.activity_type} - {float(tx.calculated_co2)} kg CO2",
                'time': to_datetime(tx.transaction_date),
                'icon': 'leaf'
            })

        for p in csrs:
            emp_name = p.employee.user.get_full_name() or p.employee.user.username
            activities.append({
                'type': 'social',
                'title': 'CSR Participation',
                'description': f"{emp_name} joined CSR: {p.activity.title}",
                'time': to_datetime(p.joined_date),
                'icon': 'heart'
            })

        for cp in challenges:
            emp_name = cp.employee.user.get_full_name() or cp.employee.user.username
            activities.append({
                'type': 'gamification',
                'title': 'Challenge Participation',
                'description': f"{emp_name} joined challenge: {cp.challenge.title}",
                'time': to_datetime(cp.joined_date),
                'icon': 'trophy'
            })

        for ack in acks:
            emp_name = ack.employee.user.get_full_name() or ack.employee.user.username
            activities.append({
                'type': 'governance',
                'title': 'Policy Acknowledged',
                'description': f"{emp_name} acknowledged policy: {ack.policy.title}",
                'time': to_datetime(ack.acknowledged_at),
                'icon': 'policy'
            })

        for issue in issues:
            activities.append({
                'type': 'governance',
                'title': 'Compliance Issue Registered',
                'description': f"Compliance issue registered: {issue.title} ({issue.severity})",
                'time': to_datetime(issue.created_at),
                'icon': 'warning'
            })

        # 3. Sort newest first and limit to 20
        activities.sort(key=lambda x: x['time'], reverse=True)
        activities = activities[:20]

        # 4. Format date/time objects into ISO format for Flutter-ready JSON output
        for act in activities:
            act['time'] = act['time'].isoformat()

        return Response(activities, status=status.HTTP_200_OK)
