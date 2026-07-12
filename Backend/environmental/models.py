from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import Department, EmployeeProfile

# Status choices
STATUS_ACTIVE = 'active'
STATUS_INACTIVE = 'inactive'
STATUS_CHOICES = [
    (STATUS_ACTIVE, 'Active'),
    (STATUS_INACTIVE, 'Inactive'),
]

GOAL_ACTIVE = 'active'
GOAL_ACHIEVED = 'achieved'
GOAL_FAILED = 'failed'
GOAL_CANCELLED = 'cancelled'
GOAL_STATUS_CHOICES = [
    (GOAL_ACTIVE, 'Active'),
    (GOAL_ACHIEVED, 'Achieved'),
    (GOAL_FAILED, 'Failed'),
    (GOAL_CANCELLED, 'Cancelled'),
]

TARGET_CARBON = 'carbon_reduction'
TARGET_WATER = 'water_saving'
TARGET_WASTE = 'waste_reduction'
TARGET_CHOICES = [
    (TARGET_CARBON, 'Carbon Reduction'),
    (TARGET_WATER, 'Water Saving'),
    (TARGET_WASTE, 'Waste Reduction'),
]


class EmissionFactor(models.Model):
    """
    Emission factors defining CO2 output per unit of activity.
    """
    name = models.CharField(max_length=255, db_index=True)
    category = models.CharField(max_length=100, db_index=True)  # e.g., electricity, travel, waste, fuel
    factor = models.DecimalField(
        max_digits=12,
        decimal_places=6,
        validators=[MinValueValidator(0.0)]
    )  # CO2 emitted per unit
    unit = models.CharField(max_length=50)  # e.g., kWh, km, kg, liters
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_ACTIVE,
        db_index=True
    )

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['category', 'status']),
        ]

    def __str__(self):
        return f"{self.name} ({self.factor} CO2/{self.unit})"

    def delete(self, *args, **kwargs):
        # Business rule check: cannot be deleted if used in transactions
        if self.transactions.exists():
            raise ValidationError("This Emission Factor is currently used in transactions and cannot be deleted.")
        super().delete(*args, **kwargs)


class ProductESGProfile(models.Model):
    """
    Environmental footprint profile for manufactured/distributed products.
    """
    product_name = models.CharField(max_length=255, db_index=True)
    sku = models.CharField(max_length=100, unique=True, db_index=True)
    carbon_footprint = models.DecimalField(
        max_digits=12,
        decimal_places=4,
        validators=[MinValueValidator(0.0)]
    )  # kg CO2e
    water_footprint = models.DecimalField(
        max_digits=12,
        decimal_places=4,
        validators=[MinValueValidator(0.0)]
    )  # Liters
    recyclability_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)]
    )  # Percentage (0 - 100)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_ACTIVE,
        db_index=True
    )

    class Meta:
        ordering = ['product_name']
        indexes = [
            models.Index(fields=['sku', 'status']),
        ]

    def __str__(self):
        return f"{self.product_name} ({self.sku})"


class EnvironmentalGoal(models.Model):
    """
    Departmental or organizational sustainability target goals.
    """
    name = models.CharField(max_length=255)
    target_type = models.CharField(
        max_length=50,
        choices=TARGET_CHOICES,
        db_index=True
    )
    target_value = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        validators=[MinValueValidator(0.0)]
    )
    current_value = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0.00
    )
    start_date = models.DateField()
    target_date = models.DateField()
    status = models.CharField(
        max_length=20,
        choices=GOAL_STATUS_CHOICES,
        default=GOAL_ACTIVE,
        db_index=True
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='goals'
    )

    class Meta:
        ordering = ['target_date']
        indexes = [
            models.Index(fields=['target_type', 'status']),
            models.Index(fields=['department', 'status']),
        ]

    def clean(self):
        if self.start_date and self.target_date and self.start_date > self.target_date:
            raise ValidationError("Target date must be on or after the start date.")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        dept_str = self.department.name if self.department else "Organization-Wide"
        return f"{self.name} - {dept_str} ({self.status})"


class CarbonTransaction(models.Model):
    """
    Ledger recording activities that consume resources and produce CO2.
    Calculates carbon footprints automatically.
    """
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='carbon_transactions'
    )
    employee = models.ForeignKey(
        EmployeeProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='carbon_transactions'
    )
    activity_type = models.CharField(max_length=100, db_index=True)
    quantity = models.DecimalField(
        max_digits=14,
        decimal_places=4,
        validators=[MinValueValidator(0.0)]
    )
    unit = models.CharField(max_length=50)
    emission_factor = models.ForeignKey(
        EmissionFactor,
        on_delete=models.PROTECT,
        related_name='transactions'
    )
    calculated_co2 = models.DecimalField(
        max_digits=14,
        decimal_places=4,
        blank=True,
        db_index=True
    )
    transaction_date = models.DateField(db_index=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-transaction_date']
        indexes = [
            models.Index(fields=['department', 'transaction_date']),
            models.Index(fields=['activity_type', 'transaction_date']),
        ]

    def clean(self):
        if self.emission_factor:
            # Business rule validation: unit verification
            if self.unit != self.emission_factor.unit:
                raise ValidationError(
                    f"Unit mismatch: Transaction unit is '{self.unit}' but the selected emission factor expects '{self.emission_factor.unit}'."
                )
            # Automatic CO2 calculation
            self.calculated_co2 = self.quantity * self.emission_factor.factor
        else:
            self.calculated_co2 = 0.0

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.activity_type} - {self.quantity} {self.unit} ({self.calculated_co2} kg CO2)"


class DepartmentEnvironmentalScore(models.Model):
    """
    Derived model tracking calculated environmental scores and achievements per department.
    """
    department = models.OneToOneField(
        Department,
        on_delete=models.CASCADE,
        related_name='environmental_score'
    )
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=100.00
    )
    total_emissions = models.DecimalField(
        max_digits=14,
        decimal_places=2,
        default=0.00
    )
    goals_achieved = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-score']

    def __str__(self):
        return f"{self.department.name}: Score = {self.score}"
