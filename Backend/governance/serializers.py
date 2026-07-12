from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError

from users.models import Department, EmployeeProfile
from .models import (
    Policy,
    PolicyAcknowledgement,
    Audit,
    ComplianceIssue,
    DepartmentGovernanceScore
)


class PolicySerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.user.get_full_name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = Policy
        fields = [
            'id', 'title', 'code', 'description', 'version',
            'status', 'owner', 'owner_name', 'created_by',
            'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def validate(self, data):
        # Trigger model clean for custom logic validations if any
        instance = Policy(**data)
        try:
            instance.clean()
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message_dict if hasattr(e, 'message_dict') else str(e))
        return data


class PolicyAcknowledgementSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    employee_id_code = serializers.CharField(source='employee.employee_id', read_only=True)
    policy_title = serializers.CharField(source='policy.title', read_only=True)
    policy_code = serializers.CharField(source='policy.code', read_only=True)
    policy_version = serializers.CharField(source='policy.version', read_only=True)

    class Meta:
        model = PolicyAcknowledgement
        fields = [
            'id', 'policy', 'policy_title', 'policy_code', 'policy_version',
            'employee', 'employee_name', 'employee_id_code', 'acknowledged_at'
        ]
        read_only_fields = ['acknowledged_at']

    def validate(self, data):
        employee = data.get('employee')
        policy = data.get('policy')

        # Check unique constraints manually to return proper serializer errors
        if not self.instance:
            if PolicyAcknowledgement.objects.filter(employee=employee, policy=policy).exists():
                raise serializers.ValidationError("This policy version has already been acknowledged by this employee.")

        instance = PolicyAcknowledgement(**data)
        try:
            instance.clean()
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message_dict if hasattr(e, 'message_dict') else str(e))
        return data


class AuditSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    department_code = serializers.CharField(source='department.code', read_only=True)
    auditor_name = serializers.CharField(source='auditor.user.get_full_name', read_only=True)

    class Meta:
        model = Audit
        fields = [
            'id', 'title', 'scope', 'department', 'department_name',
            'department_code', 'auditor', 'auditor_name', 'audit_date',
            'score', 'status', 'findings'
        ]

    def validate(self, data):
        instance = Audit(**data)
        try:
            instance.clean()
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message_dict if hasattr(e, 'message_dict') else str(e))
        return data


class ComplianceIssueSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    department_code = serializers.CharField(source='department.code', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.user.get_full_name', read_only=True)

    class Meta:
        model = ComplianceIssue
        fields = [
            'id', 'title', 'description', 'severity', 'status',
            'assigned_to', 'assigned_to_name', 'department',
            'department_name', 'department_code', 'due_date',
            'resolution_notes', 'resolved_at', 'created_at'
        ]
        read_only_fields = ['resolved_at', 'created_at']

    def validate(self, data):
        instance = ComplianceIssue(**data)
        try:
            instance.clean()
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message_dict if hasattr(e, 'message_dict') else str(e))
        return data


class DepartmentGovernanceScoreSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    department_code = serializers.CharField(source='department.code', read_only=True)

    class Meta:
        model = DepartmentGovernanceScore
        fields = [
            'id', 'department', 'department_name', 'department_code',
            'score', 'policy_acknowledgement_rate', 'open_issues_count',
            'average_audit_score', 'last_updated'
        ]
        read_only_fields = ['score', 'policy_acknowledgement_rate', 'open_issues_count', 'average_audit_score', 'last_updated']
