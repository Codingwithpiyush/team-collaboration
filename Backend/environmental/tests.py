from django.test import TestCase
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
import datetime

from users.models import Department, EmployeeProfile
from .models import (
    EmissionFactor,
    ProductESGProfile,
    EnvironmentalGoal,
    CarbonTransaction,
    DepartmentEnvironmentalScore
)
from .services import GoalService, ScoreService, DashboardService


class EmissionFactorModelTest(TestCase):
    def setUp(self):
        self.factor = EmissionFactor.objects.create(
            name="Grid Electricity",
            category="electricity",
            factor=Decimal("0.5210"),
            unit="kWh",
            status="active"
        )
        self.dept = Department.objects.create(
            name="IT",
            code="IT",
            status="active"
        )

    def test_factor_creation(self):
        self.assertEqual(self.factor.name, "Grid Electricity")
        self.assertEqual(self.factor.factor, Decimal("0.5210"))

    def test_deletion_restriction_when_used(self):
        # Create a transaction using the factor
        CarbonTransaction.objects.create(
            department=self.dept,
            activity_type="electricity",
            quantity=Decimal("100.00"),
            unit="kWh",
            emission_factor=self.factor,
            transaction_date=timezone.now().date()
        )
        
        # Verify deleting the factor raises ValidationError
        with self.assertRaises(ValidationError):
            self.factor.delete()

    def test_deletion_allowed_when_unused(self):
        unused_factor = EmissionFactor.objects.create(
            name="Unused Factor",
            category="travel",
            factor=Decimal("0.1200"),
            unit="km"
        )
        unused_factor.delete()
        self.assertFalse(EmissionFactor.objects.filter(name="Unused Factor").exists())


class CarbonTransactionModelTest(TestCase):
    def setUp(self):
        # Clear database records to ensure isolated test counts
        Department.objects.all().delete()
        EmissionFactor.objects.all().delete()

        self.dept = Department.objects.create(
            name="Sales",
            code="SLS",
            status="active"
        )
        self.factor = EmissionFactor.objects.create(
            name="Gasoline",
            category="fuel",
            factor=Decimal("2.3100"),
            unit="liters",
            status="active"
        )

    def test_automatic_co2_calculation(self):
        tx = CarbonTransaction.objects.create(
            department=self.dept,
            activity_type="fuel",
            quantity=Decimal("50.0000"),
            unit="liters",
            emission_factor=self.factor,
            transaction_date=timezone.now().date()
        )
        # 50.00 * 2.31 = 115.5
        self.assertEqual(tx.calculated_co2, Decimal("115.5000"))

    def test_unit_mismatch_validation(self):
        tx = CarbonTransaction(
            department=self.dept,
            activity_type="fuel",
            quantity=Decimal("50.00"),
            unit="kWh",  # Expected unit is liters
            emission_factor=self.factor,
            transaction_date=timezone.now().date()
        )
        with self.assertRaises(ValidationError):
            tx.save()


