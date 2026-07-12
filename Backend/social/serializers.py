from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError

from users.models import Department, EmployeeProfile, Category
from .models import (
    CSRActivity,
    EmployeeParticipation,
    Training,
    DiversityMetric,
    DepartmentSocialScore
)


class CSRActivitySerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = CSRActivity
        fields = ['id', 'title', 'category', 'category_name', 'description', 'start_date', 'end_date', 'points', 'status']

    def validate(self, data):
        instance = CSRActivity(**data)
        try:
            instance.clean()
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message_dict if hasattr(e, 'message_dict') else str(e))
        return data


class EmployeeParticipationSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    employee_id_code = serializers.CharField(source='employee.employee_id', read_only=True)
    activity_title = serializers.CharField(source='activity.title', read_only=True)

    class Meta:
        model = EmployeeParticipation
        fields = [
            'id', 'employee', 'employee_name', 'employee_id_code',
            'activity', 'activity_title', 'evidence', 'status',
            'points_awarded', 'joined_date'
        ]
        read_only_fields = ['points_awarded', 'joined_date']

    def validate(self, data):
        # Prevent duplicate enrollment in serializer
        employee = data.get('employee')
        activity = data.get('activity')
        
        # Check if updating or creating
        if not self.instance:
            if EmployeeParticipation.objects.filter(employee=employee, activity=activity).exists():
                raise serializers.ValidationError("This employee is already registered for this CSR activity.")

        # Construct temp instance to test evidence requirements
        instance = EmployeeParticipation(**data)
        if self.instance:
            instance.pk = self.instance.pk
            if 'evidence' not in data and self.instance.evidence:
                instance.evidence = self.instance.evidence
        try:
            instance.clean()
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message_dict if hasattr(e, 'message_dict') else str(e))
            
        return data


class TrainingSerializer(serializers.ModelSerializer):
    enrolled_employee_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Training
        fields = [
            'id', 'title', 'description', 'trainer', 'start_date',
            'end_date', 'duration_hours', 'status', 'employees',
            'enrolled_employee_details'
        ]

    def get_enrolled_employee_details(self, obj):
        return [
            {
                'id': emp.id,
                'employee_id': emp.employee_id,
                'name': emp.user.get_full_name() or emp.user.username,
                'designation': emp.designation
            }
            for emp in obj.employees.all()
        ]

    def validate(self, data):
        instance = Training(**data)
        try:
            instance.clean()
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message_dict if hasattr(e, 'message_dict') else str(e))
        return data


class DiversityMetricSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = DiversityMetric
        fields = [
            'id', 'department', 'department_name', 'metric_date',
            'gender_distribution', 'age_distribution', 'disability_count'
        ]


class DepartmentSocialScoreSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    department_code = serializers.CharField(source='department.code', read_only=True)

    class Meta:
        model = DepartmentSocialScore
        fields = [
            'id', 'department', 'department_name', 'department_code',
            'score', 'total_csr_points', 'training_hours_per_employee', 'last_updated'
        ]
        read_only_fields = ['score', 'total_csr_points', 'training_hours_per_employee']
