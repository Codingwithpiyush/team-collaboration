from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
import re

# Choices
STATUS_ACTIVE = 'active'
STATUS_INACTIVE = 'inactive'
STATUS_CHOICES = [
    (STATUS_ACTIVE, 'Active'),
    (STATUS_INACTIVE, 'Inactive'),
]

TYPE_CSR = 'csr_activities'
TYPE_CHALLENGE = 'challenges'
TYPE_CHOICES = [
    (TYPE_CSR, 'CSR Activities'),
    (TYPE_CHALLENGE, 'Challenges'),
]


class Department(models.Model):
    """
    Department model acting as master data for the ESG platform.
    Supports parent-child hierarchy.
    """
    name = models.CharField(max_length=255, db_index=True)
    code = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        validators=[
            RegexValidator(
                regex=r'^[A-Z0-9_-]+$',
                message="Code must contain only uppercase alphanumeric characters, underscores, or hyphens."
            )
        ]
    )
    head = models.ForeignKey(
        'EmployeeProfile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='headed_departments'
    )
    parent_department = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sub_departments'
    )
    employee_count = models.PositiveIntegerField(default=0, db_index=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_ACTIVE,
        db_index=True
    )

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['code', 'status']),
            models.Index(fields=['parent_department', 'status']),
        ]

    def __str__(self):
        return f"{self.name} ({self.code})"

    def clean(self):
        # Prevent self-parenting
        if self.parent_department_id and self.pk == self.parent_department_id:
            raise ValidationError("A department cannot be its own parent.")
        
        # Prevent circular parent-child reference
        if self.parent_department:
            current = self.parent_department
            visited = set()
            if self.pk:
                visited.add(self.pk)
            while current:
                if current.pk in visited:
                    raise ValidationError("Circular dependency detected in department hierarchy.")
                visited.add(current.pk)
                current = current.parent_department

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)


class Category(models.Model):
    """
    Category model acting as master data for CSR activities and challenges.
    """
    name = models.CharField(max_length=255, db_index=True)
    type = models.CharField(
        max_length=50,
        choices=TYPE_CHOICES,
        db_index=True
    )
    description = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_ACTIVE,
        db_index=True
    )

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
        indexes = [
            models.Index(fields=['type', 'status']),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"


class EmployeeProfile(models.Model):
    """
    EmployeeProfile model extending standard Django User.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile'
    )
    employee_id = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        validators=[
            RegexValidator(
                regex=r'^[a-zA-Z0-9_-]+$',
                message="Employee ID must contain only alphanumeric characters, underscores, or hyphens."
            )
        ]
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employees'
    )
    designation = models.CharField(max_length=100, blank=True, null=True)
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
            )
        ]
    )
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    joining_date = models.DateField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_ACTIVE,
        db_index=True
    )

    class Meta:
        ordering = ['employee_id']
        indexes = [
            models.Index(fields=['employee_id', 'status']),
            models.Index(fields=['department', 'status']),
        ]

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.employee_id})"


class OrganizationSettings(models.Model):
    """
    Singleton model for ESG platform configurations.
    """
    environment_weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=33.33
    )
    social_weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=33.33
    )
    governance_weight = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=33.34
    )
    auto_emission_calculation = models.BooleanField(default=False)
    require_evidence = models.BooleanField(default=True)
    auto_badge_unlock = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Organization Settings"
        verbose_name_plural = "Organization Settings"

    def clean(self):
        # Validate weights sum to exactly 100
        total_weight = (
            self.environment_weight +
            self.social_weight +
            self.governance_weight
        )
        if total_weight != 100.00:
            raise ValidationError(
                f"Weights must sum to exactly 100.00. Currently they sum to {total_weight}."
            )

    def save(self, *args, **kwargs):
        self.clean()
        # Enforce singleton pattern at the database level
        if not self.pk and OrganizationSettings.objects.exists():
            raise ValidationError("Only one instance of Organization Settings is allowed.")
        super().save(*args, **kwargs)

    def __str__(self):
        return "Organization Global Settings"


class NotificationSettings(models.Model):
    """
    Notification preferences per employee.
    """
    employee = models.OneToOneField(
        EmployeeProfile,
        on_delete=models.CASCADE,
        related_name='notification_settings'
    )
    email_notifications = models.BooleanField(default=True)
    badge_notifications = models.BooleanField(default=True)
    csr_notifications = models.BooleanField(default=True)
    challenge_notifications = models.BooleanField(default=True)
    policy_notifications = models.BooleanField(default=True)
    compliance_notifications = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Notification Settings"
        verbose_name_plural = "Notification Settings"

    def __str__(self):
        return f"Notification Settings for {self.employee.employee_id}"
