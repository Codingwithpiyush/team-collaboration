# ESG Platform API Documentation

This documentation provides details for all REST API endpoints available in the ESG Platform Backend, organized by application.

All endpoints are prefixed with the base path, typically `http://localhost:8000/`.

---

## 1. Users & Configuration Module (`/api/users/`)

Managing departments, categories, employee profiles, global organizational settings, and notification settings.

### Departments

#### **List Departments**
* **Endpoint:** `GET /api/users/departments/`
* **Query Parameters:**
  * `status` (string, optional) - e.g., `active` or `inactive`
  * `parent_department` (integer, optional) - parent department ID
  * `search` (string, optional) - searches name/code
  * `ordering` (string, optional) - orders by `name`, `code`, or `employee_count` (prefix with `-` for descending)
  * `page` (integer, optional) - page number
  * `page_size` (integer, optional) - results per page
* **Output (200 OK):**
  ```json
  {
    "count": 12,
    "next": "http://localhost:8000/api/users/departments/?page=2",
    "previous": null,
    "results": [
      {
        "id": 1,
        "name": "Sustainability & Innovation",
        "code": "SUST",
        "head": 3,
        "head_name": "Alice Johnson",
        "parent_department": null,
        "parent_department_name": null,
        "employee_count": 8,
        "status": "active"
      }
    ]
  }
  ```

#### **Create Department**
* **Endpoint:** `POST /api/users/departments/`
* **Input (JSON):**
  ```json
  {
    "name": "Sustainability & Innovation",
    "code": "sust",
    "head": 3,
    "parent_department": null,
    "status": "active"
  }
  ```
* **Output (201 Created):** Created department object (forces `code` to uppercase `SUST`).

#### **Retrieve Department**
* **Endpoint:** `GET /api/users/departments/{id}/`
* **Output (200 OK):** Department object.

#### **Update Department**
* **Endpoint:** `PUT / PATCH /api/users/departments/{id}/`
* **Input (JSON):** Department fields to update.
* **Output (200 OK):** Updated department object.

#### **Delete Department**
* **Endpoint:** `DELETE /api/users/departments/{id}/`
* **Output (204 No Content)**

#### **Fetch Tree Hierarchy**
* **Endpoint:** `GET /api/users/departments/hierarchy/`
* **Description:** Returns the complete tree structure of active departments.
* **Output (200 OK):**
  ```json
  [
    {
      "id": 1,
      "name": "Sustainability & Innovation",
      "code": "SUST",
      "children": [
        {
          "id": 5,
          "name": "Green Logistics",
          "code": "GLOG",
          "children": []
        }
      ]
    }
  ]
  ```

#### **Fetch Dropdown Options**
* **Endpoint:** `GET /api/users/departments/dropdown/`
* **Description:** Lightweight endpoint returning active departments for dropdown menus.
* **Output (200 OK):**
  ```json
  [
    {
      "id": 1,
      "name": "Sustainability & Innovation",
      "code": "SUST"
    }
  ]
  ```

#### **Department Statistics**
* **Endpoint:** `GET /api/users/departments/statistics/`
* **Description:** Returns high-level metrics about departments and overall employee headcount.
* **Output (200 OK):**
  ```json
  {
    "total_departments": 12,
    "active_departments": 10,
    "inactive_departments": 2,
    "total_employees": 42
  }
  ```

#### **Bulk Department Import**
* **Endpoint:** `POST /api/users/departments/import/`
* **Description:** Bulk imports departments via uploaded Excel or CSV file containing fields `name`, `code`, `status`, `parent_department` (ID), and `head` (Employee Profile ID).
* **Content-Type:** `multipart/form-data`
* **Input (Form Data):** `file` (Excel/CSV binary data)
* **Output (201 Created):**
  ```json
  {
    "departments_created": 5,
    "errors": []
  }
  ```

#### **Bulk Department Export**
* **Endpoint:** `GET /api/users/departments/export/`
* **Description:** Downloads all departments matching filters.
* **Query Parameters:**
  * `export` (string, required) - file formats: `pdf`, `excel`, `csv`.
  * `status` (string, optional) - filter by status: `active`, `inactive`.
* **Output (200 OK):** Binary file attachment.

---

### Categories

#### **List Categories**
* **Endpoint:** `GET /api/users/categories/`
* **Query Parameters:** `status`, `type` (e.g., `environmental`, `social`, `governance`), `search`, `ordering`, `page`, `page_size`
* **Output (200 OK):** Paginated categories.

#### **Create Category**
* **Endpoint:** `POST /api/users/categories/`
* **Input (JSON):**
  ```json
  {
    "name": "Carbon Offset",
    "type": "environmental",
    "description": "Activities reducing or offsetting greenhouse gases",
    "status": "active"
  }
  ```
* **Output (201 Created)**

