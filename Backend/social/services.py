from django.db import transaction
from django.db.models import Sum, Q, Count
from django.db.models.functions import TruncMonth
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

from users.models import Department, EmployeeProfile
from .models import (
    CSRActivity,
    EmployeeParticipation,
    Training,
    DiversityMetric,
    DepartmentSocialScore
)


class CSRService:
    @staticmethod
    @transaction.atomic
    def join_activity(employee, activity, evidence_file=None):
        """
        Creates a participation record for an employee for a specific CSR activity.
        """
        if EmployeeParticipation.objects.filter(employee=employee, activity=activity).exists():
            raise ValidationError("You have already registered for this CSR activity.")

        participation = EmployeeParticipation(
            employee=employee,
            activity=activity,
            evidence=evidence_file,
            status='pending'
        )
        # Triggers full clean for evidence requirement checks
        participation.full_clean()
        participation.save()
        return participation

    @staticmethod
    @transaction.atomic
    def approve_participation(participation):
        """
        Approves a participation record, triggering points allocation.
        """
        participation.status = 'approved'
        participation.save()
        # Department score will update via signals, but let's be double sure
        SocialScoreService.recalculate_department_social_score(participation.employee.department_id)
        return participation

    @staticmethod
    @transaction.atomic
    def reject_participation(participation):
        """
        Rejects a participation record.
        """
        participation.status = 'rejected'
        participation.save()
        SocialScoreService.recalculate_department_social_score(participation.employee.department_id)
        return participation


class TrainingService:
    @staticmethod
    @transaction.atomic
    def enroll_employee(training, employee):
        """
        Enrolls an employee in a training course.
        """
        training.employees.add(employee)
        SocialScoreService.recalculate_department_social_score(employee.department_id)

    @staticmethod
    @transaction.atomic
    def unenroll_employee(training, employee):
        """
        Removes an employee from a training course.
        """
        training.employees.remove(employee)
        SocialScoreService.recalculate_department_social_score(employee.department_id)


class SocialScoreService:
    @staticmethod
    def recalculate_department_social_score(department_id):
        """
        Computes the Social sustainability score for a department.
        """
        if not department_id:
            return None

        try:
            dept = Department.objects.get(pk=department_id)
        except Department.DoesNotExist:
            return None

        emp_count = max(1, dept.employee_count)

        # 1. Total CSR points awarded to employees in this department
        total_csr = EmployeeParticipation.objects.filter(
            employee__department=dept,
            status='approved'
        ).aggregate(Sum('points_awarded'))['points_awarded__sum'] or 0

        # 2. Total training hours logged by employees in this department
        total_training_hours = Training.objects.filter(
            employees__department=dept
        ).aggregate(Sum('duration_hours'))['duration_hours__sum'] or Decimal('0.00')

        training_per_emp = total_training_hours / Decimal(str(emp_count))

        # Score formulation:
        # Base score of 60.00
        # Add CSR contribution (2.0 pts per average point per employee)
        # Add Training hours contribution (1.5 pts per average hour per employee)
        # Cap at 100.00
        csr_factor = Decimal(str(total_csr)) / Decimal(str(emp_count)) * Decimal('2.0')
        training_factor = training_per_emp * Decimal('1.5')

        final_score = Decimal('60.00') + csr_factor + training_factor
        final_score = max(Decimal('0.00'), min(Decimal('100.00'), final_score))

        score_rec, created = DepartmentSocialScore.objects.get_or_create(
            department=dept,
            defaults={
                'score': final_score,
                'total_csr_points': total_csr,
                'training_hours_per_employee': training_per_emp
            }
        )
        if not created:
            score_rec.score = final_score
            score_rec.total_csr_points = total_csr
            score_rec.training_hours_per_employee = training_per_emp
            score_rec.save()

        return score_rec


class SocialDashboardService:
    @staticmethod
    def get_monthly_participation_trend():
        """
        Aggregates CSR participations month-by-month for the past 12 months.
        """
        today = timezone.now().date()
        one_year_ago = today - timedelta(days=365)

        trend = EmployeeParticipation.objects.filter(
            joined_date__date__range=(one_year_ago, today)
        ).annotate(
            month=TruncMonth('joined_date')
        ).values('month').annotate(
            total=Count('id')
        ).order_by('month')

        return [
            {
                'month': item['month'].strftime('%Y-%m') if item['month'] else None,
                'participations': item['total']
            }
            for item in trend
        ]

    @staticmethod
    def get_department_points_tracking():
        """
        Tracks total CSR points and training hours per department.
        """
        # Recalculate scores for all departments first
        for dept in Department.objects.all():
            SocialScoreService.recalculate_department_social_score(dept.id)

        scores = DepartmentSocialScore.objects.all().select_related('department')
        return [
            {
                'department_id': item.department.id,
                'department_name': item.department.name,
                'department_code': item.department.code,
                'total_csr_points': item.total_csr_points,
                'training_hours_per_employee': float(item.training_hours_per_employee),
                'social_score': float(item.score)
            }
            for item in scores
        ]

    @staticmethod
    def get_diversity_distribution():
        """
        Aggregated gender, age, and disability count from the latest metrics.
        """
        metrics = DiversityMetric.objects.all().order_by('-metric_date')
        
        seen_depts = set()
        latest_metrics = []
        for m in metrics:
            if m.department_id not in seen_depts:
                seen_depts.add(m.department_id)
                latest_metrics.append(m)
        
        total_male = 0
        total_female = 0
        total_disabilities = 0
        
        for m in latest_metrics:
            gender = m.gender_distribution or {}
            total_male += gender.get('male', 0)
            total_female += gender.get('female', 0)
            total_disabilities += m.disability_count
            
        return {
            'gender': {
                'male': total_male,
                'female': total_female
            },
            'disability_count': total_disabilities
        }



    @staticmethod
    def get_top_performing_departments(limit=5):
        """
        Lists top performing departments based on social score.
        """
        data = SocialDashboardService.get_department_points_tracking()
        sorted_data = sorted(data, key=lambda x: x['social_score'], reverse=True)
        return sorted_data[:limit]
