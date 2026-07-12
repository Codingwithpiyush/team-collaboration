from django.test import TestCase
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
import datetime

from users.models import Department, EmployeeProfile, Category, OrganizationSettings
from users.services import OrganizationSettingsService
from .models import (
    CSRActivity,
    EmployeeParticipation,
    Training,
    DiversityMetric,
    DepartmentSocialScore
)
from .services import CSRService, TrainingService, SocialScoreService, SocialDashboardService


class CSRActivityModelTest(TestCase):
    def setUp(self):
        Category.objects.all().delete()
        self.category = Category.objects.create(
            name="Community Service",
            type="csr_activities",
            status="active"
        )
        self.today = timezone.now().date()

    def test_activity_creation_validations(self):
        activity = CSRActivity.objects.create(
            title="Clean Up Drive",
            category=self.category,
            start_date=self.today,
            end_date=self.today + datetime.timedelta(days=2),
            points=20,
            status="active"
        )
        self.assertEqual(activity.title, "Clean Up Drive")
        self.assertEqual(activity.points, 20)

        # Invalid date range
        invalid_activity = CSRActivity(
            title="Clean Up Drive 2",
            category=self.category,
            start_date=self.today + datetime.timedelta(days=2),
            end_date=self.today,
            points=20
        )
        with self.assertRaises(ValidationError):
            invalid_activity.save()


class EmployeeParticipationModelTest(TestCase):
    def setUp(self):
        # Clear records
        Department.objects.all().delete()
        Category.objects.all().delete()
        CSRActivity.objects.all().delete()
        EmployeeProfile.objects.all().delete()
        User.objects.all().delete()

        self.dept = Department.objects.create(
            name="Engineering",
            code="ENG",
            employee_count=1,
            status="active"
        )
        self.category = Category.objects.create(
            name="Social Help",
            type="csr_activities",
            status="active"
        )
        self.activity = CSRActivity.objects.create(
            title="Blood Donation",
            category=self.category,
            start_date=timezone.now().date(),
            end_date=timezone.now().date(),
            points=15,
            status="active"
        )
        self.user = User.objects.create_user(username="testemp", password="password")
        # EmployeeProfile is automatically created via signals, fetch and update it
        self.employee = EmployeeProfile.objects.get(user=self.user)
        self.employee.department = self.dept
        self.employee.employee_id = "EMP-001"
        self.employee.save()

        # Disable require_evidence for testing standard participations
        settings = OrganizationSettingsService.get_settings()
        settings.require_evidence = False
        settings.save()


    def test_points_awarded_on_approval(self):
        participation = EmployeeParticipation.objects.create(
            employee=self.employee,
            activity=self.activity,
            status="pending"
        )
        # Pending status must award 0 points
        self.assertEqual(participation.points_awarded, 0)

        # Update status to approved
        participation.status = "approved"
        participation.save()
        
        # Approved status must award activity's points
        self.assertEqual(participation.points_awarded, 15)

    def test_duplicate_participation_raises_integrity_error(self):
        EmployeeParticipation.objects.create(
            employee=self.employee,
            activity=self.activity,
            status="pending"
        )
        # Duplicate participation should raise ValidationError at full_clean level
        duplicate = EmployeeParticipation(
            employee=self.employee,
            activity=self.activity,
            status="pending"
        )
        with self.assertRaises(ValidationError):
            duplicate.full_clean()


    def test_evidence_required_if_enabled(self):
        # Enable require_evidence in settings
        settings = OrganizationSettingsService.get_settings()
        settings.require_evidence = True
        settings.save()

        # Try to save participation without evidence should raise ValidationError
        participation = EmployeeParticipation(
            employee=self.employee,
            activity=self.activity,
            status="pending"
        )
        with self.assertRaises(ValidationError):
            participation.save()

        # Disable it again to not interfere with other tests
        settings.require_evidence = False
        settings.save()


class TrainingAndSocialScoreTest(TestCase):
    def setUp(self):
        Department.objects.all().delete()
        EmployeeProfile.objects.all().delete()
        User.objects.all().delete()
        Training.objects.all().delete()

        self.dept = Department.objects.create(
            name="Product",
            code="PROD",
            employee_count=2,
            status="active"
        )
        self.user1 = User.objects.create_user(username="user1", password="password")
        self.emp1 = EmployeeProfile.objects.get(user=self.user1)
        self.emp1.department = self.dept
        self.emp1.employee_id = "EMP-101"
        self.emp1.save()

        self.user2 = User.objects.create_user(username="user2", password="password")
        self.emp2 = EmployeeProfile.objects.get(user=self.user2)
        self.emp2.department = self.dept
        self.emp2.employee_id = "EMP-102"
        self.emp2.save()

        # Update dept employee count to 2
        self.dept.employee_count = 2
        self.dept.save()

        self.training = Training.objects.create(
            title="ESG Fundamentals",
            trainer="Dr. Green",
            start_date=timezone.now().date(),
            end_date=timezone.now().date(),
            duration_hours=Decimal("10.00"),
            status="scheduled"
        )

    def test_social_score_recalculates_on_enrollment(self):
        # Enroll emp1 in training
        TrainingService.enroll_employee(self.training, self.emp1)
        
        # Verify score is recalculated. 10 hours for 2 employees = 5 hours average
        score_record = SocialScoreService.recalculate_department_social_score(self.dept.id)
        self.assertIsNotNone(score_record)
        # Base (60.00) + Training (5 * 1.5 = 7.5) = 67.5
        self.assertEqual(score_record.score, Decimal("67.50"))
        self.assertEqual(score_record.training_hours_per_employee, Decimal("5.00"))


class SocialAPITests(APITestCase):
    def setUp(self):
        Category.objects.all().delete()
        self.category = Category.objects.create(
            name="Health Drive",
            type="csr_activities",
            status="active"
        )
        self.dept = Department.objects.create(
            name="Legal",
            code="LGL",
            employee_count=1,
            status="active"
        )
        self.user = User.objects.create_user(username="legalemp", password="password")
        self.employee = EmployeeProfile.objects.get(user=self.user)
        self.employee.department = self.dept
        self.employee.employee_id = "EMP-007"
        self.employee.save()

        self.activity = CSRActivity.objects.create(
            title="Sponsoring Food Drive",
            category=self.category,
            start_date=timezone.now().date(),
            end_date=timezone.now().date(),
            points=10,
            status="active"
        )
        # Disable require_evidence for testing joins
        settings = OrganizationSettingsService.get_settings()
        settings.require_evidence = False
        settings.save()

    def test_join_and_approve_workflow_apis(self):
        # Join CSR activity via API
        url = reverse('activity-join', args=[self.activity.id])
        post_data = {"employee": self.employee.id}
        response = self.client.post(url, post_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        participation_id = response.json()['id']

        # Approve CSR participation via API
        url_approve = reverse('participation-approve', args=[participation_id])
        response_approve = self.client.post(url_approve)
        self.assertEqual(response_approve.status_code, status.HTTP_200_OK)
        self.assertEqual(response_approve.json()['status'], "approved")
        self.assertEqual(response_approve.json()['points_awarded'], 10)

    def test_social_dashboard_endpoints(self):
        url = reverse('social-dashboard-monthly-trend')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        url = reverse('social-dashboard-department-points')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        url = reverse('social-dashboard-diversity-distribution')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        url = reverse('social-dashboard-top-performing')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

