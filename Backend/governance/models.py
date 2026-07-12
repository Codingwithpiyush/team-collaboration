from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.utils import timezone

from users.models import Department, EmployeeProfile


class Policy(models.Model):
    """
    Policy model representing governance regulations, guidelines, or standards.
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('archived', 'Archived'),
    ]

    title = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True, db_index=True)
    description = models.TextField()
    version = models.CharField(max_length=20, default="1.0")
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        db_index=True
    )
    owner = models.ForeignKey(
        EmployeeProfile,
        on_delete=models.PROTECT,
        related_name='owned_policies'
    )  # Owner mandatory
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_policies'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Policies"
        ordering = ['code']

    def __str__(self):
        return f"{self.title} (v{self.version}) - {self.status}"


class PolicyAcknowledgement(models.Model):
    """
    Tracks policy acknowledgements by employees. One acknowledgement per employee per policy version.
    """
    policy = models.ForeignKey(
        Policy,
        on_delete=models.CASCADE,
        related_name='acknowledgements'
    )
    employee = models.ForeignKey(
        EmployeeProfile,
        on_delete=models.CASCADE,
        related_name='policy_acknowledgements'
    )
    acknowledged_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('policy', 'employee')
        ordering = ['-acknowledged_at']

    def clean(self):
        super().clean()
        if self.policy.status != 'active':
            raise ValidationError("Acknowledgements can only be recorded for active policies.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.employee.employee_id} acknowledged {self.policy.code}"


class Audit(models.Model):
    """
    Audit model for tracking compliance audits and scores across departments.
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
    ]

    title = models.CharField(max_length=200)
    scope = models.TextField()
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='audits'
    )
    auditor = models.ForeignKey(
        EmployeeProfile,
        on_delete=models.PROTECT,
        related_name='conducted_audits'
    )
    audit_date = models.DateField()
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0.00), MaxValueValidator(100.00)]
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        db_index=True
    )
    findings = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-audit_date']

    def __str__(self):
        return f"{self.title} - {self.department.name} ({self.score}%)"


class ComplianceIssue(models.Model):
    """
    Compliance issue logged for a department with due date and resolution tracking.
    """
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]

    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('overdue', 'Overdue'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    severity = models.CharField(
        max_length=20,
        choices=SEVERITY_CHOICES,
        default='medium',
        db_index=True
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='open',
        db_index=True
    )
    assigned_to = models.ForeignKey(
        EmployeeProfile,
        on_delete=models.PROTECT,
        related_name='assigned_issues'
    )  # Owner/assigned_to mandatory
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='compliance_issues'
    )
    due_date = models.DateField()  # Due date mandatory
    resolution_notes = models.TextField(blank=True, null=True)
    resolved_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def clean(self):
        super().clean()
        # Auto flag as overdue if past due date and not resolved
        if self.status != 'resolved' and self.due_date and self.due_date < timezone.now().date():
            self.status = 'overdue'

    def save(self, *args, **kwargs):
        self.clean()
        if self.status == 'resolved' and not self.resolved_at:
            self.resolved_at = timezone.now()
        elif self.status != 'resolved':
            self.resolved_at = None
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} - {self.department.code} ({self.status})"


class DepartmentGovernanceScore(models.Model):
    """
    Tracks aggregated governance indicators and compliance score per department.
    """
    department = models.OneToOneField(
        Department,
        on_delete=models.CASCADE,
        related_name='governance_score'
    )
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=100.00,
        validators=[MinValueValidator(0.00), MaxValueValidator(100.00)]
    )
    policy_acknowledgement_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00
    )
    open_issues_count = models.IntegerField(default=0)
    average_audit_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00
    )
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-score']

    def __str__(self):
        return f"{self.department.name} - Gov Score: {self.score}"
