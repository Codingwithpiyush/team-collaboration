from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import EmployeeProfile, Department, NotificationSettings


@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    """
    Automatically create or update an EmployeeProfile when a User is saved.
    """
    if created:
        # Generate a unique employee ID if not provided (e.g. for superusers)
        employee_id = f"EMP-{instance.pk or User.objects.count() + 1}"
        EmployeeProfile.objects.get_or_create(
            user=instance,
            defaults={
                'employee_id': employee_id,
                'designation': 'Administrator' if instance.is_superuser else 'Staff',
                'status': 'active'
            }
        )
    else:
        # Save profile changes if they exist
        if hasattr(instance, 'profile'):
            instance.profile.save()


@receiver(post_save, sender=EmployeeProfile)
def create_notification_settings(sender, instance, created, **kwargs):
    """
    Automatically create default NotificationSettings when an EmployeeProfile is created.
    """
    if created:
        NotificationSettings.objects.get_or_create(employee=instance)


# Recalculate Department employee counts
def recalculate_department_count(department_id):
    """
    Safely recalculates employee count for a department.
    """
    if not department_id:
        return
    try:
        count = EmployeeProfile.objects.filter(
            department_id=department_id,
            status='active'
        ).count()
        Department.objects.filter(pk=department_id).update(employee_count=count)
    except Exception:
        pass  # Prevent signal errors from blocking database operations


@receiver(pre_save, sender=EmployeeProfile)
def track_previous_department(sender, instance, **kwargs):
    """
    Store the old department to update its count after save.
    """
    if instance.pk:
        try:
            old_instance = EmployeeProfile.objects.get(pk=instance.pk)
            instance._old_department_id = old_instance.department_id
        except EmployeeProfile.DoesNotExist:
            instance._old_department_id = None
    else:
        instance._old_department_id = None


@receiver(post_save, sender=EmployeeProfile)
def update_department_count_on_save(sender, instance, created, **kwargs):
    """
    Recalculate employee counts for current and previous departments.
    """
    # Current department
    if instance.department_id:
        recalculate_department_count(instance.department_id)
    # Previous department (if changed)
    old_dept_id = getattr(instance, '_old_department_id', None)
    if old_dept_id and old_dept_id != instance.department_id:
        recalculate_department_count(old_dept_id)


@receiver(post_delete, sender=EmployeeProfile)
def update_department_count_on_delete(sender, instance, **kwargs):
    """
    Recalculate employee count for the department when an employee is deleted.
    """
    if instance.department_id:
        recalculate_department_count(instance.department_id)
