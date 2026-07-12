from django.db import transaction
from django.db.models import Avg, Sum
from django.core.exceptions import ValidationError
from django.utils import timezone
from decimal import Decimal

from users.models import EmployeeProfile, Department
from .models import (
    Challenge,
    ChallengeParticipation,
    EmployeeXP,
    Badge,
    EmployeeBadge,
    Reward,
    RewardRedemption,
    EmployeeLeaderboard,
    DepartmentLeaderboard
)


class XPEngine:
    @staticmethod
    @transaction.atomic
    def add_xp(employee, amount):
        """
        Adds XP to the employee, recalculates level, and evaluates badge unlocks.
        """
        if amount <= 0:
            return None

        emp_xp, created = EmployeeXP.objects.get_or_create(
            employee=employee,
            defaults={'xp': 0, 'level': 1}
        )
        emp_xp.xp += amount
        # Simple leveling rule: 100 XP per level
        emp_xp.level = (emp_xp.xp // 100) + 1
        emp_xp.save()

        # Check badge unlocks
        BadgeEngine.evaluate_badges(employee)

        # Trigger leaderboard update
        LeaderboardService.recalculate_leaderboards()
        return emp_xp

    @staticmethod
    @transaction.atomic
    def deduct_xp(employee, amount):
        """
        Deducts XP from the employee (e.g. for rewards), ensuring it doesn't go below 0.
        """
        if amount <= 0:
            return None

        emp_xp, created = EmployeeXP.objects.get_or_create(
            employee=employee,
            defaults={'xp': 0, 'level': 1}
        )

        if emp_xp.xp < amount:
            raise ValidationError(f"Insufficient XP. Employee has {emp_xp.xp} XP, but reward costs {amount} XP.")

        emp_xp.xp -= amount
        emp_xp.level = (emp_xp.xp // 100) + 1
        emp_xp.save()

        # Trigger leaderboard update
        LeaderboardService.recalculate_leaderboards()
        return emp_xp


class BadgeEngine:
    @staticmethod
    @transaction.atomic
    def evaluate_badges(employee):
        """
        Checks all badges and awards ones where employee's XP meets the criteria.
        """
        emp_xp, _ = EmployeeXP.objects.get_or_create(
            employee=employee,
            defaults={'xp': 0, 'level': 1}
        )

        # Find eligible badges
        eligible_badges = Badge.objects.filter(criteria_xp__lte=emp_xp.xp)
        
        unlocked_badges = []
        for badge in eligible_badges:
            # Award badge if not already unlocked
            eb, created = EmployeeBadge.objects.get_or_create(
                employee=employee,
                badge=badge
            )
            if created:
                unlocked_badges.append(eb)
        return unlocked_badges


class ChallengeService:
    @staticmethod
    @transaction.atomic
    def join_challenge(employee, challenge_id):
        """
        Registers an employee for a challenge.
        """
        try:
            challenge = Challenge.objects.get(pk=challenge_id)
        except Challenge.DoesNotExist:
            raise ValidationError("Challenge not found.")

        if ChallengeParticipation.objects.filter(employee=employee, challenge=challenge).exists():
            raise ValidationError("Employee has already joined this challenge.")

        participation = ChallengeParticipation(
            employee=employee,
            challenge=challenge,
            status='pending'
        )
        participation.full_clean()
        participation.save()
        return participation

    @staticmethod
    @transaction.atomic
    def approve_participation(participation, approved_by):
        """
        Approves challenge evidence and awards XP to the employee.
        """
        if participation.status == 'approved':
            raise ValidationError("Participation is already approved.")

        participation.status = 'approved'
        participation.approved_at = timezone.now()
        participation.approved_by = approved_by
        participation.save()

        # Add XP to employee
        XPEngine.add_xp(participation.employee, participation.challenge.xp_reward)
        return participation

    @staticmethod
    @transaction.atomic
    def reject_participation(participation, approved_by):
        """
        Rejects challenge participation.
        """
        participation.status = 'rejected'
        participation.approved_at = timezone.now()
        participation.approved_by = approved_by
        participation.save()
        return participation


class RewardService:
    @staticmethod
    @transaction.atomic
    def redeem_reward(employee, reward_id):
        """
        Redeems a reward, checks stock, and immediately deducts employee XP.
        """
        try:
            reward = Reward.objects.get(pk=reward_id)
        except Reward.DoesNotExist:
            raise ValidationError("Reward not found.")

        if reward.status != 'active':
            raise ValidationError("This reward is currently inactive.")

        if reward.stock <= 0:
            raise ValidationError("This reward is out of stock.")

        # Deduct XP (raises ValidationError if not enough XP)
        XPEngine.deduct_xp(employee, reward.xp_cost)

        # Decrement stock
        reward.stock -= 1
        reward.save()

        # Create redemption request
        redemption = RewardRedemption.objects.create(
            employee=employee,
            reward=reward,
            status='pending'
        )
        return redemption

    @staticmethod
    @transaction.atomic
    def approve_redemption(redemption, approved_by):
        """
        Approves a reward redemption request.
        """
        if redemption.status != 'pending':
            raise ValidationError("Only pending redemptions can be approved.")

        redemption.status = 'approved'
        redemption.approved_at = timezone.now()
        redemption.approved_by = approved_by
        redemption.save()
        return redemption

    @staticmethod
    @transaction.atomic
    def reject_redemption(redemption, approved_by):
        """
        Rejects a reward redemption, refunding the XP cost and restoring stock.
        """
        if redemption.status != 'pending':
            raise ValidationError("Only pending redemptions can be rejected.")

        redemption.status = 'rejected'
        redemption.approved_at = timezone.now()
        redemption.approved_by = approved_by
        redemption.save()

        # Restore stock
        reward = redemption.reward
        reward.stock += 1
        reward.save()

        # Refund XP to employee
        XPEngine.add_xp(redemption.employee, reward.xp_cost)
        return redemption


class LeaderboardService:
    @staticmethod
    @transaction.atomic
    def recalculate_leaderboards():
        """
        Updates cached ranks for EmployeeLeaderboard and DepartmentLeaderboard.
        """
        # 1. Update Employee Rankings
        # Get all active employees
        active_employees = EmployeeProfile.objects.filter(status='active')
        
        # Ensure they all have EmployeeXP records
        for emp in active_employees:
            EmployeeXP.objects.get_or_create(
                employee=emp,
                defaults={'xp': 0, 'level': 1}
            )

        # Retrieve and sort all EmployeeXP records
        employee_xps = EmployeeXP.objects.filter(employee__status='active').order_by('-xp', 'employee__employee_id')
        
        # Re-rank employees
        for index, emp_xp in enumerate(employee_xps):
            rank = index + 1
            el, created = EmployeeLeaderboard.objects.get_or_create(
                employee=emp_xp.employee,
                defaults={'rank': rank, 'xp': emp_xp.xp}
            )
            if not created:
                el.rank = rank
                el.xp = emp_xp.xp
                el.save()

        # 2. Update Department Rankings
        departments = Department.objects.filter(status='active')
        dept_scores = []
        for dept in departments:
            # Get XP totals for employees in this department
            emp_xps = EmployeeXP.objects.filter(
                employee__department=dept,
                employee__status='active'
            )
            
            agg = emp_xps.aggregate(total=Sum('xp'), avg=Avg('xp'))
            total_xp = agg['total'] or 0
            # Average XP defaults to 0.00 if no active employees in department
            avg_xp = Decimal(str(agg['avg'])) if agg['avg'] is not None else Decimal('0.00')
            
            dept_scores.append({
                'department': dept,
                'total_xp': total_xp,
                'avg_xp': avg_xp
            })

        # Sort departments by average XP descending, then total XP descending
        dept_scores.sort(key=lambda x: (x['avg_xp'], x['total_xp']), reverse=True)

        for index, item in enumerate(dept_scores):
            rank = index + 1
            dl, created = DepartmentLeaderboard.objects.get_or_create(
                department=item['department'],
                defaults={'rank': rank, 'total_xp': item['total_xp'], 'average_xp': item['avg_xp']}
            )
            if not created:
                dl.rank = rank
                dl.total_xp = item['total_xp']
                dl.average_xp = item['avg_xp']
                dl.save()
