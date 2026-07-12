import datetime
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.db import transaction

# Model imports
from users.models import Department, EmployeeProfile, OrganizationSettings, Category
from environmental.models import EmissionFactor, ProductESGProfile, EnvironmentalGoal, CarbonTransaction, DepartmentEnvironmentalScore
from social.models import CSRActivity, EmployeeParticipation, Training, DiversityMetric, DepartmentSocialScore
from governance.models import Policy, PolicyAcknowledgement, Audit, ComplianceIssue, DepartmentGovernanceScore
from gamification.models import Challenge, ChallengeParticipation, Badge, EmployeeBadge, Reward, RewardRedemption, EmployeeXP, EmployeeLeaderboard, DepartmentLeaderboard
from gamification.services import LeaderboardService


class Command(BaseCommand):
    help = 'Seeds the database with realistic sample EcoSphere ESG and Gamification data.'

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write("Deleting existing data (except users)...")
        # Clear existing entries in reverse dependency order
        OrganizationSettings.objects.all().delete()
        DepartmentLeaderboard.objects.all().delete()

        EmployeeLeaderboard.objects.all().delete()
        RewardRedemption.objects.all().delete()
        EmployeeBadge.objects.all().delete()
        ChallengeParticipation.objects.all().delete()
        Challenge.objects.all().delete()

        EmployeeXP.objects.all().delete()
        Reward.objects.all().delete()
        Badge.objects.all().delete()
        ComplianceIssue.objects.all().delete()
        Audit.objects.all().delete()
        PolicyAcknowledgement.objects.all().delete()
        Policy.objects.all().delete()
        DiversityMetric.objects.all().delete()
        DepartmentSocialScore.objects.all().delete()
        DepartmentEnvironmentalScore.objects.all().delete()
        DepartmentGovernanceScore.objects.all().delete()
        Training.objects.all().delete()
        EmployeeParticipation.objects.all().delete()
        CarbonTransaction.objects.all().delete()
        EnvironmentalGoal.objects.all().delete()
        ProductESGProfile.objects.all().delete()
        EmissionFactor.objects.all().delete()
        CSRActivity.objects.all().delete()
        Category.objects.all().delete()
        
        # Keep superusers, delete normal users
        User.objects.filter(is_superuser=False).delete()
        Department.objects.all().delete()

        self.stdout.write("Seeding Organization Settings...")
        org_settings, _ = OrganizationSettings.objects.get_or_create(
            id=1,
            defaults={
                'environment_weight': Decimal('40.00'),
                'social_weight': Decimal('30.00'),
                'governance_weight': Decimal('30.00'),
                'auto_emission_calculation': True,
                'require_evidence': False,
                'auto_badge_unlock': True
            }
        )

        self.stdout.write("Seeding Categories...")
        cat_csr = Category.objects.create(name="Environment & Planting", type="csr_activities", description="Planting and cleanup activities")
        cat_csr2 = Category.objects.create(name="Community Support", type="csr_activities", description="Volunteering and educational drives")
        cat_chal = Category.objects.create(name="Sustainability", type="challenges", description="Green commute and zero-waste challenges")

        self.stdout.write("Seeding Departments...")
        # Head of departments will be users
        exec_user = User.objects.create_user(username="exec_head", email="exec@ecosphere.com", password="password123", first_name="Evelyn", last_name="Chief")
        eng_user = User.objects.create_user(username="eng_head", email="eng@ecosphere.com", password="password123", first_name="Ethan", last_name="Coder")
        
        exec_head = EmployeeProfile.objects.get(user=exec_user)
        exec_head.designation = "Chief Executive"
        exec_head.employee_id = "EMP-001"
        exec_head.save()

        eng_head = EmployeeProfile.objects.get(user=eng_user)
        eng_head.designation = "Engineering Director"
        eng_head.employee_id = "EMP-002"
        eng_head.save()

        dept_exec = Department.objects.create(name="Executive Suite", code="EXEC", head=exec_head)
        dept_eng = Department.objects.create(name="Engineering", code="ENG", head=eng_head, parent_department=dept_exec)
        dept_hr = Department.objects.create(name="Human Resources", code="HR", head=exec_head, parent_department=dept_exec)

        exec_head.department = dept_exec
        exec_head.save()
        eng_head.department = dept_eng
        eng_head.save()

        self.stdout.write("Seeding Employee Profiles...")
        # Create normal employees
        emp_1_user = User.objects.create_user(username="dev_john", email="john@ecosphere.com", password="password123", first_name="John", last_name="Doe")
        emp_1 = EmployeeProfile.objects.get(user=emp_1_user)
        emp_1.department = dept_eng
        emp_1.designation = "Senior Frontend Engineer"
        emp_1.employee_id = "EMP-003"
        emp_1.save()

        emp_2_user = User.objects.create_user(username="hr_jane", email="jane@ecosphere.com", password="password123", first_name="Jane", last_name="Smith")
        emp_2 = EmployeeProfile.objects.get(user=emp_2_user)
        emp_2.department = dept_hr
        emp_2.designation = "HR Manager"
        emp_2.employee_id = "EMP-004"
        emp_2.save()

        self.stdout.write("Seeding Emission Factors...")
        ef_elec = EmissionFactor.objects.create(name="Electricity Consumption", category="electricity", factor=Decimal('0.85'), unit="kWh")
        ef_flight = EmissionFactor.objects.create(name="Air Travel (Short Haul)", category="travel", factor=Decimal('0.15'), unit="km")
        ef_fuel = EmissionFactor.objects.create(name="Diesel Generator", category="fuel", factor=Decimal('2.68'), unit="liters")

        self.stdout.write("Seeding Product ESG Profiles...")
        ProductESGProfile.objects.create(product_name="EcoMouse Pro", sku="SKU-M100", carbon_footprint=Decimal('1.2'), water_footprint=Decimal('5.5'), recyclability_rate=Decimal('85.00'))
        ProductESGProfile.objects.create(product_name="GreenKeyboard Pro", sku="SKU-K200", carbon_footprint=Decimal('3.5'), water_footprint=Decimal('12.0'), recyclability_rate=Decimal('90.00'))

        self.stdout.write("Seeding Carbon Transactions...")
        CarbonTransaction.objects.create(department=dept_eng, employee=emp_1, activity_type="electricity", quantity=Decimal('1200'), unit="kWh", emission_factor=ef_elec, transaction_date=datetime.date.today() - datetime.timedelta(days=10))
        CarbonTransaction.objects.create(department=dept_hr, employee=emp_2, activity_type="travel", quantity=Decimal('500'), unit="km", emission_factor=ef_flight, transaction_date=datetime.date.today() - datetime.timedelta(days=5))

        self.stdout.write("Seeding Environmental Goals...")
        EnvironmentalGoal.objects.create(name="Reduce flight carbon footprints", target_type="carbon_reduction", target_value=Decimal('100.00'), current_value=Decimal('75.00'), start_date=datetime.date.today() - datetime.timedelta(days=30), target_date=datetime.date.today() + datetime.timedelta(days=90), department=dept_eng)
        EnvironmentalGoal.objects.create(name="Reduce server facility electricity usage", target_type="carbon_reduction", target_value=Decimal('500.00'), current_value=Decimal('100.00'), start_date=datetime.date.today() - datetime.timedelta(days=30), target_date=datetime.date.today() + datetime.timedelta(days=90), department=dept_eng)

        self.stdout.write("Seeding CSR Activities & Participations...")
        csr_cleanup = CSRActivity.objects.create(title="Beach Clean Up Drive", category=cat_csr, start_date=datetime.date.today() - datetime.timedelta(days=5), end_date=datetime.date.today() - datetime.timedelta(days=4), points=50, status="completed")
        csr_planting = CSRActivity.objects.create(title="Urban Tree Planting Day", category=cat_csr, start_date=datetime.date.today() - datetime.timedelta(days=1), end_date=datetime.date.today() + datetime.timedelta(days=2), points=30, status="active")

        # Employee 1 joins & gets approved for cleanup
        part_1 = EmployeeParticipation.objects.create(employee=emp_1, activity=csr_cleanup, status="approved")
        # Employee 2 joins upcoming
        part_2 = EmployeeParticipation.objects.create(employee=emp_2, activity=csr_planting, status="pending")

        self.stdout.write("Seeding Trainings...")
        tr_1 = Training.objects.create(title="Workspace Inclusivity & Diversity", trainer="Dr. Sarah Green", start_date=datetime.date.today() - datetime.timedelta(days=15), end_date=datetime.date.today() - datetime.timedelta(days=14), duration_hours=Decimal('3.50'), status="completed")
        tr_1.employees.add(emp_1, emp_2)
        
        tr_2 = Training.objects.create(title="Carbon Neutral Operations Strategy", trainer="Sustainability Inc.", start_date=datetime.date.today(), end_date=datetime.date.today() + datetime.timedelta(days=2), duration_hours=Decimal('8.00'), status="ongoing")
        tr_2.employees.add(emp_1)

        self.stdout.write("Seeding Diversity Metrics...")
        DiversityMetric.objects.create(department=dept_eng, metric_date=datetime.date.today(), gender_distribution={"male": 10, "female": 5}, age_distribution={"20-30": 8, "30-40": 5, "40+": 2}, disability_count=1)
        DiversityMetric.objects.create(department=dept_hr, metric_date=datetime.date.today(), gender_distribution={"male": 2, "female": 8}, age_distribution={"20-30": 3, "30-40": 6, "40+": 1}, disability_count=0)

        self.stdout.write("Seeding Policies & Acknowledgements...")
        policy_code = Policy.objects.create(title="Code of Corporate Conduct V1", code="POL-CCC", description="General guidelines", version="1.0", status="active", owner=exec_head)
        policy_eco = Policy.objects.create(title="Environmental Sustainability Policy V1", code="POL-ESP", description="Zero emission target parameters", version="1.0", status="active", owner=exec_head)


        PolicyAcknowledgement.objects.create(policy=policy_code, employee=emp_1)
        PolicyAcknowledgement.objects.create(policy=policy_code, employee=emp_2)
        PolicyAcknowledgement.objects.create(policy=policy_eco, employee=emp_1)

        self.stdout.write("Seeding Audits & Compliance Issues...")
        audit_1 = Audit.objects.create(title="Q3 Safety & Environment Audit", department=dept_eng, auditor=exec_head, audit_date=datetime.date.today() - datetime.timedelta(days=15), score=Decimal('88.50'), status="published")
        audit_2 = Audit.objects.create(title="Q3 Compliance Audit", department=dept_hr, auditor=exec_head, audit_date=datetime.date.today() - datetime.timedelta(days=10), score=Decimal('92.00'), status="published")

        ComplianceIssue.objects.create(title="Missing Emergency Exit Signage (Zone B)", description="Emergency exit signage missing on the second floor.", department=dept_eng, assigned_to=emp_1, severity="high", status="open", due_date=datetime.date.today() + datetime.timedelta(days=5))
        ComplianceIssue.objects.create(title="Outdated Fire Extinguisher", description="Inspection overdue for the pantry extinguisher.", department=dept_hr, assigned_to=emp_2, severity="medium", status="resolved", resolved_at=datetime.date.today(), due_date=datetime.date.today() - datetime.timedelta(days=2))

        self.stdout.write("Seeding Badges...")
        badge_eco = Badge.objects.create(name="Carbon Reducer", description="Awarded for contributing to emissions reduction", icon="eco", criteria_xp=100)
        badge_csr = Badge.objects.create(name="CSR Enthusiast", description="Awarded for participating in CSR events", icon="people", criteria_xp=200)

        self.stdout.write("Seeding Rewards...")
        Reward.objects.create(title="Eco Coffee Tumbler", description="Reusable vacuum insulated steel bottle", xp_cost=50, stock=20)
        Reward.objects.create(title="Organic Gift Basket", description="Healthy farm fresh product selection", xp_cost=150, stock=5)


        self.stdout.write("Seeding Challenges & Participations...")
        chal_ride = Challenge.objects.create(title="Ride to Work Challenge", category=cat_chal, start_date=datetime.date.today() - datetime.timedelta(days=10), end_date=datetime.date.today() + datetime.timedelta(days=10), xp_reward=120, status="active")
        
        ChallengeParticipation.objects.create(challenge=chal_ride, employee=emp_1, status="approved")
        ChallengeParticipation.objects.create(challenge=chal_ride, employee=emp_2, status="pending")

        # Let's add some XP manually to trigger badges and rankings
        xp_1 = EmployeeXP.objects.get(employee=emp_1)
        xp_1.xp = 350
        xp_1.level = 4
        xp_1.save()

        xp_2 = EmployeeXP.objects.get(employee=emp_2)
        xp_2.xp = 180
        xp_2.level = 2
        xp_2.save()

        # Recalculate all rankings cached
        LeaderboardService.recalculate_leaderboards()

        self.stdout.write(self.style.SUCCESS("EcoSphere database successfully seeded!"))
