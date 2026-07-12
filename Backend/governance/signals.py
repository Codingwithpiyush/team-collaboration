from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from .models import PolicyAcknowledgement, Audit, ComplianceIssue
from .services import GovernanceScoreService


@receiver(post_save, sender=PolicyAcknowledgement)
def update_score_on_acknowledgement_save(sender, instance, created, **kwargs):
    """
    Recalculates department score when a policy is acknowledged.
    """
    if instance.employee.department_id:
        GovernanceScoreService.recalculate_department_governance_score(instance.employee.department_id)


@receiver(post_delete, sender=PolicyAcknowledgement)
def update_score_on_acknowledgement_delete(sender, instance, **kwargs):
    """
    Recalculates department score when a policy acknowledgement is removed.
    """
    if instance.employee.department_id:
        GovernanceScoreService.recalculate_department_governance_score(instance.employee.department_id)


@receiver(post_save, sender=Audit)
def update_score_on_audit_save(sender, instance, created, **kwargs):
    """
    Recalculates department score when an audit is created or updated.
    """
    if instance.department_id:
        GovernanceScoreService.recalculate_department_governance_score(instance.department_id)


@receiver(post_delete, sender=Audit)
def update_score_on_audit_delete(sender, instance, **kwargs):
    """
    Recalculates department score when an audit is deleted.
    """
    if instance.department_id:
        GovernanceScoreService.recalculate_department_governance_score(instance.department_id)


@receiver(post_save, sender=ComplianceIssue)
def update_score_on_compliance_issue_save(sender, instance, created, **kwargs):
    """
    Recalculates department score when a compliance issue is created or updated.
    """
    if instance.department_id:
        GovernanceScoreService.recalculate_department_governance_score(instance.department_id)


@receiver(post_delete, sender=ComplianceIssue)
def update_score_on_compliance_issue_delete(sender, instance, **kwargs):
    """
    Recalculates department score when a compliance issue is deleted.
    """
    if instance.department_id:
        GovernanceScoreService.recalculate_department_governance_score(instance.department_id)