#### **Fetch Dropdown Options**
* **Endpoint:** `GET /api/users/categories/dropdown/`
* **Output (200 OK):**
  ```json
  [
    {
      "id": 1,
      "name": "Carbon Offset",
      "type": "environmental"
    }
  ]
  ```

---

### Employee Profiles

#### **List Employees**
* **Endpoint:** `GET /api/users/employees/`
* **Query Parameters:** `status`, `department` (ID), `joining_date`, `search`, `ordering`
* **Output (200 OK):** Paginated list of employee profiles.

#### **Create Employee Profile**
* **Endpoint:** `POST /api/users/employees/`
* **Input (JSON):**
  ```json
  {
    "user": {
      "username": "johndoe",
      "email": "johndoe@esgplatform.com",
      "first_name": "John",
      "last_name": "Doe",
      "password": "StrongPassword123!"
    },
    "employee_id": "EMP011",
    "department": 1,
    "designation": "Sustainability Specialist",
    "phone": "+1234567890",
    "joining_date": "2026-07-12",
    "status": "active"
  }
  ```
* **Output (201 Created):** Created employee profile with user details.

#### **Retrieve/Update/Delete Employee**
* **Endpoint:** `GET / PUT / PATCH / DELETE /api/users/employees/{id}/`
* **Output (200 OK / 204 No Content)**

#### **Fetch Employee Dropdown Options**
* **Endpoint:** `GET /api/users/employees/dropdown/`
* **Output (200 OK):**
  ```json
  [
    {
      "id": 1,
      "employee_id": "EMP011",
      "name": "John Doe",
      "designation": "Sustainability Specialist"
    }
  ]
  ```

---

### Organization Settings (Singleton Config)

#### **Get Organization Settings**
* **Endpoint:** `GET /api/users/organization-settings/`
* **Output (200 OK):**
  ```json
  {
    "id": 1,
    "environment_weight": 33.33,
    "social_weight": 33.33,
    "governance_weight": 33.34,
    "auto_emission_calculation": true,
    "require_evidence": true,
    "auto_badge_unlock": true
  }
  ```

#### **Update Settings**
* **Endpoint:** `POST /api/users/organization-settings/`
* **Description:** Updates the global organization settings singleton.
* **Input (JSON):** Partial settings dictionary. Note: `environment_weight`, `social_weight`, and `governance_weight` must sum to exactly `100.00`.
* **Output (200 OK):** Updated settings.

---

### Notification Settings

#### **List / Retrieve Notification Settings**
* **Endpoint:** `GET /api/users/notification-settings/`
* **Query Parameters:** `employee`, `email_notifications`, `badge_notifications`, etc.
* **Output (200 OK):** Paginated preferences.
  ```json
  {
    "id": 1,
    "employee": 1,
    "employee_id": "EMP011",
    "employee_name": "John Doe",
    "email_notifications": true,
    "badge_notifications": true,
    "csr_notifications": true,
    "challenge_notifications": true,
    "policy_notifications": true,
    "compliance_notifications": true
  }
  ```

#### **Update Notification Settings**
* **Endpoint:** `PUT / PATCH /api/users/notification-settings/{id}/`
* **Input (JSON):** Boolean values to toggle preferences.

---

### Settings & Config Dashboard

#### **Get Settings Dashboard**
* **Endpoint:** `GET /api/users/settings/dashboard/`
* **Description:** Retrieves configurations, department metrics, category statistics, and notification settings lists for the general admin panel.
* **Output (200 OK):**
  ```json
  {
    "organization_settings": {
      "id": 1,
      "environment_weight": 33.33,
      "social_weight": 33.33,
      "governance_weight": 33.34,
      "auto_emission_calculation": true,
      "require_evidence": true,
      "auto_badge_unlock": true
    },
    "notification_settings": [
      {
        "id": 1,
        "employee": 1,
        "employee_name": "John Doe",
        "email_notifications": true,
        "badge_notifications": true
      }
    ],
    "department_statistics": {
      "total_departments": 12,
      "active_departments": 10,
      "inactive_departments": 2,
      "total_employees": 42
    },
    "category_count": 8
  }
  ```

---

## 2. Environmental Module (`/api/environmental/`)

Emission factors management, product ESG profiling, carbon tracking transactions (ledger), and targets.

### Emission Factors

#### **List Emission Factors**
* **Endpoint:** `GET /api/environmental/emission-factors/`
* **Query Parameters:** `status`, `category`, `search`, `ordering`
* **Output (200 OK):** Paginated list of factors.
  ```json
  [
    {
      "id": 1,
      "name": "Electricity Grid Factor (National)",
      "category": "electricity",
      "factor": 0.82,
      "unit": "kg CO2/kWh",
      "status": "active"
    }
  ]
  ```

#### **Create / Update / Delete Emission Factors**
* **Endpoint:** `POST / PUT / PATCH / DELETE /api/environmental/emission-factors/{id}/`

---

### Product ESG Profiles

