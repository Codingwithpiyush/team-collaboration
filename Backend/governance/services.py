from django.db import transaction
from django.db.models import Avg, Count, Sum
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal

from users.models import Department, EmployeeProfile
from .models import (
    Policy,
    PolicyAcknowledgement,
    Audit,
    ComplianceIssue,
    DepartmentGovernanceScore
)


class PolicyService:
    @staticmethod
    @transaction.atomic
    def create_new_version(policy, new_version, user):
        """
        Creates a new draft version of a policy and archives the previous version.
        """
        if policy.version == new_version:
            raise ValidationError(f"Version {new_version} already exists. Please specify a new version number.")

        # Archive the previous version
        policy.status = 'archived'
        policy.save()

        # Create new version as a draft
        new_policy = Policy.objects.create(
            title=policy.title,
            code=policy.code,
            description=policy.description,
            version=new_version,
            status='draft',
            owner=policy.owner,
            created_by=user
        )
        return new_policy

    @staticmethod
    @transaction.atomic
    def acknowledge_policy(employee, policy):
        """
        Records that an employee has acknowledged a policy.
        """
        if PolicyAcknowledgement.objects.filter(employee=employee, policy=policy).exists():
            raise ValidationError("This policy version has already been acknowledged by the employee.")

        ack = PolicyAcknowledgement(employee=employee, policy=policy)
        ack.full_clean()
        ack.save()

        # Recalculate department score
        GovernanceScoreService.recalculate_department_governance_score(employee.department_id)
        return ack


class ComplianceService:
    @staticmethod
    @transaction.atomic
    def assign_issue(issue, employee):
        """
        Assigns a compliance issue to an employee.
        """
        issue.assigned_to = employee
        issue.status = 'in_progress'
        issue.save()
        return issue

    @staticmethod
    @transaction.atomic
    def resolve_issue(issue, resolution_notes):
        """
        Resolves a compliance issue.
        """
        if not resolution_notes:
            raise ValidationError("Resolution notes must be provided to close an issue.")
        issue.status = 'resolved'
        issue.resolution_notes = resolution_notes
        issue.save()

        # Recalculate department score
        GovernanceScoreService.recalculate_department_governance_score(issue.department_id)
        return issue

    @staticmethod
    def check_and_flag_overdue_issues():
        """
        Scans all unresolved compliance issues past their due dates and flags them as overdue.
        """
        today = timezone.now().date()
        overdue_issues = ComplianceIssue.objects.filter(
            due_date__lt=today
        ).exclude(status='resolved')
        
        updated_count = 0
        for issue in overdue_issues:
            if issue.status != 'overdue':
                issue.status = 'overdue'
                issue.save()
                updated_count += 1
                GovernanceScoreService.recalculate_department_governance_score(issue.department_id)
        return updated_count


class GovernanceScoreService:
    @staticmethod
    def recalculate_department_governance_score(department_id):
        """
        Computes the Governance sustainability score for a department.
        """
        if not department_id:
            return None

        try:
            dept = Department.objects.get(pk=department_id)
        except Department.DoesNotExist:
            return None

        # First, ensure all overdue compliance issues are flagged
        ComplianceService.check_and_flag_overdue_issues()

        active_policies = Policy.objects.filter(status='active')
        n_policies = active_policies.count()

        dept_employees = EmployeeProfile.objects.filter(department=dept, status='active')
        n_employees = dept_employees.count()

        # 1. Policy Acknowledgement Rate
        total_possible_acks = n_policies * n_employees
        if total_possible_acks == 0:
            ack_rate = Decimal('100.00')
        else:
            actual_acks = PolicyAcknowledgement.objects.filter(
                policy__in=active_policies,
                employee__in=dept_employees
            ).count()
            ack_rate = (Decimal(str(actual_acks)) / Decimal(str(total_possible_acks))) * Decimal('100.00')

        # 2. Average Audit Score
        avg_audit = Audit.objects.filter(
            department=dept,
            status='published'
        ).aggregate(Avg('score'))['score__avg']
        
        # If no audits exist, default to 100
        avg_audit_score = Decimal(str(avg_audit)) if avg_audit is not None else Decimal('100.00')

        # 3. Compliance Issue Penalties
        open_issues = ComplianceIssue.objects.filter(
            department=dept,
            status__in=['open', 'in_progress', 'overdue']
        )
        n_open_issues = open_issues.count()
        n_overdue_issues = open_issues.filter(status='overdue').count()

        # Score formulation:
        # Audit Score carries 60% weight
        # Acknowledgement rate carries 40% weight
        # Penalty: -2 points per open issue, -5 points per overdue issue
        weighted_audit = avg_audit_score * Decimal('0.60')
        weighted_ack = ack_rate * Decimal('0.40')
        penalties = (Decimal(str(n_open_issues)) * Decimal('2.00')) + (Decimal(str(n_overdue_issues)) * Decimal('5.00'))

        final_score = weighted_audit + weighted_ack - penalties
        final_score = max(Decimal('0.00'), min(Decimal('100.00'), final_score))

        score_rec, created = DepartmentGovernanceScore.objects.get_or_create(
            department=dept,
            defaults={
                'score': final_score,
                'policy_acknowledgement_rate': ack_rate,
                'open_issues_count': n_open_issues,
                'average_audit_score': avg_audit_score
            }
        )
        if not created:
            score_rec.score = final_score
            score_rec.policy_acknowledgement_rate = ack_rate
            score_rec.open_issues_count = n_open_issues
            score_rec.average_audit_score = avg_audit_score
            score_rec.save()

        return score_rec


