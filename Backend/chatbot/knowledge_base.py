"""
EcoSphere AI Chatbot Knowledge Base
Keyword-matching rules engine covering all ESG platform modules.
No external AI API needed — fully self-contained.
"""

# Each rule: list of keyword triggers, a response string, and an optional page hint
CHATBOT_RULES = [

    # ─── GENERAL / GREETING ────────────────────────────────────────────────
    {
        "keywords": ["hello", "hi", "hey", "good morning", "good evening", "greetings", "howdy"],
        "response": "👋 Hello! I'm EcoBot, your ESG platform assistant. I can help you with:\n\n• 🌿 Environmental tracking (carbon, goals, emission factors)\n• 🤝 Social & CSR activities (participation, diversity)\n• ⚖️ Governance (policies, audits, compliance)\n• 🎮 Gamification (challenges, badges, rewards, XP)\n• 📊 Reports & analytics\n• ⚙️ Settings & configuration\n\nWhat would you like to know?",
        "page": None
    },
    {
        "keywords": ["what can you do", "help me", "what do you know", "capabilities", "features", "assist"],
        "response": "🤖 I'm EcoBot — a built-in assistant for the EcoSphere ESG platform!\n\nI can answer questions about:\n\n🌿 **Environmental** — Carbon transactions, emission factors, goals, CO₂ tracking\n🤝 **Social** — CSR activities, participation, training, diversity metrics\n⚖️ **Governance** — Policies, audits, compliance issues, acknowledgements\n🎮 **Gamification** — Challenges, XP, badges, leaderboard, rewards\n📊 **Reports** — ESG reports, custom builders, PDF/Excel exports\n⚙️ **Settings** — Departments, categories, notification preferences\n\nJust type your question naturally!",
        "page": None
    },
    {
        "keywords": ["thank", "thanks", "awesome", "great", "perfect", "cool", "nice", "good job"],
        "response": "😊 You're welcome! I'm here anytime you need help navigating the EcoSphere platform. Is there anything else I can assist you with?",
        "page": None
    },
    {
        "keywords": ["bye", "goodbye", "see you", "exit", "close", "quit"],
        "response": "👋 Goodbye! Keep up the great sustainability work. See you soon on EcoSphere!",
        "page": None
    },

    # ─── DASHBOARD ─────────────────────────────────────────────────────────
    {
        "keywords": ["dashboard", "overview", "home", "main page", "kpi", "summary stats"],
        "response": "📊 **Dashboard Overview**\n\nThe EcoSphere Dashboard gives you a real-time corporate ESG pulse:\n\n• **Total Employees** — active headcount\n• **ESG Score** — weighted average across Environmental, Social, Governance domains\n• **Carbon Emissions** — total CO₂ logged this period\n• **CSR Participation Rate** — % employees engaged in activities\n• **Active Challenges** — ongoing gamification sprints\n• **Open Compliance Issues** — governance risk flags\n\nNavigate via the left sidebar to explore each module.",
        "page": "Dashboard"
    },
    {
        "keywords": ["esg score", "esg index", "overall score", "esg rating", "corporate score"],
        "response": "📈 **ESG Score Calculation**\n\nThe Overall ESG Score is a weighted average of three domain scores:\n\n• 🌿 Environmental Score (default 33.33%)\n• 🤝 Social Score (default 33.33%)\n• ⚖️ Governance Score (default 33.34%)\n\nYou can customize these weights in **Settings → ESG Configuration → Score Weights**.\n\nScores are calculated per department and rolled up to corporate level. A score of 100 = perfect compliance.",
        "page": "Settings"
    },

    # ─── ENVIRONMENTAL ─────────────────────────────────────────────────────
    {
        "keywords": ["environmental", "environment", "green", "carbon", "co2", "emission", "greenhouse", "ghg"],
        "response": "🌿 **Environmental Module**\n\nTrack your organization's environmental footprint across 4 tabs:\n\n1. **Environmental Goals** — Set and track carbon reduction targets per department\n2. **Emission Factors** — Manage GHG Protocol-compliant calculation factors\n3. **Product ESG Profiles** — Lifecycle assessments and recyclability ratings\n4. **Carbon Transactions** — Log and audit all CO₂-generating activities\n\n💡 Tip: Use the **Log Transaction** button to record a new carbon activity. Always include the Transaction Date!",
        "page": "Environmental"
    },
    {
        "keywords": ["carbon transaction", "log transaction", "log carbon", "carbon log", "transaction date"],
        "response": "🔬 **Logging a Carbon Transaction**\n\nTo log a new carbon transaction:\n1. Go to **Environmental → Carbon Transactions**\n2. Click **Log Transaction**\n3. Fill in:\n   - Department & Employee\n   - Emission Factor Reference\n   - Quantity consumed\n   - **Transaction Date** (required — the date the activity occurred)\n   - Notes/details\n\nCO₂ is auto-calculated using: `Quantity × Emission Factor Value ÷ 1000 = tonnes CO₂`",
        "page": "Environmental"
    },
    {
        "keywords": ["emission factor", "ghg protocol", "emission value", "factor reference", "co2 factor"],
        "response": "📋 **Emission Factors**\n\nEmission Factors convert raw activity data (kWh, litres, km) into kg CO₂ equivalent.\n\nEach factor includes:\n• **Name** — e.g. 'Grid Electricity UK'\n• **Value** — kg CO₂ per unit\n• **Unit** — e.g. kWh, litre, tonne\n• **Category** — electricity, fuel, transport, waste\n• **Source** — GHG Protocol, IPCC, EPA\n\nManage factors in **Environmental → Emission Factors**.",
        "page": "Environmental"
    },
    {
        "keywords": ["environmental goal", "carbon goal", "reduction target", "carbon target", "achieve goal"],
        "response": "🎯 **Environmental Goals**\n\nSet measurable CO₂ reduction targets per department:\n\n• **Target Value** — e.g. reduce emissions by 500 kg\n• **Start/End Date** — goal measurement window\n• **Status** — Active, Achieved, Failed, Cancelled\n\nProgress is tracked automatically as carbon transactions are logged. A goal turns **Achieved** when actual emissions fall below the target value.\n\nGo to: Environmental → Environmental Goals",
        "page": "Environmental"
    },
    {
        "keywords": ["product esg", "lifecycle", "recyclability", "product profile", "product sustainability"],
        "response": "📦 **Product ESG Profiles**\n\nTrack the sustainability attributes of your products:\n\n• **Lifecycle Score** — overall environmental rating\n• **Recyclability %** — percentage of product that is recyclable\n• **Regulatory Compliance** — e.g. RoHS, REACH, ISO 14001\n• **Carbon Footprint** — CO₂e per unit produced\n\nManage in: Environmental → Product ESG Profiles",
        "page": "Environmental"
    },

    # ─── SOCIAL / CSR ──────────────────────────────────────────────────────
    {
        "keywords": ["social", "csr", "community", "volunteer", "social impact", "social module"],
        "response": "🤝 **Social Module**\n\nManage your corporate social responsibility programs:\n\n1. **CSR Activities** — Create and manage volunteer/community events\n2. **Employee Participation** — Track who joined which activity and their approval status\n3. **Diversity Dashboard** — Monitor gender, age, and inclusion metrics\n\nNavigate to: **Social** in the sidebar",
        "page": "Social"
    },
    {
        "keywords": ["csr activity", "csr activities", "join activity", "enroll activity", "participate activity"],
        "response": "🏃 **CSR Activities**\n\nTo join a CSR Activity:\n1. Go to **Social → CSR Activities**\n2. Find an activity and click **Enroll**\n3. Select your employee profile\n4. Upload verification proof if required by company policy\n5. Click **Register Enrollment**\n\nYour participation will show as **Pending** until a manager approves it. Approved participations award XP points!",
        "page": "Social"
    },
    {
        "keywords": ["participation", "employee participation", "csr participation", "joined activity", "approve participation"],
        "response": "✅ **Employee Participation Tracking**\n\nParticipation records show:\n• Employee name & department\n• Activity joined\n• Joined date\n• Status: **Pending** → **Approved** → Points Awarded\n• Evidence file uploaded\n\nManagers can approve submissions in **Social → Employee Participation**. Approved records automatically award the configured XP points to the employee.",
        "page": "Social"
    },
    {
        "keywords": ["diversity", "gender ratio", "inclusion", "diversity metric", "d&i", "dei"],
        "response": "👥 **Diversity & Inclusion Dashboard**\n\nMonitor your organization's diversity KPIs:\n\n• **Gender Distribution** — Male/Female/Non-binary breakdown\n• **Age Group Analysis** — Gen Z, Millennials, Gen X, Boomers\n• **Departmental Diversity** — diversity score per team\n• **Hiring Trends** — new hires by demographic\n\nView in: Social → Diversity Dashboard",
        "page": "Social"
    },
    {
        "keywords": ["training", "training session", "employee training", "learning", "l&d", "upskill"],
        "response": "📚 **Training Sessions**\n\nEmployee training records track:\n• Training title & category\n• Duration (hours)\n• Status: Scheduled, Completed, Cancelled\n• Trainer & department\n\nTraining hours feed into the Social Score calculation, boosting your ESG rating when employees complete development programs.",
        "page": "Social"
    },

    # ─── GOVERNANCE ────────────────────────────────────────────────────────
    {
        "keywords": ["governance", "compliance", "policy", "audit", "legal", "regulation"],
        "response": "⚖️ **Governance Module**\n\nManage corporate governance across 4 tabs:\n\n1. **Policies** — Create and publish company ESG policies\n2. **Policy Acknowledgements** — Track which employees acknowledged policies\n3. **Audits** — Schedule and record internal/external audits with scores\n4. **Compliance Issues** — Log and track open compliance violations\n\nNavigate to: **Governance** in the sidebar",
        "page": "Governance"
    },
    {
        "keywords": ["policy", "policies", "publish policy", "policy acknowledgement", "acknowledge policy"],
        "response": "📄 **Policy Management**\n\nPolicies define the rules employees must follow:\n\n• **Create** — Add title, category, effective date, content\n• **Publish** — Move from Draft to Published status\n• **Acknowledge** — Employees must confirm they've read the policy\n\nAcknowledgement rate = (Acknowledged / Total Employees) × 100\n\nLow acknowledgement rates flag in the Governance Score.\n\nManage in: Governance → Policies",
        "page": "Governance"
    },
    {
        "keywords": ["audit", "audit score", "internal audit", "external audit", "audit report"],
        "response": "🔍 **Audit Management**\n\nAudits assess your ESG compliance:\n\n• **Audit Type** — Internal or External\n• **Auditor** — assigned employee or external firm\n• **Score** — 0–100 compliance rating\n• **Findings** — documented observations\n• **Status** — Scheduled, In Progress, Published\n\nPublished audit scores feed directly into your department's Governance Score.\n\nManage in: Governance → Audits",
        "page": "Governance"
    },
    {
        "keywords": ["compliance issue", "violation", "open issue", "overdue compliance", "non-compliance", "issue status"],
        "response": "🚨 **Compliance Issues**\n\nCompliance issues track policy violations and risks:\n\n• **Severity** — Low, Medium, High, Critical\n• **Status** — Open → In Progress → Resolved / Overdue\n• **Due Date** — resolution deadline\n• **Assigned To** — responsible employee\n\n⚠️ Overdue issues heavily penalize your Governance Score.\n\nManage in: Governance → Compliance Issues",
        "page": "Governance"
    },

    # ─── GAMIFICATION ──────────────────────────────────────────────────────
    {
        "keywords": ["gamification", "game", "gamify", "challenge", "xp", "experience points", "points"],
        "response": "🎮 **Gamification Module**\n\nMake sustainability fun and engaging:\n\n1. **Challenges** — Time-limited ESG sprints employees can join\n2. **Challenge Participation** — Track submissions and approve completions\n3. **Badge Gallery** — Unlockable achievement badges\n4. **Rewards** — XP-redeemable physical/digital rewards\n5. **Leaderboard** — Company-wide employee XP ranking\n\nNavigate to: **Gamification** in the sidebar",
        "page": "Gamification"
    },
    {
        "keywords": ["challenge", "join challenge", "challenge participation", "sprint", "esg challenge"],
        "response": "🏆 **ESG Challenges**\n\nChallenges are time-bound sustainability sprints:\n\n• **Join** — Employees enroll and complete the challenge task\n• **Submit** — Upload proof of completion\n• **Approval** — Manager reviews and approves submissions\n• **XP Award** — Approved participants earn XP points\n\nChallenge statuses: Draft → Active → Completed / Cancelled\n\nManage in: Gamification → Challenges",
        "page": "Gamification"
    },
    {
        "keywords": ["badge", "badges", "badge gallery", "achievement", "unlock badge", "badge unlock"],
        "response": "🥇 **Badge Gallery**\n\nBadges are achievement milestones earned by employees:\n\n• **XP Threshold** — Badge unlocks when employee reaches a certain XP level\n• **Category** — Environmental, Social, Governance, or General\n• **Rarity** — Common, Rare, Epic, Legendary\n\nIf **Auto Badge Unlock** is enabled (Settings → ESG Configuration), badges award automatically.\n\nView in: Gamification → Badge Gallery",
        "page": "Gamification"
    },
    {
        "keywords": ["reward", "redeem", "redemption", "reward redemption", "xp reward", "prize"],
        "response": "🎁 **Rewards & Redemption**\n\nEmployees can redeem their earned XP for rewards:\n\n• **Reward Types** — Gift cards, days off, merchandise, certificates\n• **XP Cost** — Each reward has an XP price\n• **Status** — Pending → Approved → Dispatched\n\nTo redeem: Gamification → Rewards → Click Redeem\n\n⚠️ Note: Redeemed XP is deducted from the employee's balance.",
        "page": "Gamification"
    },
    {
        "keywords": ["leaderboard", "ranking", "top employee", "xp ranking", "employee rank", "top performers"],
        "response": "🏅 **Leaderboard**\n\nThe company-wide XP leaderboard ranks all employees:\n\n• **Rank** — based on total XP earned\n• **Level** — determined by XP tier (e.g. Level 1–10)\n• **Badges Count** — total badges unlocked\n• **Department** — team affiliation\n\nUpdates in real-time as challenges are completed and participations approved.\n\nView in: Gamification → Leaderboard",
        "page": "Gamification"
    },

    # ─── REPORTS ───────────────────────────────────────────────────────────
    {
        "keywords": ["report", "reports", "analytics", "reporting", "download report", "generate report"],
        "response": "📊 **Reports Module**\n\nGenerate, preview, and export ESG reports:\n\n• **Environmental Report** — Carbon ledger + goal progress\n• **Social Report** — CSR participation + training logs\n• **Governance Report** — Compliance issues + audit scores\n• **ESG Summary** — Corporate-wide ESG Score Card\n• **Custom Builder** — Filter any module by department, employee, date range\n\nExport as **PDF**, **Excel (.xlsx)**, or **CSV**.\n\nNavigate to: **Reports** in the sidebar",
        "page": "Reports"
    },
    {
        "keywords": ["pdf", "excel", "csv", "export", "download", "report download"],
        "response": "⬇️ **Exporting Reports**\n\nAll reports support three export formats:\n\n• **PDF** — Formatted document with summary KPIs and data tables\n• **Excel (.xlsx)** — Spreadsheet with styled headers and auto-sized columns\n• **CSV** — Raw comma-separated data for further analysis\n\nTo export:\n1. Go to **Reports**\n2. Apply any filters (department, date range, status)\n3. Click **Export: PDF / Excel / CSV**\n\nThe file will download automatically.",
        "page": "Reports"
    },
    {
        "keywords": ["custom report", "custom builder", "report builder", "filter report", "build report"],
        "response": "🔧 **Custom Report Builder**\n\nBuild a tailored report with precise filters:\n\n• **Module** — Environmental / Social / Governance / Gamification\n• **Department** — Filter by a specific team\n• **Employee** — Focus on one employee's records\n• **Date Range** — Start and End date window\n• **Status** — Filter by activity status\n\nClick **Run Report** to preview, then export in your preferred format.\n\nNavigate to: Reports → Custom Builder tab",
        "page": "Reports"
    },
    {
        "keywords": ["esg summary", "scorecard", "esg scorecard", "executive summary", "corporate esg"],
        "response": "🏢 **ESG Corporate Score Card**\n\nThe ESG Summary report gives a top-level view of all departments:\n\n| Department | Environmental | Social | Governance |\n|------------|--------------|--------|------------|\n| Dept A | 95 | 88 | 92 |\n| Dept B | 78 | 91 | 85 |\n\n• **Overall ESG Index** = weighted average of all three scores\n• **Total Carbon Emissions** — organization-wide CO₂ total\n• **Active Departments** — departments contributing to scores\n\nGenerate via: Reports → ESG Summary tab",
        "page": "Reports"
    },

    # ─── SETTINGS ──────────────────────────────────────────────────────────
    {
        "keywords": ["settings", "configuration", "configure", "admin", "setup", "preferences"],
        "response": "⚙️ **Settings & Administration**\n\nConfigure the platform across 4 tabs:\n\n1. **Departments** — Add/edit/delete departments, bulk import/export\n2. **Categories** — Manage ESG activity categories (Environmental/Social/Governance)\n3. **ESG Configuration** — Toggle platform features, auto-calculations, badge automation\n4. **Notification Settings** — Per-employee notification preferences\n\nNavigate to: **Settings** in the sidebar",
        "page": "Settings"
    },
    {
        "keywords": ["department", "departments", "create department", "department head", "parent department"],
        "response": "🏢 **Department Management**\n\nDepartments organize your workforce and ESG data:\n\n• **Create** — Name, Code (auto-uppercased), Head Manager, Parent Department\n• **Edit** — Update any department attribute\n• **Delete** — Only empty departments (no active employees) can be deleted\n• **Statistics** — Total count, active/inactive split, total headcount\n• **Bulk Import** — Upload CSV/Excel with columns: name, code, status, head, parent_department\n• **Export** — Download as PDF, Excel, or CSV\n\nManage in: Settings → Departments",
        "page": "Settings"
    },
    {
        "keywords": ["category", "categories", "esg category", "category type", "social category"],
        "response": "🏷️ **ESG Categories**\n\nCategories classify CSR activities and ESG data:\n\n• **Type** — Environmental, Social, or Governance\n• **Name** — e.g. 'Carbon Offsets', 'Volunteer Programs'\n• **Status** — Active / Inactive\n\nCategories are used across all modules — CSR activities, challenges, reports.\n\nManage in: Settings → Categories",
        "page": "Settings"
    },
    {
        "keywords": ["notification", "notifications", "email notification", "alert", "notify"],
        "response": "🔔 **Notification Settings**\n\nConfigure per-employee notification preferences:\n\n• **Email Notifications** — global email delivery toggle\n• **Badge Notifications** — alerts when badges are unlocked\n• **CSR Notifications** — activity approval alerts\n• **Challenge Notifications** — challenge updates\n• **Policy Reminders** — policy acknowledgement reminders\n• **Compliance Notifications** — compliance issue updates\n\nChange individual employee settings in: Settings → Notification Settings",
        "page": "Settings"
    },
    {
        "keywords": ["auto emission", "auto calculation", "auto badge", "require evidence", "platform toggle"],
        "response": "🔧 **ESG Configuration Toggles**\n\nThree core platform behaviors can be toggled:\n\n1. **Auto Emission Calculation** — Auto-compute CO₂ when quantity is entered\n2. **Require Evidence** — Force file uploads for CSR activity participation\n3. **Auto Badge Unlock** — Automatically award badges when XP thresholds are reached\n\nChange in: Settings → ESG Configuration\n\n⚠️ Changes take effect immediately across the entire platform.",
        "page": "Settings"
    },
    {
        "keywords": ["score weight", "esg weight", "weight percentage", "domain weight", "environmental weight"],
        "response": "⚖️ **ESG Score Weights**\n\nAdjust how much each domain impacts the overall ESG Score:\n\n• Environmental Weight (default 33.33%)\n• Social Weight (default 33.33%)\n• Governance Weight (default 33.34%)\n\n**Rule:** All three weights must sum to exactly 100%.\n\nUse the sliders in the Settings sidebar widget to adjust, then click **Save Weights**.",
        "page": "Settings"
    },

    # ─── EMPLOYEES ─────────────────────────────────────────────────────────
    {
        "keywords": ["employee", "employees", "staff", "worker", "employee profile"],
        "response": "👤 **Employee Profiles**\n\nEmployee profiles track:\n• Full name, Employee ID, Designation\n• Department assignment\n• Joining date & status (Active/Inactive)\n• XP balance & level\n• Badges unlocked\n• Participations history\n\nEmployees appear in dropdown selectors across all modules (transaction logging, challenge joining, report filtering).",
        "page": None
    },

    # ─── BULK IMPORT ───────────────────────────────────────────────────────
    {
        "keywords": ["bulk import", "import departments", "import csv", "import excel", "upload departments", "bulk upload"],
        "response": "📤 **Bulk Department Import**\n\nTo import departments in bulk:\n1. Go to **Settings → Departments**\n2. Click **Bulk Import**\n3. Upload a **CSV or Excel** file with columns:\n   - `name` (required)\n   - `code` (required, auto-uppercased)\n   - `status` — 'active' or 'inactive'\n   - `head` — Employee ID (integer)\n   - `parent_department` — Department ID (integer)\n\n✅ Existing departments (matched by code) will be updated, not duplicated.",
        "page": "Settings"
    },

    # ─── ERRORS / TROUBLESHOOTING ──────────────────────────────────────────
    {
        "keywords": ["error", "404", "not found", "failed", "bug", "problem", "issue", "broken"],
        "response": "🔧 **Troubleshooting Common Issues**\n\n• **404 Not Found** — URL may have a typo or the record was deleted\n• **400 Bad Request** — A required field is missing (e.g. transaction_date, employee)\n• **Connection Failed** — Django backend may not be running. Check `python manage.py runserver`\n• **Empty Lists** — Ensure you have departments, employees, and categories seeded in the database\n• **Export Fails** — Check the export format parameter (pdf/excel/csv only)\n\nFor persistent issues, check the browser console (F12) for detailed error messages.",
        "page": None
    },
    {
        "keywords": ["400", "bad request", "required field", "missing field", "validation error"],
        "response": "⚠️ **400 Bad Request — Validation Error**\n\nThis usually means a required field is missing or invalid. Common culprits:\n\n• **Carbon Transactions** — `transaction_date` is required\n• **Departments** — `name` and `code` are required; `code` must be unique\n• **ESG Weights** — must sum to exactly 100.00\n• **Challenges** — `start_date`, `end_date`, and `category` are required\n• **Rewards** — `xp_cost` must be a positive number\n\nCheck the form for red error messages, or look at the browser Network tab for the full error JSON.",
        "page": None
    },
    {
        "keywords": ["backend", "django", "server", "api", "runserver", "backend offline"],
        "response": "🖥️ **Backend / Django Server**\n\nThe EcoSphere backend runs on Django REST Framework.\n\n**To start the backend:**\n```\ncd Backend\npython manage.py runserver\n```\nDefault URL: `http://127.0.0.1:8000/`\n\n**API Docs:** Visit `http://127.0.0.1:8000/swagger/` for the full interactive API documentation.\n\nIf data isn't loading, ensure:\n1. Django server is running\n2. Database is migrated (`python manage.py migrate`)\n3. CORS is configured to allow the Vite dev server origin",
        "page": None
    },
]

