from django.test import TestCase
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

from .models import Department, Category, EmployeeProfile, OrganizationSettings, NotificationSettings
from .services import DepartmentService, EmployeeService, OrganizationSettingsService


class DepartmentModelTest(TestCase):
    def setUp(self):
        # Create a top-level department
        self.dept1 = Department.objects.create(
            name="Engineering",
            code="ENG",
            status="active"
        )

    def test_department_creation(self):
        self.assertEqual(self.dept1.name, "Engineering")
        self.assertEqual(self.dept1.code, "ENG")
        self.assertEqual(self.dept1.employee_count, 0)

    def test_circular_dependency(self):
        # Create a child department
        dept2 = Department.objects.create(
            name="Frontend",
            code="FE",
            parent_department=self.dept1
        )
        # Attempt to make parent a child of its child
        self.dept1.parent_department = dept2
        with self.assertRaises(ValidationError):
            self.dept1.save()

    def test_self_parenting(self):
        self.dept1.parent_department = self.dept1
        with self.assertRaises(ValidationError):
            self.dept1.save()


class CategoryModelTest(TestCase):
    def test_category_creation(self):
        category = Category.objects.create(
            name="Tree Plantation",
            type="csr_activities",
            description="Environmental activity",
            status="active"
        )
        self.assertEqual(category.name, "Tree Plantation")
        self.assertEqual(category.type, "csr_activities")


class OrganizationSettingsModelTest(TestCase):
    def setUp(self):
        # Clear existing settings if any
        OrganizationSettings.objects.all().delete()

    def test_weights_sum_validation(self):
        # Sum of weights != 100
        settings = OrganizationSettings(
            environment_weight=30.00,
            social_weight=30.00,
            governance_weight=30.00
        )
        with self.assertRaises(ValidationError):
            settings.save()

    def test_singleton_enforcement(self):
        # First instance
        OrganizationSettings.objects.create(
            environment_weight=33.33,
            social_weight=33.33,
            governance_weight=33.34
        )
        # Try to create second instance
        second = OrganizationSettings(
            environment_weight=33.33,
            social_weight=33.33,
            governance_weight=33.34
        )
        with self.assertRaises(ValidationError):
            second.save()


class SignalsAndServicesTest(TestCase):
    def setUp(self):
        # Clear database records to ensure isolated test counts
        Department.objects.all().delete()
        EmployeeProfile.objects.all().delete()
        User.objects.all().delete()

        self.dept = Department.objects.create(
            name="Sustainability",
            code="SUS",
            status="active"
        )

    def test_user_creation_signal(self):
        # Creating a standard django user should automatically create an EmployeeProfile
        user = User.objects.create_user(username="johndoe", email="john@test.com", password="password123")
        profile = EmployeeProfile.objects.filter(user=user).first()
        self.assertIsNotNone(profile)
        self.assertTrue(profile.employee_id.startswith("EMP-"))
        
        # Verify notification settings are automatically created
        notif_settings = NotificationSettings.objects.filter(employee=profile).first()
        self.assertIsNotNone(notif_settings)
        self.assertTrue(notif_settings.email_notifications)

    def test_employee_count_signal(self):
        # Initially, employee_count should be 0
        self.assertEqual(self.dept.employee_count, 0)

        # Create user profile and link to department
        user1 = User.objects.create_user(username="emp1", email="emp1@test.com")
        profile1 = EmployeeProfile.objects.get(user=user1)
        profile1.department = self.dept
        profile1.status = "active"
        profile1.save()

        # Department employee count should increase to 1
        self.dept.refresh_from_db()
        self.assertEqual(self.dept.employee_count, 1)

        # Create another profile
        user2 = User.objects.create_user(username="emp2", email="emp2@test.com")
        profile2 = EmployeeProfile.objects.get(user=user2)
        profile2.department = self.dept
        profile2.status = "active"
        profile2.save()

        self.dept.refresh_from_db()
        self.assertEqual(self.dept.employee_count, 2)

        # Remove employee from department
        profile2.department = None
        profile2.save()

        self.dept.refresh_from_db()
        self.assertEqual(self.dept.employee_count, 1)

        # Delete employee profile completely
        profile1.delete()
        self.dept.refresh_from_db()
        self.assertEqual(self.dept.employee_count, 0)


class APITests(APITestCase):
    def setUp(self):
        # Setup data for API tests
        self.dept = Department.objects.create(
            name="Operations",
            code="OPS",
            status="active"
        )
        self.category = Category.objects.create(
            name="Carbon Footprint reduction",
            type="challenges",
            status="active"
        )
        self.user = User.objects.create_user(
            username="adminuser",
            email="admin@test.com",
            first_name="Admin",
            last_name="User"
        )
        self.profile = EmployeeProfile.objects.get(user=self.user)
        self.profile.department = self.dept
        self.profile.save()

    def test_department_crud_api(self):
        # Read/List
        url = reverse('department-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Create
        post_data = {
            "name": "Human Resources",
            "code": "HR",
            "status": "active"
        }
        response = self.client.post(url, post_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Department.objects.filter(code="HR").exists())

        # Update
        hr_dept = Department.objects.get(code="HR")
        detail_url = reverse('department-detail', args=[hr_dept.id])
        response = self.client.put(detail_url, {
            "name": "People Operations",
            "code": "HR",
            "status": "active"
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        hr_dept.refresh_from_db()
        self.assertEqual(hr_dept.name, "People Operations")

    def test_department_hierarchy_endpoint(self):
        # Create a child department
        child_dept = Department.objects.create(
            name="Logistics",
            code="LOG",
            parent_department=self.dept,
            status="active"
        )
        url = reverse('department-hierarchy')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        # Ensure parent department is present at root level, and has children
        ops_node = next((item for item in data if item['code'] == 'OPS'), None)
        self.assertIsNotNone(ops_node)
        self.assertEqual(len(ops_node['children']), 1)
        self.assertEqual(ops_node['children'][0]['code'], 'LOG')

    def test_dropdown_endpoints(self):
        # Test department dropdown
        url = reverse('department-dropdown')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()), 1)

        # Test category dropdown
        url = reverse('category-dropdown')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()), 1)

        # Test employee dropdown
        url = reverse('employee-dropdown')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()), 1)

    def test_organization_settings_singleton_api(self):
        # Reset table
        OrganizationSettings.objects.all().delete()
        
        url = reverse('organization-settings-list')
        
        # Retrieve singleton (should auto-create default first time)
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(float(data['environment_weight']), 33.33)

        # Update singleton using PUT/POST
        update_data = {
            "environment_weight": 40.00,
            "social_weight": 30.00,
            "governance_weight": 30.00,
            "auto_emission_calculation": True
        }
        response = self.client.post(url, update_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        settings = OrganizationSettings.objects.first()
        self.assertEqual(settings.environment_weight, 40.00)
        self.assertTrue(settings.auto_emission_calculation)

    def test_notification_settings_crud_api(self):
        notif = NotificationSettings.objects.get(employee=self.profile)
        url = reverse('notification-settings-detail', args=[notif.id])
        
        # Retrieve
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Update
        response = self.client.patch(url, {"email_notifications": False})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        notif.refresh_from_db()
        self.assertFalse(notif.email_notifications)
