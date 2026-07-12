from django.contrib import admin
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


@admin.register(Challenge)
class ChallengeAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'start_date', 'end_date', 'xp_reward', 'status')
    list_filter = ('status', 'category')
    search_fields = ('title', 'description')
    ordering = ('-created_at',)
    raw_id_fields = ('category',)


@admin.register(ChallengeParticipation)
class ChallengeParticipationAdmin(admin.ModelAdmin):
    list_display = ('challenge', 'employee', 'status', 'joined_date', 'approved_at')
    list_filter = ('status', 'challenge')
    search_fields = ('employee__employee_id', 'challenge__title')
    ordering = ('-joined_date',)
    raw_id_fields = ('challenge', 'employee', 'approved_by')
    readonly_fields = ('joined_date',)


@admin.register(EmployeeXP)
class EmployeeXPAdmin(admin.ModelAdmin):
    list_display = ('employee', 'xp', 'level', 'last_updated')
    search_fields = ('employee__employee_id',)
    ordering = ('-xp',)
    raw_id_fields = ('employee',)
    readonly_fields = ('last_updated',)


@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'icon', 'criteria_xp')
    ordering = ('criteria_xp',)
    search_fields = ('name', 'description')


@admin.register(EmployeeBadge)
class EmployeeBadgeAdmin(admin.ModelAdmin):
    list_display = ('employee', 'badge', 'unlocked_at')
    list_filter = ('badge',)
    search_fields = ('employee__employee_id', 'badge__name')
    ordering = ('-unlocked_at',)
    raw_id_fields = ('employee', 'badge')
    readonly_fields = ('unlocked_at',)


@admin.register(Reward)
class RewardAdmin(admin.ModelAdmin):
    list_display = ('title', 'xp_cost', 'stock', 'status')
    list_filter = ('status',)
    search_fields = ('title', 'description')
    ordering = ('xp_cost',)


@admin.register(RewardRedemption)
class RewardRedemptionAdmin(admin.ModelAdmin):
    list_display = ('reward', 'employee', 'redeemed_at', 'status', 'approved_at')
    list_filter = ('status', 'reward')
    search_fields = ('employee__employee_id', 'reward__title')
    ordering = ('-redeemed_at',)
    raw_id_fields = ('reward', 'employee', 'approved_by')
    readonly_fields = ('redeemed_at',)


@admin.register(EmployeeLeaderboard)
class EmployeeLeaderboardAdmin(admin.ModelAdmin):
    list_display = ('rank', 'employee', 'xp', 'last_updated')
    ordering = ('rank',)
    raw_id_fields = ('employee',)
    readonly_fields = ('rank', 'xp', 'last_updated')


@admin.register(DepartmentLeaderboard)
class DepartmentLeaderboardAdmin(admin.ModelAdmin):
    list_display = ('rank', 'department', 'total_xp', 'average_xp', 'last_updated')
    ordering = ('rank',)
    raw_id_fields = ('department',)
    readonly_fields = ('rank', 'total_xp', 'average_xp', 'last_updated')