#### **List Product Profiles**
* **Endpoint:** `GET /api/environmental/product-esg/`
* **Query Parameters:** `status`, `search`, `ordering`
* **Output (200 OK):** Paginated product ESG profiles.
  ```json
  [
    {
      "id": 1,
      "product_name": "Sustainable Office Chair",
      "sku": "CH-SUS-01",
      "carbon_footprint": 45.20,
      "water_footprint": 120.00,
      "recyclability_rate": 92.50,
      "status": "active"
    }
  ]
  ```

#### **Create Product Profile**
* **Endpoint:** `POST /api/environmental/product-esg/`
* **Input (JSON):**
  ```json
  {
    "product_name": "Sustainable Office Chair",
    "sku": "CH-SUS-01",
    "carbon_footprint": 45.20,
    "water_footprint": 120.00,
    "recyclability_rate": 92.50,
    "status": "active"
  }
  ```
* **Output (201 Created):** Created profile. Note: `recyclability_rate` must be between `0` and `100`.

---

### Environmental Goals

#### **List / Create / Update Goals**
* **Endpoint:** `GET / POST / PUT / PATCH / DELETE /api/environmental/goals/`
* **Query Parameters:**
  * `status` (string, optional) - filters by status (`active`, `achieved`, `failed`, `cancelled`).
  * `target_type` (string, optional) - filters by target type.
  * `department` (integer, optional) - filters by department ID.
  * `search` (string, optional) - searches on goal name (`name`), department name (`department__name`), and status (`status`).
* **Input (JSON):**
  ```json
  {
    "name": "Reduce Electricity Footprint",
    "target_type": "carbon_reduction",
    "target_value": 15000.00,
    "start_date": "2026-01-01",
    "target_date": "2026-12-31",
    "status": "active",
    "department": 1
  }
  ```
* **Output (201 Created):** Goal object. `current_value` is read-only.

#### **Export Environmental Goals**
* **Endpoint:** `GET /api/environmental/goals/export/`
* **Query Parameters:**
  * `export` (string, required) - file format: `pdf`, `excel`, or `csv`.
  * `department` (integer, optional) - filters goals by department ID.
  * `status` (string, optional) - filters goals by status.
  * `start_date` (string, optional) - filters target date gte (`YYYY-MM-DD`).
  * `end_date` (string, optional) - filters target date lte (`YYYY-MM-DD`).
* **Output (200 OK):** Binary file attachment stream (CSV, XLSX, or PDF) with standard content disposition headers.

---

### Carbon Transactions (Ledger)

#### **List Transactions**
* **Endpoint:** `GET /api/environmental/transactions/`
* **Query Parameters:** `department`, `employee`, `activity_type`, `transaction_date`
* **Output (200 OK):** Paginated emissions transactions.
  ```json
  [
    {
      "id": 1,
      "department": 1,
      "department_name": "Sustainability & Innovation",
      "employee": 1,
      "employee_name": "John Doe",
      "activity_type": "electricity",
      "quantity": 1000.00,
      "unit": "kWh",
      "emission_factor": 1,
      "emission_factor_name": "Electricity Grid Factor (National)",
      "calculated_co2": 820.00,
      "transaction_date": "2026-07-12",
      "notes": "Server room electricity usage"
    }
  ]
  ```

#### **Record Carbon Transaction**
* **Endpoint:** `POST /api/environmental/transactions/`
* **Input (JSON):**
  ```json
  {
    "department": 1,
    "employee": 1,
    "activity_type": "electricity",
    "quantity": 1000.00,
    "unit": "kWh",
    "emission_factor": 1,
    "notes": "Server room electricity usage"
  }
  ```
* **Output (201 Created):** Created ledger item. The backend automatically calculates and stores `calculated_co2` (`quantity * emission_factor`).

---

### Environmental Dashboard Endpoints

* **`GET /api/environmental/dashboard/monthly-trend/`**
  * *Output:* Month-by-month CO2 emissions (past 12 months).
* **`GET /api/environmental/dashboard/department-tracking/`**
  * *Output:* Total carbon emissions grouped by department.
* **`GET /api/environmental/dashboard/goal-progress/`**
  * *Output:* Progress status and percentage calculations for active goals.
* **`GET /api/environmental/dashboard/environmental-scores/`**
  * *Output:* Current health/sustainability scores per department.
* **`GET /api/environmental/dashboard/top-polluters/`**
  * *Query Params:* `limit` (default: 5)
  * *Output:* Ranked list of departments with the highest carbon footprint.
* **`GET /api/environmental/dashboard/top-sustainable/`**
  * *Query Params:* `limit` (default: 5)
  * *Output:* Ranked list of departments with the best environmental scores.

---

## 3. Social Module (`/api/social/`)

Corporate Social Responsibility (CSR) activities, employee enrollments, training programs, and diversity metrics.

### CSR Activities

