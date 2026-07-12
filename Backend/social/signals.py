from django.db.models.signals import post_save, post_delete, m2m_changed
from django.dispatch import receiver
from django.db import transaction

from users.models import EmployeeProfile
from .models import EmployeeParticipation, Training
from .services import SocialScoreService


@receiver(post_save, sender=EmployeeParticipation)
def update_score_on_participation_save(sender, instance, created, **kwargs):
    """
    Recalculates department social score when a CSR participation is saved.
    """
    if instance.employee.department_id:
        SocialScoreService.recalculate_department_social_score(instance.employee.department_id)


@receiver(post_delete, sender=EmployeeParticipation)
def update_score_on_participation_delete(sender, instance, **kwargs):
    """
    Recalculates department social score when a CSR participation is deleted.
    """
    if instance.employee.department_id:
        SocialScoreService.recalculate_department_social_score(instance.employee.department_id)


@receiver(m2m_changed, sender=Training.employees.through)
def update_score_on_training_m2m_change(sender, instance, action, pk_set, **kwargs):
    """
    Recalculates department social scores when employees are added or removed from a training session.
    """
    if action in ["post_add", "post_remove", "post_clear"]:
        # Recalculate scores for all departments represented in the enrollment change
        if pk_set:
            dept_ids = EmployeeProfile.objects.filter(
                pk__in=pk_set
            ).values_list('department_id', flat=True).distinct()
            for dept_id in dept_ids:
                if dept_id:
                    SocialScoreService.recalculate_department_social_score(dept_id)
        
        # Also recalculate departments for any existing employees in the training instance
        instance_depts = instance.employees.values_list('department_id', flat=True).distinct()
        for dept_id in instance_depts:
            if dept_id:
                SocialScoreService.recalculate_department_social_score(dept_id)