class GoalsAndScoresSignalsTest(TestCase):
    def setUp(self):
        # Clear database records to ensure isolated test counts
        Department.objects.all().delete()
        EmissionFactor.objects.all().delete()
        EnvironmentalGoal.objects.all().delete()
        CarbonTransaction.objects.all().delete()

        self.dept = Department.objects.create(
            name="HR",
            code="HR",
            employee_count=5,
            status="active"
        )
        self.factor = EmissionFactor.objects.create(
            name="Electricity",
            category="electricity",
            factor=Decimal("0.5000"),
            unit="kWh"
        )
        
        # Set up a carbon reduction goal for HR department
        self.today = timezone.now().date()
        self.goal = EnvironmentalGoal.objects.create(
            name="HR Carbon Reduction Goal",
            target_type="carbon_reduction",
            target_value=Decimal("500.00"),
            start_date=self.today - datetime.timedelta(days=5),
            target_date=self.today + datetime.timedelta(days=5),
            department=self.dept
        )

    def test_goal_progress_auto_updates_on_save(self):
        self.assertEqual(self.goal.current_value, Decimal("0.00"))

        # Log carbon transaction
        tx = CarbonTransaction.objects.create(
            department=self.dept,
            activity_type="electricity",
            quantity=Decimal("200.00"),
            unit="kWh",
            emission_factor=self.factor,
            transaction_date=self.today
        )

        # Goal current_value should now be 200 * 0.5 = 100 kg CO2
        self.goal.refresh_from_db()
        self.assertEqual(self.goal.current_value, Decimal("100.00"))

        # Log another transaction
        tx2 = CarbonTransaction.objects.create(
            department=self.dept,
            activity_type="electricity",
            quantity=Decimal("300.00"),
            unit="kWh",
            emission_factor=self.factor,
            transaction_date=self.today
        )
        self.goal.refresh_from_db()
        self.assertEqual(self.goal.current_value, Decimal("250.00"))

        # Update first transaction quantity
        tx.quantity = Decimal("400.00")
        tx.save()

        # Goal value should be (400 * 0.5) + (300 * 0.5) = 200 + 150 = 350
        self.goal.refresh_from_db()
        self.assertEqual(self.goal.current_value, Decimal("350.00"))

        # Delete a transaction
        tx2.delete()
        self.goal.refresh_from_db()
        self.assertEqual(self.goal.current_value, Decimal("200.00"))

    def test_department_score_auto_recalculates(self):
        # Initial score record should not exist, or be created on-demand
        score_record = ScoreService.recalculate_department_score(self.dept.id)
        self.assertIsNotNone(score_record)
        self.assertEqual(score_record.score, Decimal("100.00"))

        # Record a high polluting transaction
        CarbonTransaction.objects.create(
            department=self.dept,
            activity_type="electricity",
            quantity=Decimal("2000.00"),
            unit="kWh",
            emission_factor=self.factor,
            transaction_date=self.today
        )

        # Score should automatically recalculate and decline
        score_record.refresh_from_db()
        self.assertTrue(score_record.score < Decimal("100.00"))
        self.assertEqual(score_record.total_emissions, Decimal("1000.00"))


class EnvironmentalAPITests(APITestCase):
    def setUp(self):
        self.dept = Department.objects.create(
            name="Finance",
            code="FIN",
            employee_count=10,
            status="active"
        )
        self.factor = EmissionFactor.objects.create(
            name="Transport",
            category="travel",
            factor=Decimal("0.2000"),
            unit="km",
            status="active"
        )
        self.product = ProductESGProfile.objects.create(
            product_name="Eco Widget",
            sku="ECO-WIDG",
            carbon_footprint=Decimal("12.5000"),
            water_footprint=Decimal("5.0000"),
            recyclability_rate=Decimal("95.00")
        )

    def test_emission_factor_crud_api(self):
        url = reverse('emission-factor-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Create
        post_data = {
            "name": "Natural Gas",
            "category": "fuel",
            "factor": "1.890000",
            "unit": "m³",
            "status": "active"
        }
        response = self.client.post(url, post_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_product_esg_profile_crud_api(self):
        url = reverse('product-esg-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Validation test: recyclability rate > 100
        post_data = {
            "product_name": "Ultra Eco Widget",
            "sku": "ECO-WIDG2",
            "carbon_footprint": "2.5",
            "water_footprint": "1.0",
            "recyclability_rate": "105.00",  # Invalid
            "status": "active"
        }
        response = self.client.post(url, post_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_dashboard_analytical_endpoints(self):
        # Create transaction and goal to populate dashboard data
        today = timezone.now().date()
        tx = CarbonTransaction.objects.create(
            department=self.dept,
            activity_type="travel",
            quantity=Decimal("1000.00"),
            unit="km",
            emission_factor=self.factor,
            transaction_date=today
        )

        # Test monthly trend
        url = reverse('environmental-dashboard-monthly-trend')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.json()) > 0)

        # Test department tracking
        url = reverse('environmental-dashboard-department-tracking')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ops_node = next((item for item in response.json() if item['code'] == 'FIN'), None)
        self.assertIsNotNone(ops_node)
        self.assertEqual(float(ops_node['total_co2']), 200.00)

        # Test environmental scores
        url = reverse('environmental-dashboard-environmental-scores')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.json()) > 0)

        # Test top polluters
        url = reverse('environmental-dashboard-top-polluters')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Test top sustainable
        url = reverse('environmental-dashboard-top-sustainable')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