#### **List / Create CSR Activities**
* **Endpoint:** `GET / POST /api/social/activities/`
* **Query Parameters for GET:**
  * `status` (string, optional) - filters by status (`upcoming`, `active`, `completed`).
  * `category` (integer, optional) - filters by Category ID.
  * `search` (string, optional) - searches on `title`, `category__name`, `description`, or `status`.
  * `ordering` (string, optional) - ordering fields (`start_date`, `points`).
* **Input for POST (JSON):**
  ```json
  {
    "title": "Local River Clean-up Drive",
    "category": 3,
    "description": "Cleaning up plastic and debris from the local river bank.",
    "start_date": "2026-07-18",
    "end_date": "2026-07-18",
    "points": 50,
    "status": "active"
  }
  ```

#### **Retrieve CSR Activity Details**
* **Endpoint:** `GET /api/social/activities/{id}/`
* **Description:** Retrieves detailed activity fields, participation aggregates, and evidence requirements.
* **Output (200 OK):**
  ```json
  {
    "id": 1,
    "title": "Local River Clean-up Drive",
    "category": 3,
    "category_name": "CSR Initiative",
    "description": "Cleaning up plastic and debris from the local river bank.",
    "start_date": "2026-07-18",
    "end_date": "2026-07-18",
    "points": 50,
    "status": "active",
    "total_joined_employees": 12,
    "pending_approvals": 2,
    "approved_participants": 10,
    "reward_points": 50,
    "evidence_required": true
  }
  ```

#### **Join CSR Activity**
* **Endpoint:** `POST /api/social/activities/{id}/join/`
* **Content-Type:** `multipart/form-data`
* **Input (Form Data):**
  * `employee` (integer, required) - employee profile ID
  * `evidence` (file, optional) - uploaded proof/evidence file
* **Output (201 Created):**
  ```json
  {
    "id": 12,
    "employee": 1,
    "employee_name": "John Doe",
    "employee_id_code": "EMP011",
    "activity": 1,
    "activity_title": "Local River Clean-up Drive",
    "evidence": "http://localhost:8000/media/evidence/river_cleanup.jpg",
    "status": "pending",
    "points_awarded": 0,
    "joined_date": "2026-07-12"
  }
  ```

---

### Employee CSR Participations

#### **List Participations**
* **Endpoint:** `GET /api/social/participations/`
* **Query Parameters:** `status` (pending/approved/rejected), `employee`, `activity`

#### **Approval Queue Endpoint**
* **Endpoint:** `GET /api/social/participations/pending/`
* **Description:** Retrieves the queue of all pending CSR participation approvals.
* **Query Parameters:**
  * `search` (string, optional) - searches on employee name, ID code, or activity title.
  * `ordering` (string, optional) - orders by `joined_date`, `employee__user__first_name`, or `activity__title`.
  * `page` (integer, optional) - page index.
* **Output (200 OK):**
  ```json
  {
    "count": 1,
    "next": null,
    "previous": null,
    "results": [
      {
        "id": 12,
        "employee_name": "John Doe",
        "employee_id": "EMP011",
        "activity": "Local River Clean-up Drive",
        "proof_file": "http://localhost:8000/media/evidence/river_cleanup.jpg",
        "points": 50,
        "submitted_date": "2026-07-12T13:44:23.000000Z"
      }
    ]
  }
  ```

#### **Approve CSR Participation**
* **Endpoint:** `POST /api/social/participations/{id}/approve/`
* **Description:** Approves the participation. Automatically grants the activity points to the employee.
* **Output (200 OK):** Updated participation record with status `approved`.

#### **Reject CSR Participation**
* **Endpoint:** `POST /api/social/participations/{id}/reject/`
* **Description:** Rejects the participation.
* **Output (200 OK):** Updated participation record with status `rejected`.

---

### Training Programs

#### **List Trainings**
* **Endpoint:** `GET /api/social/trainings/`
* **Output (200 OK):**
  ```json
  [
    {
      "id": 1,
      "title": "Corporate Ethics and Inclusion",
      "description": "Training program on office diversity and compliance.",
      "trainer": "Sarah Jenkins",
      "start_date": "2026-08-01",
      "end_date": "2026-08-03",
      "duration_hours": 12.00,
      "status": "active",
      "employees": [1, 2],
      "enrolled_employee_details": [
        {
          "id": 1,
          "employee_id": "EMP011",
          "name": "John Doe",
          "designation": "Specialist"
        }
      ]
    }
  ]
  ```

#### **Create Training**
* **Endpoint:** `POST /api/social/trainings/`
* **Input (JSON):**
  ```json
  {
    "title": "Corporate Ethics and Inclusion",
    "description": "Training program on office diversity and compliance.",
    "trainer": "Sarah Jenkins",
    "start_date": "2026-08-01",
    "end_date": "2026-08-03",
    "duration_hours": 12.00,
    "status": "active",
    "employees": [1, 2]
  }
  ```

