import { useState, useEffect } from 'react';
import ScoreCard from '../components/ScoreCard';
import EmissionChart from '../components/EmissionChart';
import DepartmentChart from '../components/DepartmentChart';
import RecentActivity from '../components/RecentActivity';
import QuickActions from '../components/QuickActions';
import { Leaf, Users, Briefcase, Activity, X, Trophy, Download, AlertCircle, RefreshCw } from 'lucide-react';
import { BASE_API_URL } from '../config';

const Dashboard = ({ environmentalScore, governanceScore, gamificationScore }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dashboard states
  const [cardScores, setCardScores] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [departmentRanking, setDepartmentRanking] = useState([]);
  const [activities, setActivities] = useState([]);

  // Modal open states
  const [showLogModal, setShowLogModal] = useState(false);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);

  // Form selections / dropdown data
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [emissionFactors, setEmissionFactors] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [reportsData, setReportsData] = useState(null);
  const [reportsLoading, setReportsLoading] = useState(false);

  // Toast status notification
  const [toast, setToast] = useState(null);

  // Form states
  const [logForm, setLogForm] = useState({
    department: '',
    employee: '',
    activity_type: 'electricity',
    quantity: '',
    unit: '',
    emission_factor: '',
    notes: ''
  });

  const [challengeForm, setChallengeForm] = useState({
    challenge: '',
    employee: ''
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch executive scores
      const execRes = await fetch(`${BASE_API_URL}/api/dashboard/executive/`);
      if (execRes.ok) {
        const data = await execRes.json();
        setCardScores(data.card_scores);
        if (data.monthly_trend) {
          const formatted = data.monthly_trend.map(item => {
            const parts = item.date.split('-');
            const monthName = new Date(2000, parseInt(parts[1], 10) - 1).toLocaleString('default', { month: 'short' });
            return {
              month: monthName,
              value: parseFloat(item.emissions)
            };
          }).reverse();
          setMonthlyTrend(formatted);
        }
      }

      // 2. Fetch department ESG rankings
      const deptRes = await fetch(`${BASE_API_URL}/api/dashboard/department-esg-ranking/`);
      if (deptRes.ok) {
        const data = await deptRes.json();
        const results = Array.isArray(data) ? data : (data.results || []);
        const formatted = results.map(item => ({
          department: item.name,
          score: Math.round(item.overall_esg_score)
        }));
        setDepartmentRanking(formatted);
      }

      // 3. Fetch recent activities
      const actRes = await fetch(`${BASE_API_URL}/api/dashboard/recent-activities/`);
      if (actRes.ok) {
        const data = await actRes.json();
        const results = Array.isArray(data) ? data : (data.results || []);
        setActivities(results);
      }
      setError(null);
    } catch (err) {
      console.warn("Backend offline or unreachable, falling back to mock data.", err);
      setError("Local backend unreachable. Displaying mock overview.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboardData();
  }, []);

  // Fetch dropdown lists when opening Log Carbon Data Modal
  const handleOpenLogModal = async () => {
    setShowLogModal(true);
    try {
      const [deptRes, empRes, efRes] = await Promise.all([
        fetch(`${BASE_API_URL}/api/users/departments/`),
        fetch(`${BASE_API_URL}/api/users/employees/`),
        fetch(`${BASE_API_URL}/api/environmental/emission-factors/`)
      ]);
      
      if (deptRes.ok) {
        const data = await deptRes.json();
        setDepartments(Array.isArray(data) ? data : (data.results || []));
      }
      if (empRes.ok) {
        const data = await empRes.json();
        setEmployees(Array.isArray(data) ? data : (data.results || []));
      }
      if (efRes.ok) {
        const data = await efRes.json();
        setEmissionFactors(Array.isArray(data) ? data : (data.results || []));
      }
    } catch (err) {
      console.error("Failed to load options for logging carbon data", err);
    }
  };

  // Fetch dropdown lists when opening Start Challenge Modal
  const handleOpenChallengeModal = async () => {
    setShowChallengeModal(true);
    try {
      const [challengeRes, empRes] = await Promise.all([
        fetch(`${BASE_API_URL}/api/gamification/challenges/`),
        fetch(`${BASE_API_URL}/api/users/employees/`)
      ]);
      
      if (challengeRes.ok) {
        const data = await challengeRes.json();
        setChallenges(Array.isArray(data) ? data : (data.results || []));
      }
      if (empRes.ok) {
        const data = await empRes.json();
        setEmployees(Array.isArray(data) ? data : (data.results || []));
      }
    } catch (err) {
      console.error("Failed to load options for challenges", err);
    }
  };

  // Fetch ESG summary when opening View Reports Modal
  const handleOpenReportsModal = async () => {
    setShowReportsModal(true);
    setReportsLoading(true);
    try {
      const res = await fetch(`${BASE_API_URL}/api/reports/esg-summary/`);
      if (res.ok) {
        setReportsData(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch reports summary", err);
    } finally {
      setReportsLoading(false);
    }
  };

  // Form Submission Handlers
  const handleLogSubmit = async (e) => {
    e.preventDefault();
    if (!logForm.department || !logForm.employee || !logForm.quantity || !logForm.emission_factor) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    let unit = logForm.unit;
    if (!unit && logForm.emission_factor) {
      const selectedFactor = emissionFactors.find(f => f.id === parseInt(logForm.emission_factor));
      if (selectedFactor) unit = selectedFactor.unit;
    }

    const payload = {
      department: parseInt(logForm.department),
      employee: parseInt(logForm.employee),
      activity_type: logForm.activity_type,
      quantity: parseFloat(logForm.quantity),
      unit: unit || 'kWh',
      emission_factor: parseInt(logForm.emission_factor),
      notes: logForm.notes
    };

    try {
      const res = await fetch(`${BASE_API_URL}/api/environmental/transactions//`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok || res.status === 201) {
        showToast("Carbon transaction logged successfully!");
        setShowLogModal(false);
        setLogForm({
          department: '',
          employee: '',
          activity_type: 'electricity',
          quantity: '',
          unit: '',
          emission_factor: '',
          notes: ''
        });
        loadDashboardData();
      } else {
        const errorData = await res.json();
        showToast(errorData?.detail || "Failed to log carbon data", "error");
      }
    } catch {
      showToast("Error connecting to backend", "error");
    }
  };

  const handleChallengeSubmit = async (e) => {
    e.preventDefault();
    if (!challengeForm.challenge || !challengeForm.employee) {
      showToast("Please select both a challenge and an employee", "error");
      return;
    }

    try {
      const res = await fetch(`${BASE_API_URL}/api/gamification/challenges/${challengeForm.challenge}/join/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee: parseInt(challengeForm.employee)
        })
      });

      if (res.ok || res.status === 201) {
        showToast("Successfully enrolled in the challenge!");
        setShowChallengeModal(false);
        setChallengeForm({ challenge: '', employee: '' });
        loadDashboardData();
      } else {
        const errorData = await res.json();
        showToast(errorData?.detail || errorData?.error || "Failed to join challenge. Check if already enrolled.", "error");
      }
    } catch {
      showToast("Error connecting to backend", "error");
    }
  };

  const handleQuickActionClick = (title) => {
    if (title === 'Log Carbon Data') handleOpenLogModal();
    else if (title === 'Start Challenge') handleOpenChallengeModal();
    else if (title === 'View Reports') handleOpenReportsModal();
  };

  // Score computation
  const envScore = cardScores ? Math.round(cardScores.environmental_average_score) : (environmentalScore !== undefined ? environmentalScore : 82);
  const socScore = cardScores ? Math.round(cardScores.social_average_score) : 74;
  const govScore = cardScores ? Math.round(cardScores.governance_average_score) : (governanceScore !== undefined ? governanceScore : 88);
  const overallScore = cardScores ? Math.round(cardScores.overall_esg_score) : Math.round((envScore + socScore + govScore + gamificationScore) / 4);

  return (
    <div className="space-y-6 relative pb-10">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-[100] flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg border transition-all duration-300 transform translate-y-0 ${
          toast.type === 'error' 
            ? 'bg-rose-50 border-rose-100 text-rose-800' 
            : 'bg-emerald-50 border-emerald-100 text-emerald-800'
        }`}>
          <div className={`p-1.5 rounded-full ${toast.type === 'error' ? 'bg-rose-100' : 'bg-emerald-100'}`}>
            <AlertCircle size={16} />
          </div>
          <span className="text-sm font-semibold">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
          <p className="text-sm text-slate-500 mt-1">Monitor your company's ESG performance and sustainability goals.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={loadDashboardData} 
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 text-xs font-semibold shadow-sm transition-colors duration-200"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
            <span className={`w-2 h-2 rounded-full ${error ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`}></span>
            <span className="text-xs font-semibold text-slate-600">
              {error ? 'Mock Overview' : 'Live Connected'}
            </span>
          </div>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ScoreCard 
          title="Environmental Score" 
          score={envScore} 
          total={100} 
          subtitle="Top 15% in Industry"
          icon={Leaf}
          theme="green"
        />
        <ScoreCard 
          title="Social Score" 
          score={socScore} 
          total={100} 
          subtitle={socScore > 80 ? "Good Community Rating" : "Needs Improvement"}
          icon={Users}
          theme="blue"
        />
        <ScoreCard 
          title="Governance Score" 
          score={govScore} 
          total={100} 
          subtitle="Excellent Compliance"
          icon={Briefcase}
          theme="purple"
        />
        <ScoreCard 
          title="Overall ESG Score" 
          score={overallScore} 
          total={100} 
          subtitle="Weighted corporate average"
          icon={Activity}
          theme="darkblue"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EmissionChart data={monthlyTrend} />
        </div>
        <div className="lg:col-span-1">
          <DepartmentChart data={departmentRanking} />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity data={activities} />
        </div>
        <div className="lg:col-span-1">
          <QuickActions onActionClick={handleQuickActionClick} />
        </div>
      </div>

      {/* MODALS */}
      {/* 1. Log Carbon Data Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform scale-100 transition-all flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Leaf className="text-emerald-600" size={20} />
                Log Carbon Activity
              </h3>
              <button 
                onClick={() => setShowLogModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleLogSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Department *
                </label>
                <select 
                  value={logForm.department}
                  onChange={(e) => setLogForm(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Employee *
                </label>
                <select 
                  value={logForm.employee}
                  onChange={(e) => setLogForm(prev => ({ ...prev, employee: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Activity Type *
                  </label>
                  <select 
                    value={logForm.activity_type}
                    onChange={(e) => setLogForm(prev => ({ ...prev, activity_type: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    <option value="electricity">Electricity</option>
                    <option value="gasoline">Gasoline</option>
                    <option value="fuel">Fuel Oil</option>
                    <option value="waste">Waste Disposal</option>
                    <option value="travel">Business Travel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Emission Factor *
                  </label>
                  <select 
                    value={logForm.emission_factor}
                    onChange={(e) => setLogForm(prev => ({ ...prev, emission_factor: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    required
                  >
                    <option value="">Select Factor</option>
                    {emissionFactors.map(factor => (
                      <option key={factor.id} value={factor.id}>
                        {factor.name} ({factor.factor} {factor.unit})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Quantity *
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    placeholder="e.g. 1200.5"
                    value={logForm.quantity}
                    onChange={(e) => setLogForm(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Unit (Override)
                  </label>
                  <input 
                    type="text"
                    placeholder="e.g. kWh, Liters"
                    value={logForm.unit}
                    onChange={(e) => setLogForm(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Notes
                </label>
                <textarea 
                  rows="3"
                  placeholder="Additional context on this activity ledger entry..."
                  value={logForm.notes}
                  onChange={(e) => setLogForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowLogModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm shadow-emerald-500/20"
                >
                  Submit Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Start Challenge Modal */}
      {showChallengeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform scale-100 transition-all flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Trophy className="text-purple-600" size={20} />
                Enroll in Challenge
              </h3>
              <button 
                onClick={() => setShowChallengeModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleChallengeSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Select Challenge *
                </label>
                <select 
                  value={challengeForm.challenge}
                  onChange={(e) => setChallengeForm(prev => ({ ...prev, challenge: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  required
                >
                  <option value="">Choose Challenge</option>
                  {challenges.map(ch => (
                    <option key={ch.id} value={ch.id}>
                      {ch.title} ({ch.xp_reward} XP)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Select Employee *
                </label>
                <select 
                  value={challengeForm.employee}
                  onChange={(e) => setChallengeForm(prev => ({ ...prev, employee: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                  required
                >
                  <option value="">Choose Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowChallengeModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm shadow-purple-500/20"
                >
                  Join Challenge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. View Reports Modal */}
      {showReportsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform scale-100 transition-all flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Activity className="text-blue-600" size={20} />
                ESG Executive Report Summary
              </h3>
              <button 
                onClick={() => setShowReportsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {reportsLoading ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                  <RefreshCw className="animate-spin text-blue-500" size={32} />
                  <span className="text-sm font-medium text-slate-500">Compiling corporate report ledger...</span>
                </div>
              ) : reportsData ? (
                <div className="space-y-4">
                  {/* Environmental */}
                  <div className="bg-emerald-50/55 border border-emerald-100 rounded-xl p-4 flex items-start gap-4">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
                      <Leaf size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Environmental Highlights</h4>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-xs text-slate-600">
                        <div>Total Ledger Emissions:</div>
                        <div className="font-bold text-slate-800">
                          {reportsData.environmental_summary?.total_emissions?.toLocaleString() || 0} kg CO2
                        </div>
                        <div>Goals Achieved:</div>
                        <div className="font-bold text-slate-800">
                          {reportsData.environmental_summary?.goals_achieved || 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Social */}
                  <div className="bg-blue-50/55 border border-blue-100 rounded-xl p-4 flex items-start gap-4">
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0">
                      <Users size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Social Highlights</h4>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-xs text-slate-600">
                        <div>Total CSR Participation Points:</div>
                        <div className="font-bold text-slate-800">
                          {reportsData.social_summary?.total_csr_points || 0}
                        </div>
                        <div>Avg Training Credits:</div>
                        <div className="font-bold text-slate-800">
                          {reportsData.social_summary?.avg_training_hours || 0} hours
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Governance */}
                  <div className="bg-purple-50/55 border border-purple-100 rounded-xl p-4 flex items-start gap-4">
                    <div className="p-2 bg-purple-100 text-purple-700 rounded-lg shrink-0">
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Governance Highlights</h4>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-xs text-slate-600">
                        <div>Average Audit Rating:</div>
                        <div className="font-bold text-slate-800">
                          {reportsData.governance_summary?.avg_audit_score || 0}%
                        </div>
                        <div>Open Compliance Issues:</div>
                        <div className="font-bold text-slate-800">
                          {reportsData.governance_summary?.open_issues || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-sm">
                  Failed to fetch report summary. Please ensure the backend is running.
                </div>
              )}

              {/* Exports */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Download Full Document Ledger
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <a 
                    href={`${BASE_API_URL}/api/reports/esg-summary/?export=pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 text-slate-700 text-xs font-bold transition-all text-center"
                  >
                    <Download size={16} className="text-blue-600" />
                    Export PDF
                  </a>
                  <a 
                    href={`${BASE_API_URL}/api/reports/esg-summary/?export=csv`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 text-slate-700 text-xs font-bold transition-all text-center"
                  >
                    <Download size={16} className="text-emerald-600" />
                    Export CSV
                  </a>
                  <a 
                    href={`${BASE_API_URL}/api/reports/esg-summary/?export=excel`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/20 text-slate-700 text-xs font-bold transition-all text-center"
                  >
                    <Download size={16} className="text-amber-600" />
                    Export Excel
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button 
                onClick={() => setShowReportsModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-colors"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
