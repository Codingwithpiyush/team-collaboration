from django.contrib import admin
from .models import (
    CSRActivity,
    EmployeeParticipation,
    Training,
    DiversityMetric,
    DepartmentSocialScore
)


@admin.register(CSRActivity)
class CSRActivityAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'start_date', 'end_date', 'points', 'status')
    list_filter = ('status', 'category')
    search_fields = ('title', 'description')
    ordering = ('-start_date',)
    raw_id_fields = ('category',)


@admin.register(EmployeeParticipation)
class EmployeeParticipationAdmin(admin.ModelAdmin):
    list_display = ('employee', 'activity', 'status', 'points_awarded', 'joined_date')
    list_filter = ('status', 'activity')
    search_fields = ('employee__employee_id', 'activity__title')
    ordering = ('-joined_date',)
    raw_id_fields = ('employee', 'activity')
    readonly_fields = ('points_awarded', 'joined_date')


@admin.register(Training)
class TrainingAdmin(admin.ModelAdmin):
    list_display = ('title', 'trainer', 'start_date', 'end_date', 'duration_hours', 'status')
    list_filter = ('status', 'start_date')
    search_fields = ('title', 'trainer', 'description')
    ordering = ('-start_date',)
    filter_horizontal = ('employees',)


@admin.register(DiversityMetric)
class DiversityMetricAdmin(admin.ModelAdmin):
    list_display = ('department', 'metric_date', 'disability_count')
    list_filter = ('department', 'metric_date')
    ordering = ('-metric_date',)
    raw_id_fields = ('department',)


@admin.register(DepartmentSocialScore)
class DepartmentSocialScoreAdmin(admin.ModelAdmin):
    list_display = ('department', 'score', 'total_csr_points', 'training_hours_per_employee', 'last_updated')
    ordering = ('-score',)
    raw_id_fields = ('department',)
    readonly_fields = ('score', 'total_csr_points', 'training_hours_per_employee', 'last_updated')
