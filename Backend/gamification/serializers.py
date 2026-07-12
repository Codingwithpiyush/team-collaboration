from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError

from users.models import Category, EmployeeProfile, Department
from .models import (
    Challenge,
    ChallengeParticipation,
    EmployeeXP,
    Badge,
    EmployeeBadge,
    Reward,
    RewardRedemption,
    EmployeeLeaderboard,
    DepartmentLeaderboard
)


class ChallengeSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Challenge
        fields = [
            'id', 'title', 'description', 'category', 'category_name',
            'start_date', 'end_date', 'xp_reward', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data):
        instance = Challenge(**data)
        try:
            instance.clean()
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message_dict if hasattr(e, 'message_dict') else str(e))
        return data


class ChallengeParticipationSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    challenge_title = serializers.CharField(source='challenge.title', read_only=True)
    challenge_xp = serializers.IntegerField(source='challenge.xp_reward', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.user.get_full_name', read_only=True)

    class Meta:
        model = ChallengeParticipation
        fields = [
            'id', 'challenge', 'challenge_title', 'challenge_xp',
            'employee', 'employee_name', 'joined_date', 'evidence',
            'status', 'approved_at', 'approved_by', 'approved_by_name'
        ]
        read_only_fields = ['joined_date', 'approved_at', 'approved_by']

    def validate(self, data):
        if not self.instance:
            employee = data.get('employee')
            challenge = data.get('challenge')
            if ChallengeParticipation.objects.filter(employee=employee, challenge=challenge).exists():
                raise serializers.ValidationError("Employee has already joined this challenge.")

        instance = ChallengeParticipation(**data)
        try:
            instance.clean()
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message_dict if hasattr(e, 'message_dict') else str(e))
        return data


class EmployeeXPSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    department_name = serializers.CharField(source='employee.department.name', read_only=True)

    class Meta:
        model = EmployeeXP
        fields = ['id', 'employee', 'employee_name', 'department_name', 'xp', 'level', 'last_updated']
        read_only_fields = ['xp', 'level', 'last_updated']


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'name', 'description', 'icon', 'criteria_xp']


class EmployeeBadgeSerializer(serializers.ModelSerializer):
    badge_name = serializers.CharField(source='badge.name', read_only=True)
    badge_description = serializers.CharField(source='badge.description', read_only=True)
    badge_icon = serializers.CharField(source='badge.icon', read_only=True)
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)

    class Meta:
        model = EmployeeBadge
        fields = ['id', 'employee', 'employee_name', 'badge', 'badge_name', 'badge_description', 'badge_icon', 'unlocked_at']
        read_only_fields = ['unlocked_at']


class RewardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reward
        fields = ['id', 'title', 'description', 'xp_cost', 'stock', 'status']

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError("Stock cannot be negative.")
        return value


class RewardRedemptionSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    reward_title = serializers.CharField(source='reward.title', read_only=True)
    reward_xp_cost = serializers.IntegerField(source='reward.xp_cost', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.user.get_full_name', read_only=True)

    class Meta:
        model = RewardRedemption
        fields = [
            'id', 'reward', 'reward_title', 'reward_xp_cost',
            'employee', 'employee_name', 'redeemed_at', 'status',
            'approved_at', 'approved_by', 'approved_by_name'
        ]
        read_only_fields = ['redeemed_at', 'status', 'approved_at', 'approved_by']


class EmployeeLeaderboardSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.user.get_full_name', read_only=True)
    employee_id_code = serializers.CharField(source='employee.employee_id', read_only=True)
    department_name = serializers.CharField(source='employee.department.name', read_only=True)

    class Meta:
        model = EmployeeLeaderboard
        fields = ['id', 'employee', 'employee_name', 'employee_id_code', 'department_name', 'rank', 'xp', 'last_updated']
        read_only_fields = ['rank', 'xp', 'last_updated']


class DepartmentLeaderboardSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    department_code = serializers.CharField(source='department.code', read_only=True)

    class Meta:
        model = DepartmentLeaderboard
        fields = ['id', 'department', 'department_name', 'department_code', 'rank', 'total_xp', 'average_xp', 'last_updated']
        read_only_fields = ['rank', 'total_xp', 'average_xp', 'last_updated']