#### **Enroll Employee**
* **Endpoint:** `POST /api/social/trainings/{id}/enroll/`
* **Input (JSON):** `{"employee": 3}`
* **Output (200 OK):** `{"detail": "Employee EMP003 successfully enrolled in training."}`

#### **Unenroll Employee**
* **Endpoint:** `POST /api/social/trainings/{id}/unenroll/`
* **Input (JSON):** `{"employee": 3}`
* **Output (200 OK):** `{"detail": "Employee EMP003 successfully unenrolled from training."}`

---

### Diversity Metrics

#### **List / Create Diversity Metric Log**
* **Endpoint:** `GET / POST /api/social/diversity-metrics/`
* **Input (JSON):**
  ```json
  {
    "department": 1,
    "metric_date": "2026-07-01",
    "gender_distribution": {
      "male": 8,
      "female": 12,
      "non-binary": 1
    },
    "age_distribution": {
      "under_30": 6,
      "30_to_50": 12,
      "over_50": 3
    },
    "disability_count": 1
  }
  ```
* **Output (201 Created)**

---

### Social Dashboard Endpoints

* **`GET /api/social/dashboard/activity-stats/`**
  * *Output:* Summary statistics including total/active/completed activities, total participants, pending approvals, and approved participations.
* **`GET /api/social/dashboard/monthly-trend/`**
  * *Output:* Monthly CSR participation counts.
* **`GET /api/social/dashboard/department-points/`**
  * *Output:* CSR points and training averages grouped by department.
* **`GET /api/social/dashboard/diversity-distribution/`**
  * *Output:* Global gender, age, and disability distribution metrics.
* **`GET /api/social/dashboard/top-performing/`**
  * *Query Params:* `limit` (default: 5)
  * *Output:* Highest performing departments by Social score.

---

## 4. Governance Module (`/api/governance/`)

Managing corporate policies, acknowledgments, audits, compliance issues, and scores.

### Policies

#### **List Policies**
* **Endpoint:** `GET /api/governance/policies/`
* **Query Parameters:** `status` (draft/published/archived), `owner`
* **Output (200 OK):** Paginated policies.
  ```json
  [
    {
      "id": 1,
      "title": "Environmental Compliance Policy",
      "code": "POL-ENV-01",
      "description": "Rules and guidelines for office waste and energy usage.",
      "version": "1.0",
      "status": "published",
      "owner": 1,
      "owner_name": "John Doe",
      "created_by": 1,
      "created_by_name": "John Doe",
      "created_at": "2026-07-12T05:00:00Z",
      "updated_at": "2026-07-12T05:00:00Z"
    }
  ]
  ```

#### **Create Policy**
* **Endpoint:** `POST /api/governance/policies/`
* **Input (JSON):**
  ```json
  {
    "title": "Environmental Compliance Policy",
    "code": "POL-ENV-01",
    "description": "Rules and guidelines for office waste and energy usage.",
    "version": "1.0",
    "status": "published",
    "owner": 1
  }
  ```
* **Output (201 Created):** Created policy. `created_by` is set to the logged-in user automatically.

#### **Create New Policy Version**
* **Endpoint:** `POST /api/governance/policies/{id}/new-version/`
* **Description:** Creates a new draft version of the policy. The previous policy is marked as `archived`.
* **Input (JSON):** `{"version": "1.1"}`
* **Output (201 Created):** Created policy draft object.

#### **Acknowledge Policy**
* **Endpoint:** `POST /api/governance/policies/{id}/acknowledge/`
* **Input (JSON):** `{"employee": 2}`
* **Output (201 Created):** Created policy acknowledgement object.

---

### Policy Acknowledgements

#### **List Acknowledgements**
* **Endpoint:** `GET /api/governance/acknowledgements/`
* **Query Parameters:** `policy` (ID), `employee` (ID)
* **Output (200 OK):** Paginated list of employee acknowledgements.

---

### Compliance Audits

#### **List / Create Audits**
* **Endpoint:** `GET / POST /api/governance/audits/`
* **Query Parameters for GET:**
  * `search` (string, optional) - searches against `title`, department name, auditor name/code, or `status`.
  * `status` (string, optional) - filters by status (`draft`, `published`).
  * `department` (integer, optional) - filters by department ID.
  * `auditor` (integer, optional) - filters by auditor ID.
* **Input (JSON for POST):**
  ```json
  {
    "title": "Q3 Environmental Audit",
    "scope": "Carbon ledger verification and waste compliance",
    "department": 1,
    "auditor": 1,
    "audit_date": "2026-07-12",
    "score": 95.50,
    "status": "completed",
    "findings": "Audit completed. Minor ledger mismatch rectified."
  }
  ```

