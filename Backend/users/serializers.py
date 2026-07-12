from rest_framework import serializers
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import Department, Category, EmployeeProfile, OrganizationSettings, NotificationSettings
from .services import EmployeeService


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password']
        extra_kwargs = {
            'email': {'required': True, 'allow_blank': False},
            'first_name': {'required': True, 'allow_blank': False},
            'last_name': {'required': True, 'allow_blank': False},
        }


class DepartmentSerializer(serializers.ModelSerializer):
    parent_department_name = serializers.CharField(source='parent_department.name', read_only=True)
    head_name = serializers.CharField(source='head.user.get_full_name', read_only=True)

    class Meta:
        model = Department
        fields = [
            'id', 'name', 'code', 'head', 'head_name',
            'parent_department', 'parent_department_name',
            'employee_count', 'status'
        ]
        read_only_fields = ['employee_count']

    def validate_code(self, value):
        # Convert code to uppercase
        return value.upper()

    def validate(self, data):
        # Build a temporary instance to trigger model clean validation
        instance = Department(**data)
        if self.instance:
            instance.pk = self.instance.pk
        try:
            instance.clean()
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message_dict if hasattr(e, 'message_dict') else str(e))
        return data


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'type', 'description', 'status']

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Name cannot be empty or whitespace only.")
        return value


class EmployeeProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    department_name = serializers.CharField(source='department.name', read_only=True)
    department_code = serializers.CharField(source='department.code', read_only=True)

    class Meta:
        model = EmployeeProfile
        fields = [
            'id', 'user', 'employee_id', 'department',
            'department_name', 'department_code',
            'designation', 'phone', 'avatar',
            'joining_date', 'status'
        ]

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        profile_data = validated_data
        
        try:
            profile = EmployeeService.create_employee(user_data, profile_data)
            return profile
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message_dict if hasattr(e, 'message_dict') else str(e))

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        profile_data = validated_data
        
        try:
            profile = EmployeeService.update_employee(instance, user_data, profile_data)
            return profile
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message_dict if hasattr(e, 'message_dict') else str(e))


class OrganizationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrganizationSettings
        fields = [
            'id', 'environment_weight', 'social_weight', 'governance_weight',
            'auto_emission_calculation', 'require_evidence', 'auto_badge_unlock'
        ]

    def validate(self, data):
        # We need to construct the settings object to check weights validation
        # Retrieve existing fields if updating partially
        env_w = data.get('environment_weight', self.instance.environment_weight if self.instance else 33.33)
        soc_w = data.get('social_weight', self.instance.social_weight if self.instance else 33.33)
        gov_w = data.get('governance_weight', self.instance.governance_weight if self.instance else 33.34)
        
        total = env_w + soc_w + gov_w
        if total != 100.00:
            raise serializers.ValidationError({
                'non_field_errors': f"Weights must sum to exactly 100.00. Currently they sum to {total}."
            })
        return data


class NotificationSettingsSerializer(serializers.ModelSerializer):
    employee_id = serializers.CharField(source='employee.employee_id', read_only=True)
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)

    class Meta:
        model = NotificationSettings
        fields = [
            'id', 'employee', 'employee_id', 'employee_name',
            'email_notifications', 'badge_notifications',
            'csr_notifications', 'challenge_notifications',
            'policy_notifications', 'compliance_notifications'
        ]
        read_only_fields = ['employee']
