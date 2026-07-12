from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator
from users.models import Department, EmployeeProfile, Category

# Status Choices
STATUS_UPCOMING = 'upcoming'
STATUS_ACTIVE = 'active'
STATUS_COMPLETED = 'completed'
CSR_STATUS_CHOICES = [
    (STATUS_UPCOMING, 'Upcoming'),
    (STATUS_ACTIVE, 'Active'),
    (STATUS_COMPLETED, 'Completed'),
]

PARTICIPATION_PENDING = 'pending'
PARTICIPATION_APPROVED = 'approved'
PARTICIPATION_REJECTED = 'rejected'
PARTICIPATION_STATUS_CHOICES = [
    (PARTICIPATION_PENDING, 'Pending'),
    (PARTICIPATION_APPROVED, 'Approved'),
    (PARTICIPATION_REJECTED, 'Rejected'),
]

TRAINING_SCHEDULED = 'scheduled'
TRAINING_ONGOING = 'ongoing'
TRAINING_COMPLETED = 'completed'
TRAINING_STATUS_CHOICES = [
    (TRAINING_SCHEDULED, 'Scheduled'),
    (TRAINING_ONGOING, 'Ongoing'),
    (TRAINING_COMPLETED, 'Completed'),
]


class CSRActivity(models.Model):
    """
    Corporate Social Responsibility (CSR) activity model.
    """
    title = models.CharField(max_length=255, db_index=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        limit_choices_to={'type': 'csr_activities'},
        related_name='csr_activities'
    )
    description = models.TextField(blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField()
    points = models.PositiveIntegerField(default=10)
    status = models.CharField(
        max_length=20,
        choices=CSR_STATUS_CHOICES,
        default=STATUS_UPCOMING,
        db_index=True
    )

    class Meta:
        verbose_name = "CSR Activity"
        verbose_name_plural = "CSR Activities"
        ordering = ['-start_date']

    def clean(self):
        if self.start_date and self.end_date and self.start_date > self.end_date:
            raise ValidationError("End date must be on or after the start date.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.points} pts)"


class EmployeeParticipation(models.Model):
    """
    Tracks employee participation and evidence for CSR activities.
    """
    employee = models.ForeignKey(
        EmployeeProfile,
        on_delete=models.CASCADE,
        related_name='participations'
    )
    activity = models.ForeignKey(
        CSRActivity,
        on_delete=models.CASCADE,
        related_name='participations'
    )
    evidence = models.FileField(upload_to='evidence/', blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=PARTICIPATION_STATUS_CHOICES,
        default=PARTICIPATION_PENDING,
        db_index=True
    )
    points_awarded = models.PositiveIntegerField(default=0)
    joined_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Employee Participation"
        verbose_name_plural = "Employee Participations"
        unique_together = ('employee', 'activity')  # One participation per employee rule
        ordering = ['-joined_date']

    def clean(self):
        super().clean()
        # Business rule check: Evidence required if enabled in organization settings
        from users.services import OrganizationSettingsService
        settings = OrganizationSettingsService.get_settings()
        if settings.require_evidence and not self.evidence:
            raise ValidationError(
                "Evidence file upload is required as per global organization settings."
            )

    def save(self, *args, **kwargs):
        self.clean()
        # Business rule check: Points awarded after approval only
        if self.status == PARTICIPATION_APPROVED:
            self.points_awarded = self.activity.points
        else:
            self.points_awarded = 0
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.employee.employee_id} -> {self.activity.title} ({self.status})"


class Training(models.Model):
    """
    Corporate learning and training course tracking.
    """
    title = models.CharField(max_length=255, db_index=True)
    description = models.TextField(blank=True, null=True)
    trainer = models.CharField(max_length=255)
    start_date = models.DateField()
    end_date = models.DateField()
    duration_hours = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0.0)]
    )
    status = models.CharField(
        max_length=20,
        choices=TRAINING_STATUS_CHOICES,
        default=TRAINING_SCHEDULED,
        db_index=True
    )
    employees = models.ManyToManyField(
        EmployeeProfile,
        related_name='trainings',
        blank=True
    )

    class Meta:
        ordering = ['-start_date']

    def clean(self):
        if self.start_date and self.end_date and self.start_date > self.end_date:
            raise ValidationError("End date must be on or after the start date.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.duration_hours} hrs)"


class DiversityMetric(models.Model):
    """
    Demographics and diversity statistics for each department.
    """
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='diversity_metrics'
    )
    metric_date = models.DateField(db_index=True)
    gender_distribution = models.JSONField(default=dict)  # e.g., {"male": 10, "female": 8}
    age_distribution = models.JSONField(default=dict)     # e.g., {"20-30": 5, "30-40": 10, "40+": 3}
    disability_count = models.PositiveIntegerField(default=0)

    class Meta:
        verbose_name = "Diversity Metric"
        verbose_name_plural = "Diversity Metrics"
        ordering = ['-metric_date']
        indexes = [
            models.Index(fields=['department', 'metric_date']),
        ]

    def __str__(self):
        return f"{self.department.name} Diversity - {self.metric_date}"


class DepartmentSocialScore(models.Model):
    """
    Stores and ranks the social sustainability score per department.
    """
    department = models.OneToOneField(
        Department,
        on_delete=models.CASCADE,
        related_name='social_score'
    )
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=100.00
    )
    total_csr_points = models.PositiveIntegerField(default=0)
    training_hours_per_employee = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=0.00
    )
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-score']

    def __str__(self):
        return f"{self.department.name} Social Score: {self.score}"
