from django.contrib import admin
from .models import (
    EmissionFactor,
    ProductESGProfile,
    EnvironmentalGoal,
    CarbonTransaction,
    DepartmentEnvironmentalScore
)


@admin.register(EmissionFactor)
class EmissionFactorAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'factor', 'unit', 'status')
    list_filter = ('status', 'category')
    search_fields = ('name', 'category')
    ordering = ('name',)


@admin.register(ProductESGProfile)
class ProductESGProfileAdmin(admin.ModelAdmin):
    list_display = ('product_name', 'sku', 'carbon_footprint', 'water_footprint', 'recyclability_rate', 'status')
    list_filter = ('status',)
    search_fields = ('product_name', 'sku')
    ordering = ('product_name',)


@admin.register(EnvironmentalGoal)
class EnvironmentalGoalAdmin(admin.ModelAdmin):
    list_display = ('name', 'target_type', 'target_value', 'current_value', 'start_date', 'target_date', 'status', 'department')
    list_filter = ('status', 'target_type', 'department')
    search_fields = ('name',)
    ordering = ('target_date',)
    raw_id_fields = ('department',)


@admin.register(CarbonTransaction)
class CarbonTransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'department', 'employee', 'activity_type', 'quantity', 'unit', 'calculated_co2', 'transaction_date')
    list_filter = ('activity_type', 'department', 'transaction_date')
    search_fields = ('activity_type', 'notes')
    ordering = ('-transaction_date',)
    raw_id_fields = ('department', 'employee', 'emission_factor')
    readonly_fields = ('calculated_co2',)


@admin.register(DepartmentEnvironmentalScore)
class DepartmentEnvironmentalScoreAdmin(admin.ModelAdmin):
    list_display = ('department', 'score', 'total_emissions', 'goals_achieved', 'last_updated')
    ordering = ('-score',)
    raw_id_fields = ('department',)
    readonly_fields = ('score', 'total_emissions', 'goals_achieved', 'last_updated')
