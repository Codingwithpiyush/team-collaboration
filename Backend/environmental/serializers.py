from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError

from users.models import Department, EmployeeProfile
from .models import (
    EmissionFactor,
    ProductESGProfile,
    EnvironmentalGoal,
    CarbonTransaction,
    DepartmentEnvironmentalScore
)


class EmissionFactorSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmissionFactor
        fields = ['id', 'name', 'category', 'factor', 'unit', 'status']

    def validate_factor(self, value):
        if value < 0:
            raise serializers.ValidationError("Emission factor cannot be negative.")
        return value


class ProductESGProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductESGProfile
        fields = [
            'id', 'product_name', 'sku', 'carbon_footprint',
            'water_footprint', 'recyclability_rate', 'status'
        ]

    def validate_recyclability_rate(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError("Recyclability rate must be between 0 and 100.")
        return value


class EnvironmentalGoalSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    department_code = serializers.CharField(source='department.code', read_only=True)

    class Meta:
        model = EnvironmentalGoal
        fields = [
            'id', 'name', 'target_type', 'target_value', 'current_value',
            'start_date', 'target_date', 'status', 'department',
            'department_name', 'department_code'
        ]
        read_only_fields = ['current_value']

    def validate(self, data):
        # Delegate date checks to model clean
        instance = EnvironmentalGoal(**data)
        try:
            instance.clean()
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message_dict if hasattr(e, 'message_dict') else str(e))
        return data


class CarbonTransactionSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    emission_factor_name = serializers.CharField(source='emission_factor.name', read_only=True)

    class Meta:
        model = CarbonTransaction
        fields = [
            'id', 'department', 'department_name', 'employee', 'employee_name',
            'activity_type', 'quantity', 'unit', 'emission_factor',
            'emission_factor_name', 'calculated_co2', 'transaction_date', 'notes'
        ]
        read_only_fields = ['calculated_co2']

    def validate(self, data):
        # Construct temporary instance to trigger model level validations
        instance = CarbonTransaction(**data)
        try:
            instance.clean()
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message_dict if hasattr(e, 'message_dict') else str(e))
        return data


class DepartmentEnvironmentalScoreSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    department_code = serializers.CharField(source='department.code', read_only=True)

    class Meta:
        model = DepartmentEnvironmentalScore
        fields = [
            'id', 'department', 'department_name', 'department_code',
            'score', 'total_emissions', 'goals_achieved', 'last_updated'
        ]
        read_only_fields = ['score', 'total_emissions', 'goals_achieved']
