from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from django.utils import timezone

from users.models import EmployeeProfile, Department, Category


class Challenge(models.Model):
    """
    Challenge representing ESG tasks or goals employees can participate in.
    """
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name='challenges'
    )
    start_date = models.DateField()
    end_date = models.DateField()
    xp_reward = models.PositiveIntegerField(default=50)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active',
        db_index=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def clean(self):
        super().clean()
        if self.start_date and self.end_date and self.start_date > self.end_date:
            raise ValidationError("Start date must be before or equal to the end date.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.xp_reward} XP) - {self.status}"


class ChallengeParticipation(models.Model):
    """
    Tracks an employee joining and submitting evidence for a challenge.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    challenge = models.ForeignKey(
        Challenge,
        on_delete=models.CASCADE,
        related_name='participations'
    )
    employee = models.ForeignKey(
        EmployeeProfile,
        on_delete=models.CASCADE,
        related_name='challenge_participations'
    )
    joined_date = models.DateTimeField(auto_now_add=True)
    evidence = models.FileField(upload_to='challenge_evidence/', blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        db_index=True
    )
    approved_at = models.DateTimeField(blank=True, null=True)
    approved_by = models.ForeignKey(
        EmployeeProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_challenge_participations'
    )

    class Meta:
        unique_together = ('challenge', 'employee')
        ordering = ['-joined_date']

    def clean(self):
        super().clean()
        if self.challenge.status != 'active' and not self.pk:
            raise ValidationError("You can only join active challenges.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.employee.employee_id} in {self.challenge.title} ({self.status})"


class EmployeeXP(models.Model):
    """
    Stores total XP points and level for an employee.
    """
    employee = models.OneToOneField(
        EmployeeProfile,
        on_delete=models.CASCADE,
        related_name='gamification_xp'
    )
    xp = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    level = models.PositiveIntegerField(default=1)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-xp']

    def __str__(self):
        return f"{self.employee.employee_id} - {self.xp} XP (Level {self.level})"


class Badge(models.Model):
    """
    Represent badges unlocked by reaching certain XP milestones.
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    icon = models.CharField(max_length=100, db_index=True, default='emoji_events')
    criteria_xp = models.PositiveIntegerField(default=100)

    class Meta:
        ordering = ['criteria_xp']

    def __str__(self):
        return f"{self.name} (>= {self.criteria_xp} XP)"


class EmployeeBadge(models.Model):
    """
    Badges unlocked by employees.
    """
    employee = models.ForeignKey(
        EmployeeProfile,
        on_delete=models.CASCADE,
        related_name='badges'
    )
    badge = models.ForeignKey(
        Badge,
        on_delete=models.CASCADE,
        related_name='unlocked_by'
    )
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('employee', 'badge')
        ordering = ['-unlocked_at']

    def __str__(self):
        return f"{self.employee.employee_id} unlocked {self.badge.name}"


class Reward(models.Model):
    """
    Rewards that employees can buy using their accumulated XP points.
    """
    title = models.CharField(max_length=200)
    description = models.TextField()
    xp_cost = models.PositiveIntegerField(default=100)
    stock = models.IntegerField(default=10, validators=[MinValueValidator(0)])
    status = models.CharField(
        max_length=20,
        choices=[('active', 'Active'), ('inactive', 'Inactive')],
        default='active',
        db_index=True
    )

    class Meta:
        ordering = ['xp_cost']

    def __str__(self):
        return f"{self.title} ({self.xp_cost} XP)"


class RewardRedemption(models.Model):
    """
    Tracks redemption requests made by employees.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    reward = models.ForeignKey(
        Reward,
        on_delete=models.CASCADE,
        related_name='redemptions'
    )
    employee = models.ForeignKey(
        EmployeeProfile,
        on_delete=models.CASCADE,
        related_name='redemptions'
    )
    redeemed_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        db_index=True
    )
    approved_at = models.DateTimeField(blank=True, null=True)
    approved_by = models.ForeignKey(
        EmployeeProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_redemptions'
    )

    class Meta:
        ordering = ['-redeemed_at']

    def __str__(self):
        return f"{self.employee.employee_id} redeemed {self.reward.title} ({self.status})"


class EmployeeLeaderboard(models.Model):
    """
    Cached rank table for employee level comparisons.
    """
    employee = models.OneToOneField(
        EmployeeProfile,
        on_delete=models.CASCADE,
        related_name='leaderboard_rank'
    )
    rank = models.PositiveIntegerField(default=0)
    xp = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['rank']

    def __str__(self):
        return f"#{self.rank} - {self.employee.employee_id} ({self.xp} XP)"


class DepartmentLeaderboard(models.Model):
    """
    Cached rank table for department ESG ranking comparison.
    """
    department = models.OneToOneField(
        Department,
        on_delete=models.CASCADE,
        related_name='leaderboard_rank'
    )
    rank = models.PositiveIntegerField(default=0)
    total_xp = models.IntegerField(default=0)
    average_xp = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['rank']

    def __str__(self):
        return f"#{self.rank} - {self.department.code} (Avg: {self.average_xp})"
