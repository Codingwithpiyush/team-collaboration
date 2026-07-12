from django.db import models, transaction
from django.db.models import Sum, F, Q
from django.db.models.functions import TruncMonth

from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from users.models import Department, OrganizationSettings
from users.services import OrganizationSettingsService
from .models import (
    CarbonTransaction,
    EnvironmentalGoal,
    DepartmentEnvironmentalScore,
    EmissionFactor,
    ProductESGProfile
)


class GoalService:
    @staticmethod
    def recalculate_goal_progress(goal):
        """
        Recalculates the current value of an environmental goal based on transactions.
        """
        if goal.target_type == 'carbon_reduction':
            # Sum of carbon emissions in target window
            tx_filter = CarbonTransaction.objects.filter(
                transaction_date__range=(goal.start_date, goal.target_date)
            )
            if goal.department:
                tx_filter = tx_filter.filter(department=goal.department)
                
            total_co2 = tx_filter.aggregate(Sum('calculated_co2'))['calculated_co2__sum'] or Decimal('0.00')
            goal.current_value = total_co2
            
            # If it's a carbon reduction target, if the emissions are kept BELOW the target_value,
            # it is achieved. If date passed and emissions are below, or if we want simple progress:
            # Let's say it's active. If it exceeds, it might be failed. 
            # For simplicity, we update the value. If current_value > 0 and current_value <= goal.target_value:
            # We can mark it as achieved if target date has arrived, or let users transition it.
            # Let's auto-achieve if current_value meets positive metrics, or if carbon is below target at date.
            goal.save()

    @staticmethod
    def update_all_goals_for_department(department_id, date):
        """
        Updates all carbon-reduction goals matching a department and date.
        """
        goals = EnvironmentalGoal.objects.filter(
            target_type='carbon_reduction',
            start_date__lte=date,
            target_date__gte=date
        )
        if department_id:
            # Goals are either specific to the department or organization-wide
            goals = goals.filter(models.Q(department_id=department_id) | models.Q(department__isnull=True))
        else:
            goals = goals.filter(department__isnull=True)
            
        for goal in goals:
            GoalService.recalculate_goal_progress(goal)


class ScoreService:
    @staticmethod
    def recalculate_department_score(department_id):
        """
        Recalculates the environmental score for a department.
        """
        if not department_id:
            return None
            
        try:
            dept = Department.objects.get(pk=department_id)
        except Department.DoesNotExist:
            return None

        # Fetch total CO2 emissions
        total_emissions = CarbonTransaction.objects.filter(department=dept).aggregate(Sum('calculated_co2'))['calculated_co2__sum'] or Decimal('0.00')

        # Fetch achieved goals
        goals_achieved = EnvironmentalGoal.objects.filter(department=dept, status='achieved').count()

        # Score calculation formula:
        # Start at 100
        # Deduct based on emissions per employee, scaled by environment weight
        org_settings = OrganizationSettingsService.get_settings()
        env_weight = Decimal(str(org_settings.environment_weight)) / Decimal('100.0')

        employee_factor = Decimal(str(max(1, dept.employee_count)))
        emissions_per_employee = total_emissions / employee_factor

        # Standard ESG deduction scale: 0.1 points per kg of CO2 per employee, multiplied by weight
        deduction = emissions_per_employee * env_weight * Decimal('0.1')
        
        # Add points for achieved goals (+5 points per goal)
        goal_bonus = Decimal(str(goals_achieved * 5.0))

        final_score = Decimal('100.00') - deduction + goal_bonus
        final_score = max(Decimal('0.00'), min(Decimal('100.00'), final_score))

        score_record, created = DepartmentEnvironmentalScore.objects.get_or_create(
            department=dept,
            defaults={
                'score': final_score,
                'total_emissions': total_emissions,
                'goals_achieved': goals_achieved
            }
        )
        if not created:
            score_record.score = final_score
            score_record.total_emissions = total_emissions
            score_record.goals_achieved = goals_achieved
            score_record.save()

        return score_record


class DashboardService:
    @staticmethod
    def get_monthly_carbon_trend():
        """
        Aggregates emissions month-by-month for the past 12 months.
        """
        today = timezone.now().date()
        one_year_ago = today - timedelta(days=365)
        
        trend = CarbonTransaction.objects.filter(
            transaction_date__range=(one_year_ago, today)
        ).annotate(
            month=TruncMonth('transaction_date')
        ).values('month').annotate(
            total_co2=Sum('calculated_co2')
        ).order_by('month')

        return [
            {
                'month': item['month'].strftime('%Y-%m') if item['month'] else None,
                'total_co2': item['total_co2']
            }
            for item in trend
        ]



    @staticmethod
    def get_department_carbon_tracking():
        """
        Tracks total carbon emissions per department.
        """
        data = Department.objects.annotate(
            total_co2=Sum('carbon_transactions__calculated_co2')
        ).values('id', 'name', 'code', 'total_co2')

        return [
            {
                'id': item['id'],
                'name': item['name'],
                'code': item['code'],
                'total_co2': item['total_co2'] or Decimal('0.00')
            }
            for item in data
        ]

    @staticmethod
    def get_goal_progress():
        """
        Fetches goal achievements and calculates completion percentages.
        """
        goals = EnvironmentalGoal.objects.all().select_related('department')
        results = []
        for goal in goals:
            pct = 0.0
            if goal.target_value > 0:
                pct = float((goal.current_value / goal.target_value) * Decimal('100.0'))
                pct = min(100.0, max(0.0, pct))
            
            results.append({
                'id': goal.id,
                'name': goal.name,
                'target_type': goal.target_type,
                'target_value': goal.target_value,
                'current_value': goal.current_value,
                'progress_percentage': round(pct, 2),
                'status': goal.status,
                'department_name': goal.department.name if goal.department else "Organization-Wide"
            })
        return results

    @staticmethod
    def get_department_environmental_scores():
        """
        Lists environmental scores for all departments.
        """
        # Ensure scores are recalculated first
        for dept in Department.objects.all():
            ScoreService.recalculate_department_score(dept.id)

        scores = DepartmentEnvironmentalScore.objects.all().select_related('department')
        return [
            {
                'department_id': item.department.id,
                'department_name': item.department.name,
                'department_code': item.department.code,
                'score': item.score,
                'total_emissions': item.total_emissions,
                'goals_achieved': item.goals_achieved,
                'last_updated': item.last_updated
            }
            for item in scores
        ]

    @staticmethod
    def get_top_polluting_departments(limit=5):
        """
        List top polluting departments based on total carbon emissions.
        """
        data = DashboardService.get_department_carbon_tracking()
        sorted_data = sorted(data, key=lambda x: x['total_co2'], reverse=True)
        return sorted_data[:limit]

    @staticmethod
    def get_top_sustainable_departments(limit=5):
        """
        List top sustainable departments based on environmental score.
        """
        data = DashboardService.get_department_environmental_scores()
        sorted_data = sorted(data, key=lambda x: x['score'], reverse=True)
        return sorted_data[:limit]
