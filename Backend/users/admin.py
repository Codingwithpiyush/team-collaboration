from django.contrib import admin
from django import forms
from django.core.exceptions import ValidationError
from .models import Department, Category, EmployeeProfile, OrganizationSettings, NotificationSettings


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'parent_department', 'head', 'employee_count', 'status')
    list_filter = ('status', 'parent_department')
    search_fields = ('name', 'code')
    ordering = ('name',)
    raw_id_fields = ('parent_department', 'head')


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'status')
    list_filter = ('status', 'type')
    search_fields = ('name', 'description')
    ordering = ('name',)


@admin.register(EmployeeProfile)
class EmployeeProfileAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'get_user_fullname', 'department', 'designation', 'phone', 'status')
    list_filter = ('status', 'department', 'joining_date')
    search_fields = ('employee_id', 'user__username', 'user__first_name', 'user__last_name', 'designation')
    ordering = ('employee_id',)
    raw_id_fields = ('user', 'department')

    def get_user_fullname(self, obj):
        return obj.user.get_full_name() or obj.user.username
    get_user_fullname.short_description = 'User Name'


class OrganizationSettingsAdminForm(forms.ModelForm):
    class Meta:
        model = OrganizationSettings
        fields = '__all__'

    def clean(self):
        cleaned_data = super().clean()
        env_w = cleaned_data.get('environment_weight', 0)
        soc_w = cleaned_data.get('social_weight', 0)
        gov_w = cleaned_data.get('governance_weight', 0)
        total = env_w + soc_w + gov_w
        if total != 100.00:
            raise ValidationError(f"Weights must sum to exactly 100.00. Currently they sum to {total}.")
        return cleaned_data


@admin.register(OrganizationSettings)
class OrganizationSettingsAdmin(admin.ModelAdmin):
    form = OrganizationSettingsAdminForm
    list_display = (
        'environment_weight', 'social_weight', 'governance_weight',
        'auto_emission_calculation', 'require_evidence', 'auto_badge_unlock'
    )

    def has_add_permission(self, request):
        # Enforce singleton pattern in Django admin
        if OrganizationSettings.objects.exists():
            return False
        return super().has_add_permission(request)

    def has_delete_permission(self, request, obj=None):
        # Prevent deletion of settings in Django admin to keep consistency
        return False


@admin.register(NotificationSettings)
class NotificationSettingsAdmin(admin.ModelAdmin):
    list_display = (
        'employee', 'email_notifications', 'badge_notifications',
        'csr_notifications', 'challenge_notifications', 'policy_notifications',
        'compliance_notifications'
    )
    list_filter = (
        'email_notifications', 'badge_notifications', 'csr_notifications',
        'challenge_notifications', 'policy_notifications', 'compliance_notifications'
    )
    search_fields = ('employee__employee_id', 'employee__user__username')
    raw_id_fields = ('employee',)
