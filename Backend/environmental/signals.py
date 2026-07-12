from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.db import transaction

from .models import CarbonTransaction, EnvironmentalGoal
from .services import GoalService, ScoreService


@receiver(pre_save, sender=CarbonTransaction)
def track_previous_transaction_data(sender, instance, **kwargs):
    """
    Store previous department and date to trigger recalculations on both old and new properties.
    """
    if instance.pk:
        try:
            old_inst = CarbonTransaction.objects.get(pk=instance.pk)
            instance._old_department_id = old_inst.department_id
            instance._old_date = old_inst.transaction_date
        except CarbonTransaction.DoesNotExist:
            instance._old_department_id = None
            instance._old_date = None
    else:
        instance._old_department_id = None
        instance._old_date = None


@receiver(post_save, sender=CarbonTransaction)
def update_metrics_on_transaction_save(sender, instance, created, **kwargs):
    """
    Trigger goal recalculation and department score updates when a transaction is saved.
    """
    # Current department and date
    dept_id = instance.department_id
    date = instance.transaction_date

    # Recalculate current department
    GoalService.update_all_goals_for_department(dept_id, date)
    ScoreService.recalculate_department_score(dept_id)

    # Recalculate old department/date if they were changed
    old_dept_id = getattr(instance, '_old_department_id', None)
    old_date = getattr(instance, '_old_date', None)

    if (old_dept_id and old_dept_id != dept_id) or (old_date and old_date != date):
        target_dept = old_dept_id or dept_id
        target_date = old_date or date
        GoalService.update_all_goals_for_department(target_dept, target_date)
        ScoreService.recalculate_department_score(target_dept)


@receiver(post_delete, sender=CarbonTransaction)
def update_metrics_on_transaction_delete(sender, instance, **kwargs):
    """
    Trigger goal recalculation and department score updates when a transaction is deleted.
    """
    dept_id = instance.department_id
    date = instance.transaction_date

    GoalService.update_all_goals_for_department(dept_id, date)
    ScoreService.recalculate_department_score(dept_id)


@receiver(post_save, sender=EnvironmentalGoal)
def update_score_on_goal_save(sender, instance, created, **kwargs):
    """
    Recalculate department score when a goal is updated (e.g., status changed to Achieved).
    """
    if instance.department_id:
        ScoreService.recalculate_department_score(instance.department_id)


@receiver(post_delete, sender=EnvironmentalGoal)
def update_score_on_goal_delete(sender, instance, **kwargs):
    """
    Recalculate department score when a goal is deleted.
    """
    if instance.department_id:
        ScoreService.recalculate_department_score(instance.department_id)