#### **Retrieve Audit Detail**
* **Endpoint:** `GET /api/governance/audits/{id}/`
* **Description:** Retrieves detailed compliance audit records, including the list of linked compliance issues belonging to the audited department.
* **Output (200 OK):**
  ```json
  {
    "id": 1,
    "title": "Q3 Environmental Audit",
    "scope": "Carbon ledger verification and waste compliance",
    "department": 1,
    "department_name": "Sustainability",
    "department_code": "SUST",
    "auditor": 1,
    "auditor_name": "Jane Smith",
    "audit_date": "2026-07-12",
    "score": "95.50",
    "status": "published",
    "findings": "Audit completed. Minor ledger mismatch rectified.",
    "linked_compliance_issues": []
  }
  ```

#### **Export Audits**
* **Endpoint:** `GET /api/governance/audits/export/`
* **Description:** Returns compliance audits in PDF, Excel, or CSV formats.
* **Query Parameters:**
  * `export` (string, optional) - formats: `pdf`, `excel`, `csv` (default: `csv`).
  * `department` (integer, optional) - filters by department ID.
  * `auditor` (integer, optional) - filters by auditor ID.
  * `status` (string, optional) - filters by status (`draft`, `published`).
  * `start_date` (string, optional) - filters audits on or after date (`YYYY-MM-DD`).
  * `end_date` (string, optional) - filters audits on or before date (`YYYY-MM-DD`).

---

### Compliance Issues

#### **List / Create Issues**
* **Endpoint:** `GET / POST /api/governance/issues/`
* **Input (JSON):**
  ```json
  {
    "title": "Data Privacy Gap",
    "description": "Customer databases lack encryption in transit.",
    "severity": "high",
    "status": "open",
    "assigned_to": 2,
    "department": 2,
    "due_date": "2026-08-31"
  }
  ```

#### **Assign Compliance Issue**
* **Endpoint:** `POST /api/governance/issues/{id}/assign/`
* **Input (JSON):** `{"employee": 3}`
* **Output (200 OK):** Updated issue.

#### **Resolve Compliance Issue**
* **Endpoint:** `POST /api/governance/issues/{id}/resolve/`
* **Input (JSON):** `{"resolution_notes": "Implemented TLS 1.3 across all production databases."}`
* **Output (200 OK):** Updated issue. Sets status to `resolved` and saves resolution time.

---

### Governance Dashboard Endpoints

* **`GET /api/governance/dashboard/summary/`**
  * *Description:* Gets a summary of compliance issues and audits for the dashboard.
  * *Output:*
    ```json
    {
      "total_audits": 15,
      "open_issues": 3,
      "resolved_issues": 8,
      "high_severity_issues": 2,
      "medium_severity_issues": 4,
      "low_severity_issues": 5,
      "pending_reviews": 1
    }
    ```
* **`GET /api/governance/dashboard/acknowledgement-rates/`**
  * *Output:* Recognition rates (%) for each published corporate policy.
* **`GET /api/governance/dashboard/compliance-stats/`**
  * *Output:* Summary count of issues categorized by severity and resolution status.
* **`GET /api/governance/dashboard/audit-trends/`**
  * *Output:* Average audit performance trend over recent audits.
* **`GET /api/governance/dashboard/department-scores/`**
  * *Output:* Summary statistics (policy acknowledgements, audits, open issues) per department.
* **`GET /api/governance/dashboard/top-performing/`**
  * *Query Params:* `limit` (default: 5)
  * *Output:* Ranked highest scoring departments in corporate governance.

---

## 5. Gamification Module (`/api/gamification/`)

Incentivizing sustainability with badges, levels, XP rewards, challenges, and leaderboards.

### Challenges

#### **List Challenges**
* **Endpoint:** `GET /api/gamification/challenges/`
* **Query Parameters:** `status` (active/completed/cancelled), `category`

#### **Create Challenge**
* **Endpoint:** `POST /api/gamification/challenges/`
* **Input (JSON):**
  ```json
  {
    "title": "Cycle to Work Challenge",
    "description": "Ride your bicycle to the office at least 3 times this week.",
    "category": 1,
    "start_date": "2026-07-15",
    "end_date": "2026-07-22",
    "xp_reward": 150,
    "status": "active"
  }
  ```

#### **Join Challenge**
* **Endpoint:** `POST /api/gamification/challenges/{id}/join/`
* **Input (JSON):** `{"employee": 1}`
* **Output (201 Created):** Created challenge participation record.

---

### Challenge Participations

#### **List Participations**
* **Endpoint:** `GET /api/gamification/participations/`
* **Query Parameters:** `status` (pending/approved/rejected), `employee`, `challenge`

#### **Approve Participation**
* **Endpoint:** `POST /api/gamification/participations/{id}/approve/`
* **Description:** Approves challenge completion. Automatically awards XP to the employee.
* **Input (JSON):** `{"approved_by": 2}`
* **Output (200 OK):** Updated participation record.

#### **Reject Participation**
* **Endpoint:** `POST /api/gamification/participations/{id}/reject/`
* **Input (JSON):** `{"approved_by": 2}`
* **Output (200 OK):** Updated participation record.

---

### Badges

