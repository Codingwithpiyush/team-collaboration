from django.db.models import Sum, Avg, Count
from django.utils import timezone
from decimal import Decimal

from users.models import Department, EmployeeProfile, OrganizationSettings
from environmental.models import CarbonTransaction, EnvironmentalGoal, DepartmentEnvironmentalScore
from social.models import EmployeeParticipation, CSRActivity, DepartmentSocialScore
from governance.models import Policy, PolicyAcknowledgement, Audit, ComplianceIssue, DepartmentGovernanceScore
from gamification.models import EmployeeXP, ChallengeParticipation, Challenge


class ExecutiveDashboardService:

    @staticmethod
    def get_dashboard_data(employee=None):
        """
        Gathers all ESG summary KPIs, department rankings, carbon trends, CSR and challenge statistics,
        compliance status summaries, and recent activity logs.
        """
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

        # 2. Score Averages
        avg_env = DepartmentEnvironmentalScore.objects.aggregate(avg=Avg('score'))['avg'] or Decimal('100.00')
        avg_soc = DepartmentSocialScore.objects.aggregate(avg=Avg('score'))['avg'] or Decimal('100.00')
        avg_gov = DepartmentGovernanceScore.objects.aggregate(avg=Avg('score'))['avg'] or Decimal('100.00')

        avg_env = Decimal(str(avg_env))
        avg_soc = Decimal(str(avg_soc))
        avg_gov = Decimal(str(avg_gov))

        overall_esg = (avg_env * env_w + avg_soc * soc_w + avg_gov * gov_w) / Decimal('100.00')

        # 3. Department ESG Rankings
        departments = Department.objects.filter(status='active')
        dept_rankings = []
        for dept in departments:
            env_s = DepartmentEnvironmentalScore.objects.filter(department=dept).first()
            soc_s = DepartmentSocialScore.objects.filter(department=dept).first()
            gov_s = DepartmentGovernanceScore.objects.filter(department=dept).first()

            e_val = env_s.score if env_s else Decimal('100.00')
            s_val = soc_s.score if soc_s else Decimal('100.00')
            g_val = gov_s.score if gov_s else Decimal('100.00')

            esg_score = (e_val * env_w + s_val * soc_w + g_val * gov_w) / Decimal('100.00')

            dept_rankings.append({
                'id': dept.id,
                'name': dept.name,
                'code': dept.code,
                'environmental_score': float(e_val),
                'social_score': float(s_val),
                'governance_score': float(g_val),
                'overall_esg_score': float(esg_score)
            })

        # Sort department rankings by overall ESG score desc
        dept_rankings.sort(key=lambda x: x['overall_esg_score'], reverse=True)
        for index, item in enumerate(dept_rankings):
            item['rank'] = index + 1

        # 4. Recent Activities (Merged timeline logs)
        recent_txs = CarbonTransaction.objects.select_related('department').order_by('-transaction_date')[:5]
        recent_csrs = EmployeeParticipation.objects.select_related('employee__user', 'activity').order_by('-joined_date')[:5]
        recent_issues = ComplianceIssue.objects.select_related('department').order_by('-created_at')[:5]

        activities = []
        for tx in recent_txs:
            activities.append({
                'type': 'environmental',
                'description': f"Carbon transaction logged: {tx.activity_type} - {float(tx.calculated_co2)} kg CO2",
                'timestamp': tx.transaction_date.strftime('%Y-%m-%d'),
                'department': tx.department.name
            })
        for p in recent_csrs:
            activities.append({
                'type': 'social',
                'description': f"{p.employee.user.get_full_name()} joined CSR: {p.activity.title}",
                'timestamp': p.joined_date.strftime('%Y-%m-%d') if p.joined_date else '',
                'department': p.employee.department.name if p.employee.department else 'N/A'
            })
        for issue in recent_issues:
            activities.append({
                'type': 'governance',
                'description': f"Compliance issue registered: {issue.title} ({issue.severity})",
                'timestamp': issue.created_at.strftime('%Y-%m-%d') if issue.created_at else '',
                'department': issue.department.name
            })
        # Sort combined activities by timestamp desc
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        activities = activities[:8]

        # 5. Carbon Trend (Aggregated emissions by activity category over time)
        carbon_trend = CarbonTransaction.objects.values('activity_type').annotate(total_co2=Sum('calculated_co2')).order_by('-total_co2')
        trend_data = [
            {'category': item['activity_type'], 'emissions': float(item['total_co2'] or 0.0)}
            for item in carbon_trend
        ]

        # 6. Monthly Trend (Carbon emissions history by transaction dates)
        monthly_txs = CarbonTransaction.objects.values('transaction_date').annotate(total_co2=Sum('calculated_co2')).order_by('-transaction_date')[:12]
        monthly_trend = [
            {'date': item['transaction_date'].strftime('%Y-%m-%d'), 'emissions': float(item['total_co2'] or 0.0)}
            for item in monthly_txs
        ]

        # 7. CSR Statistics
        csr_total = CSRActivity.objects.count()
        csr_active = CSRActivity.objects.filter(status='active').count()
        csr_completed = CSRActivity.objects.filter(status='completed').count()
        csr_pts = EmployeeParticipation.objects.filter(status='approved').aggregate(total=Sum('points_awarded'))['total'] or 0

        csr_stats = {
            'total_activities': csr_total,
            'active_activities': csr_active,
            'completed_activities': csr_completed,
            'total_points_awarded': csr_pts
        }

        # 8. Challenge Statistics
        challenge_total = Challenge.objects.count()
        challenge_active = Challenge.objects.filter(status='active').count()
        challenge_participations = ChallengeParticipation.objects.count()

        challenge_stats = {
            'total_challenges': challenge_total,
            'active_challenges': challenge_active,
            'total_participations': challenge_participations
        }

        # 9. Leaderboard Preview
        leaderboard_queryset = EmployeeXP.objects.select_related('employee__user', 'employee__department').order_by('-xp')[:5]
        leaderboard_preview = [
            {
                'employee_name': item.employee.user.get_full_name(),
                'department': item.employee.department.name if item.employee.department else 'N/A',
                'xp': item.xp,
                'level': item.level
            }
            for item in leaderboard_queryset
        ]

        # 10. Compliance Summary
        compliance_summary = {
            'total_issues': ComplianceIssue.objects.count(),
            'open_issues': ComplianceIssue.objects.filter(status='open').count(),
            'in_progress': ComplianceIssue.objects.filter(status='in_progress').count(),
            'resolved': ComplianceIssue.objects.filter(status='resolved').count(),
            'overdue': ComplianceIssue.objects.filter(status='overdue').count(),
        }

        # 11. Goal Progress
        active_goals = EnvironmentalGoal.objects.filter(status='active').select_related('department')[:5]
        goal_progress = []
        for goal in active_goals:
            target = goal.target_value
            current = goal.current_value
            pct = (current / target * Decimal('100.0')) if target > 0 else Decimal('0.0')
            goal_progress.append({
                'goal_name': goal.name,
                'department': goal.department.name if goal.department else 'Corporate',
                'target': float(target),
                'current': float(current),
                'percentage': float(pct)
            })

        # 12. Quick Actions
        quick_actions = [
            {'title': 'Log Carbon Activity', 'action_url': '/api/environmental/transactions/', 'module': 'environmental'},
            {'title': 'Join CSR Activity', 'action_url': '/api/social/activities/', 'module': 'social'},
            {'title': 'Acknowledge Policy', 'action_url': '/api/governance/policies/', 'module': 'governance'},
            {'title': 'Join Challenge', 'action_url': '/api/gamification/challenges/', 'module': 'gamification'}
        ]

        # 13. Notification Alerts / Summary
        pending_policies = Policy.objects.filter(status='active')
        open_compliance = ComplianceIssue.objects.filter(status='open')
        open_challenges = Challenge.objects.filter(status='active')

        if employee:
            # Filter notification metrics relative to this employee
            acked_policies = PolicyAcknowledgement.objects.filter(employee=employee).values_list('policy_id', flat=True)
            pending_policies_count = pending_policies.exclude(id__in=acked_policies).count()
            open_compliance_count = open_compliance.filter(assigned_to=employee).count()
        else:
            pending_policies_count = pending_policies.count()
            open_compliance_count = open_compliance.count()

        notification_summary = {
            'pending_policies_to_acknowledge': pending_policies_count,
            'assigned_open_compliance_issues': open_compliance_count,
            'active_challenges_open': open_challenges.count()
        }

        return {
            'card_scores': {
                'environmental_average_score': float(avg_env),
                'social_average_score': float(avg_soc),
                'governance_average_score': float(avg_gov),
                'overall_esg_score': float(overall_esg),
                'weights': {
                    'environmental': float(env_w),
                    'social': float(soc_w),
                    'governance': float(gov_w)
                }
            },
            'top_departments': dept_rankings[:3],
            'top_employees': leaderboard_preview[:3],
            'department_rankings': dept_rankings,
            'recent_activities': activities,
            'carbon_trend': trend_data,
            'monthly_trend': monthly_trend,
            'csr_statistics': csr_stats,
            'challenge_statistics': challenge_stats,
            'leaderboard_preview': leaderboard_preview,
            'compliance_summary': compliance_summary,
            'goal_progress': goal_progress,
            'quick_actions': quick_actions,
            'notification_summary': notification_summary
        }
