from django.db import transaction
from django.contrib.auth.models import User
from django.db.models import Count
from django.core.exceptions import ValidationError
from .models import Department, EmployeeProfile, OrganizationSettings, NotificationSettings


class DepartmentService:
    @staticmethod
    def get_hierarchy():
        """
        Builds and returns a hierarchical tree structure of active departments.
        """
        # Fetch all active departments
        departments = list(Department.objects.filter(status='active').select_related('parent_department', 'head__user'))
        
        # Map each department ID to its dictionary representation
        nodes = {}
        for dept in departments:
            nodes[dept.id] = {
                'id': dept.id,
                'name': dept.name,
                'code': dept.code,
                'employee_count': dept.employee_count,
                'head': {
                    'id': dept.head.id,
                    'employee_id': dept.head.employee_id,
                    'name': dept.head.user.get_full_name() or dept.head.user.username,
                } if dept.head else None,
                'children': []
            }
            
        roots = []
        for dept in departments:
            node = nodes[dept.id]
            parent_id = dept.parent_department_id
            if parent_id and parent_id in nodes:
                # Append to parent's children list
                nodes[parent_id]['children'].append(node)
            else:
                # Root department
                roots.append(node)
                
        return roots

    @staticmethod
    def recalculate_all_employee_counts():
        """
        Recalculates employee count for all departments from scratch to prevent any drifts.
        """
        counts = EmployeeProfile.objects.filter(status='active', department__isnull=False) \
            .values('department_id') \
            .annotate(total=Count('id'))
        
        counts_dict = {item['department_id']: item['total'] for item in counts}
        
        with transaction.atomic():
            for dept in Department.objects.all():
                new_count = counts_dict.get(dept.id, 0)
                if dept.employee_count != new_count:
                    dept.employee_count = new_count
                    dept.save(update_fields=['employee_count'])


class EmployeeService:
    @staticmethod
    @transaction.atomic
    def create_employee(user_data, profile_data):
        """
        Create a User and corresponding EmployeeProfile inside a database transaction.
        """
        password = user_data.pop('password', None)
        username = user_data.get('username')
        
        if User.objects.filter(username=username).exists():
            raise ValidationError({'username': 'A user with that username already exists.'})
            
        user = User.objects.create(**user_data)
        if password:
            user.set_password(password)
            user.save()
            
        # The post-save signal will create a profile, so we retrieve and update it
        profile = EmployeeProfile.objects.get(user=user)
        
        # Update profile fields with provided profile_data
        for field, value in profile_data.items():
            setattr(profile, field, value)
            
        profile.save()
        return profile

    @staticmethod
    @transaction.atomic
    def update_employee(employee_profile, user_data, profile_data):
        """
        Update User and EmployeeProfile inside a database transaction.
        """
        user = employee_profile.user
        
        # Update user fields
        password = user_data.pop('password', None)
        if password:
            user.set_password(password)
            
        for field, value in user_data.items():
            setattr(user, field, value)
        user.save()
        
        # Update profile fields
        for field, value in profile_data.items():
            setattr(employee_profile, field, value)
            
        employee_profile.save()
        return employee_profile


class OrganizationSettingsService:
    @staticmethod
    def get_settings():
        """
        Retrieves the global OrganizationSettings instance, creating a default one if none exists.
        """
        settings, created = OrganizationSettings.objects.get_or_create(
            id=1,
            defaults={
                'environment_weight': 33.33,
                'social_weight': 33.33,
                'governance_weight': 33.34,
                'auto_emission_calculation': False,
                'require_evidence': True,
                'auto_badge_unlock': True
            }
        )
        return settings

    @staticmethod
    @transaction.atomic
    def update_settings(settings_data):
        """
        Updates the global OrganizationSettings.
        """
        settings = OrganizationSettingsService.get_settings()
        
        for field, value in settings_data.items():
            setattr(settings, field, value)
            
        settings.full_clean()
        settings.save()
        return settings
