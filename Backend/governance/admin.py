from django.contrib import admin
from .models import (
    Policy,
    PolicyAcknowledgement,
    Audit,
    ComplianceIssue,
    DepartmentGovernanceScore
)


@admin.register(Policy)
class PolicyAdmin(admin.ModelAdmin):
    list_display = ('title', 'code', 'version', 'status', 'owner', 'created_at')
    list_filter = ('status', 'version')
    search_fields = ('title', 'code', 'description')
    ordering = ('code',)
    raw_id_fields = ('owner', 'created_by')


@admin.register(PolicyAcknowledgement)
class PolicyAcknowledgementAdmin(admin.ModelAdmin):
    list_display = ('policy', 'employee', 'acknowledged_at')
    list_filter = ('policy',)
    search_fields = ('employee__employee_id', 'policy__code')
    ordering = ('-acknowledged_at',)
    raw_id_fields = ('policy', 'employee')
    readonly_fields = ('acknowledged_at',)


@admin.register(Audit)
class AuditAdmin(admin.ModelAdmin):
    list_display = ('title', 'department', 'auditor', 'audit_date', 'score', 'status')
    list_filter = ('status', 'department')
    search_fields = ('title', 'scope', 'findings')
    ordering = ('-audit_date',)
    raw_id_fields = ('department', 'auditor')


@admin.register(ComplianceIssue)
class ComplianceIssueAdmin(admin.ModelAdmin):
    list_display = ('title', 'severity', 'status', 'assigned_to', 'department', 'due_date')
    list_filter = ('status', 'severity', 'department')
    search_fields = ('title', 'description', 'resolution_notes')
    ordering = ('due_date',)
    raw_id_fields = ('assigned_to', 'department')
    readonly_fields = ('resolved_at', 'created_at')


@admin.register(DepartmentGovernanceScore)
class DepartmentGovernanceScoreAdmin(admin.ModelAdmin):
    list_display = (
        'department', 'score', 'policy_acknowledgement_rate',
        'open_issues_count', 'average_audit_score', 'last_updated'
    )
    ordering = ('-score',)
    raw_id_fields = ('department',)
    readonly_fields = (
        'score', 'policy_acknowledgement_rate', 'open_issues_count',
        'average_audit_score', 'last_updated'
    )