#### **List / Create Badges**
* **Endpoint:** `GET / POST /api/gamification/badges/`
* **Input (JSON):**
  ```json
  {
    "name": "Social Dynamo",
    "description": "Participated in 5 or more CSR events.",
    "icon": "http://localhost:8000/media/badges/social_dynamo.png",
    "criteria_xp": 500
  }
  ```

#### **Get Employee Unlocked Badges**
* **Endpoint:** `GET /api/gamification/employee-badges/`
* **Query Parameters:** `employee` (ID)
* **Output (200 OK):** List of badges unlocked by the employee.

---

### Rewards

#### **List / Create Rewards**
* **Endpoint:** `GET / POST /api/gamification/rewards/`
* **Input (JSON):**
  ```json
  {
    "title": "Eco-friendly Water Bottle",
    "description": "Double-walled vacuum insulated water bottle.",
    "xp_cost": 200,
    "stock": 100,
    "status": "active"
  }
  ```

---

### Reward Redemptions

#### **List Redemptions**
* **Endpoint:** `GET /api/gamification/redemptions/`
* **Query Parameters:** `status`, `employee`, `reward`

#### **Redeem Reward**
* **Endpoint:** `POST /api/gamification/redemptions/`
* **Description:** Redeems a reward. Deducts the `xp_cost` from employee XP and decrements reward stock.
* **Input (JSON):** `{"employee": 1, "reward": 1}`
* **Output (201 Created):** Created redemption record.

#### **Approve Redemption**
* **Endpoint:** `POST /api/gamification/redemptions/{id}/approve/`
* **Input (JSON):** `{"approved_by": 2}`
* **Output (200 OK):** Status updated to `approved`.

#### **Reject Redemption**
* **Endpoint:** `POST /api/gamification/redemptions/{id}/reject/`
* **Description:** Rejects the redemption. Refund the XP back to the employee and restores stock count.
* **Input (JSON):** `{"approved_by": 2}`
* **Output (200 OK):** Status updated to `rejected`.

---

### Leaderboards

#### **Employee Leaderboard**
* **Endpoint:** `GET /api/gamification/leaderboard/employee/`
* **Description:** Fetches current ranked list of employees based on XP.
* **Output (200 OK):** Paginated ranks.
  ```json
  {
    "count": 55,
    "next": null,
    "previous": null,
    "results": [
      {
        "id": 1,
        "employee": 1,
        "employee_name": "John Doe",
        "employee_id_code": "EMP011",
        "department_name": "Sustainability & Innovation",
        "rank": 1,
        "xp": 1250,
        "last_updated": "2026-07-12T10:00:00Z"
      }
    ]
  }
  ```

#### **Department Leaderboard**
* **Endpoint:** `GET /api/gamification/leaderboard/department/`
* **Description:** Fetches current ranked list of departments based on average XP.
* **Output (200 OK):** Paginated ranks.

---

### Badge Gallery

#### **Get Badge Gallery**
* **Endpoint:** `GET /api/gamification/badge-gallery/`
* **Description:** Returns all badges along with unlock status for the given employee.
* **Query Parameters:** `employee` (ID, optional) - checks unlocks for this employee.
* **Output (200 OK):**
  ```json
  [
    {
      "name": "Social Dynamo",
      "icon": "emoji_events",
      "description": "Participated in 5 or more CSR events.",
      "unlock_status": true,
      "required_xp": 500
    }
  ]
  ```

---

### Gamification Dashboard Endpoints

#### **Challenge Statistics**
* **Endpoint:** `GET /api/gamification/dashboard/challenge-stats/`
* **Output (200 OK):**
  ```json
  {
    "total_challenges": 24,
    "draft": 0,
    "active": 8,
    "under_review": 0,
    "completed": 16,
    "archived": 0,
    "total_participants": 132
  }
  ```

#### **Unified Gamification Dashboard**
* **Endpoint:** `GET /api/gamification/dashboard/`
* **Description:** Returns a combined payload of challenge stats, featured challenges, badge gallery, top 10 leaderboard, and reward summaries.
* **Query Parameters:** `employee` (ID, optional) - determines badge unlock status.
* **Output (200 OK):**
  ```json
  {
    "challenge_stats": {
      "total_challenges": 24,
      "draft": 0,
      "active": 8,
      "under_review": 0,
      "completed": 16,
      "archived": 0,
      "total_participants": 132
    },
    "featured_challenges": [],
    "badge_gallery": [],
    "leaderboard": [],
    "reward_summary": []
  }
  ```

---

## 6. Reports Module (`/api/reports/`)

Exporting and generating comprehensive analytical reports.

### Report Formats
Adding the `?export=csv`, `?export=excel`, or `?export=pdf` query parameter to any report endpoint converts the response into a binary file download (with proper header attachment dispositions). Leaving the `export` parameter empty returns raw JSON data representing the rows.