# Default fallback response
DEFAULT_RESPONSE = (
    "🤔 I'm not sure about that specific question. Here are some topics I can help with:\n\n"
    "• 🌿 **Environmental** — carbon tracking, emission factors, goals\n"
    "• 🤝 **Social** — CSR activities, participation, diversity\n"
    "• ⚖️ **Governance** — policies, audits, compliance issues\n"
    "• 🎮 **Gamification** — challenges, XP, badges, rewards, leaderboard\n"
    "• 📊 **Reports** — generate, preview, export ESG reports\n"
    "• ⚙️ **Settings** — departments, categories, notifications, ESG weights\n\n"
    "Try asking something like:\n"
    "*'How do I log a carbon transaction?'*\n"
    "*'What is the ESG score?'*\n"
    "*'How do I join a challenge?'*"
)


def find_best_response(message: str) -> dict:
    """
    Match the user message against keyword rules.
    Returns the best matching rule or the default fallback.
    Uses a scoring system — the rule with the most keyword matches wins.
    """
    message_lower = message.lower().strip()
    
    best_rule = None
    best_score = 0

    for rule in CHATBOT_RULES:
        score = sum(1 for kw in rule["keywords"] if kw in message_lower)
        if score > best_score:
            best_score = score
            best_rule = rule

    if best_rule and best_score > 0:
        return {
            "response": best_rule["response"],
            "page": best_rule.get("page"),
            "confidence": min(100, best_score * 30),
            "matched": True
        }

    return {
        "response": DEFAULT_RESPONSE,
        "page": None,
        "confidence": 0,
        "matched": False
    }