class GovernanceDashboardService:
    @staticmethod
    def get_policy_acknowledgement_rates():
        """
        Returns average acknowledgement rates per active policy.
        """
        active_policies = Policy.objects.filter(status='active')
        total_employees = EmployeeProfile.objects.filter(status='active').count()
        total_employees_count = max(1, total_employees)

        rates = []
        for policy in active_policies:
            ack_count = policy.acknowledgements.count()
            rate = (Decimal(str(ack_count)) / Decimal(str(total_employees_count))) * Decimal('100.00')
            rates.append({
                'policy_code': policy.code,
                'policy_title': policy.title,
                'acknowledgements': ack_count,
                'total_employees': total_employees_count,
                'rate': float(rate)
            })
        return rates

    @staticmethod
    def get_compliance_issue_stats():
        """
        Aggregates counts of compliance issues grouped by status and severity.
        """
        # Ensure overdue checks run
        ComplianceService.check_and_flag_overdue_issues()

        status_counts = ComplianceIssue.objects.values('status').annotate(total=Count('id'))
        severity_counts = ComplianceIssue.objects.values('severity').annotate(total=Count('id'))

        stats = {
            'by_status': {item['status']: item['total'] for item in status_counts},
            'by_severity': {item['severity']: item['total'] for item in severity_counts}
        }
        # Fill missing keys to ensure consistent frontend layout
        for st in ['open', 'in_progress', 'resolved', 'overdue']:
            stats['by_status'].setdefault(st, 0)
        for sev in ['low', 'medium', 'high', 'critical']:
            stats['by_severity'].setdefault(sev, 0)

        return stats

    @staticmethod
    def get_audit_trends():
        """
        Fetches latest 10 published audits for corporate performance tracking.
        """
        audits = Audit.objects.filter(status='published').select_related('department').order_by('-audit_date')[:10]
        return [
            {
                'audit_title': audit.title,
                'department_name': audit.department.name,
                'score': float(audit.score),
                'audit_date': audit.audit_date.strftime('%Y-%m-%d')
            }
            for audit in audits
        ]

    @staticmethod
    def get_department_score_tracking():
        """
        Recalculates and lists score details for all departments.
        """
        for dept in Department.objects.all():
            GovernanceScoreService.recalculate_department_governance_score(dept.id)

        scores = DepartmentGovernanceScore.objects.all().select_related('department')
        return [
            {
                'department_id': item.department.id,
                'department_name': item.department.name,
                'department_code': item.department.code,
                'score': float(item.score),
                'policy_acknowledgement_rate': float(item.policy_acknowledgement_rate),
                'open_issues_count': item.open_issues_count,
                'average_audit_score': float(item.average_audit_score)
            }
            for item in scores
        ]

    @staticmethod
    def get_top_performing_departments(limit=5):
        """
        Gets top departments by Governance score.
        """
        data = GovernanceDashboardService.get_department_score_tracking()
        sorted_data = sorted(data, key=lambda x: x['score'], reverse=True)
        return sorted_data[:limit]