### Endpoints
All report endpoints accept the following optional query parameter filters:
* `department` (ID)
* `employee` (ID)
* `challenge` (ID)
* `category` (ID)
* `module` (string)
* `status` (string)
* `start_date` (`YYYY-MM-DD`)
* `end_date` (`YYYY-MM-DD`)

#### **Environmental Report**
* **Endpoint:** `GET /api/reports/environmental/`
* **Description:** Carbon footprint logs, average emission factors, and goal targets progress.

#### **Social Report**
* **Endpoint:** `GET /api/reports/social/`
* **Description:** CSR participation events, employee training hours, and diversity distribution.

#### **Governance Report**
* **Endpoint:** `GET /api/reports/governance/`
* **Description:** Audits scores, compliance issues history, and policy acknowledgements progress.

#### **Department Specific Report**
* **Endpoint:** `GET /api/reports/department/`
* **Requirement:** `?department={id}` query parameter is required.
* **Description:** Aggregates and logs all ESG indicators for the specified department.

#### **Employee Specific Report**
* **Endpoint:** `GET /api/reports/employee/`
* **Requirement:** `?employee={id}` query parameter is required.
* **Description:** Tracks carbon footprint logs, CSR participation, and gamification rewards for the employee.

#### **ESG Corporate Summary**
* **Endpoint:** `GET /api/reports/esg-summary/`
* **Description:** Summary metrics of all ESG domains combined at the company scale.

#### **Custom Report Builder**
* **Endpoint:** `GET /api/reports/custom/`
* **Description:** Generates report layout and queries database dynamically based on query filters.

#### **Report Preview**
* **Endpoint:** `GET /api/reports/preview/`
* **Description:** Previews report layout and rows in raw JSON format without initiating file conversion or download.
* **Query Parameters:** Supports all query parameters filters and `module` (e.g. `environmental`, `social`, `governance`, `department`, `employee`, `esg-summary`, `custom`).

#### **Report Filter Dropdowns**
* **Endpoint:** `GET /api/reports/filter-options/`
* **Description:** Returns list options for dropdown menus inside the reports filter UI.
* **Output (200 OK):**
  ```json
  {
    "departments": [{"id": 1, "name": "Sustainability", "code": "SUST"}],
    "employees": [{"id": 1, "name": "John Doe"}],
    "challenges": [{"id": 1, "title": "Cycle to Work"}],
    "categories": [{"id": 1, "name": "Carbon Offset", "type": "environmental"}],
    "modules": ["environmental", "social", "governance", "department", "employee", "esg-summary", "custom"]
  }
  ```

#### **Report Generation Status**
* **Endpoint:** `GET /api/reports/status/{report_id}/`
* **Description:** Retrieves the current state of an asynchronous report generation task.
* **Output (200 OK):**
  ```json
  {
    "report_id": "report_12345",
    "status": "completed",
    "progress": 100,
    "download_url": "/api/reports/custom/?export=csv"
  }
  ```

---

## 7. Executive Dashboard Module (`/api/dashboard/`)

High-level summary dashboards for mobile/frontend widgets.

#### **Get Executive Dashboard Data**
* **Endpoint:** `GET /api/dashboard/executive/`
* **Query Parameters:** `employee` (integer ID, optional)
* **Output (200 OK):** A unified Flutter-ready JSON document containing department health metrics, carbon trend series, CSR highlights, and compliance trackers.

#### **Get Department ESG Rankings**
* **Endpoint:** `GET /api/dashboard/department-esg-ranking/`
* **Description:** Retrieves the ranked list of active departments based on their calculated environmental, social, governance, and overall ESG scores.
* **Calculation:** Weighted using configuration settings (Organization Settings).
* **Output (200 OK):**
  ```json
  [
    {
      "id": 1,
      "name": "Sustainability & Innovation",
      "code": "SUST-01",
      "environmental_score": 98.50,
      "social_score": 92.00,
      "governance_score": 96.20,
      "overall_esg_score": 95.57,
      "rank": 1
    }
  ]
  ```
* **Headers:** Returns custom header `X-Corporate-Average-ESG` containing corporate average ESG Score.

#### **Get Recent Activities**
* **Endpoint:** `GET /api/dashboard/recent-activities/`
* **Description:** Combines and returns the latest 20 activities across all ESG categories, sorted newest first.
* **Included Sources:** Carbon Transactions, CSR Participations, Challenge Participations, Policy Acknowledgements, and Compliance Issues.
* **Output (200 OK):**
  ```json
  [
    {
      "type": "environmental",
      "title": "Carbon Emission Logged",
      "description": "Carbon transaction logged: electricity - 820.0 kg CO2",
      "time": "2026-07-12T14:15:14.231201+00:00",
      "icon": "leaf"
    },
    {
      "type": "social",
      "title": "CSR Participation",
      "description": "John Doe joined CSR: Local River Clean-up Drive",
      "time": "2026-07-12T13:44:23.000000+00:00",
      "icon": "heart"
    }
  ]
  ```
