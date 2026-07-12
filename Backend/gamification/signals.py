from django.db.models.signals import post_save
from django.dispatch import receiver
from users.models import EmployeeProfile
from .models import EmployeeXP
from .services import LeaderboardService


@receiver(post_save, sender=EmployeeProfile)
def create_employee_xp_on_profile_save(sender, instance, created, **kwargs):
    """
    Creates an EmployeeXP record automatically when a new EmployeeProfile is saved.
    """
    if created:
        EmployeeXP.objects.get_or_create(
            employee=instance,
            defaults={'xp': 0, 'level': 1}
        )
        # Recalculate leaderboard ranking order
        LeaderboardService.recalculate_leaderboards()
