import React, { useState, useEffect, useCallback } from 'react';
import SocialKPICards from '../components/social/SocialKPICards';
import CSRActivityCard from '../components/social/CSRActivityCard';
import ParticipationTable from '../components/social/ParticipationTable';
import DiversityDashboard from '../components/social/DiversityDashboard';
import SocialDepartmentChart from '../components/social/SocialDepartmentChart';
import Leaderboard from '../components/social/Leaderboard';
import { Plus, X, Search, Filter, Upload, AlertCircle, Info } from 'lucide-react';
import { BASE_API_URL } from '../config';

const SocialPage = ({ activeTab, setActiveTab }) => {
  const [activities, setActivities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Join activity modal state
  const [joiningActivity, setJoiningActivity] = useState(null);
  const [joinEmployeeId, setJoinEmployeeId] = useState('');
  const [joinEvidence, setJoinEvidence] = useState(null);
  const [joinSubmitting, setJoinSubmitting] = useState(false);
  const [evidenceRequired, setEvidenceRequired] = useState(false);

  // New Activity form state
  const [newActivity, setNewActivity] = useState({
    title: '',
    category: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    points: '50',
    status: 'upcoming'
  });
  const [formErrors, setFormErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${BASE_API_URL}/api/social/activities/`;
      const params = [];
      if (statusFilter !== 'All') params.push(`status=${statusFilter.toLowerCase()}`);
      if (categoryFilter !== 'All') params.push(`category=${categoryFilter}`);
      if (searchTerm) params.push(`search=${encodeURIComponent(searchTerm)}`);

      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const body = await res.json();
        const results = Array.isArray(body) ? body : (body.results || []);
        
        // Fetch extra participation details for each activity
        const detailedActivities = await Promise.all(results.map(async (act) => {
          try {
            const detailRes = await fetch(`${BASE_API_URL}/api/social/activities/${act.id}/`);
            if (detailRes.ok) {
              const detailData = await detailRes.json();
              return {
                id: act.id,
                title: act.title,
                categoryName: act.category_name || `Category ${act.category}`,
                categoryId: act.category,
                description: act.description,
                startDate: act.start_date,
                endDate: act.end_date,
                points: act.points,
                status: act.status,
                totalJoined: detailData.total_joined_employees || 0,
                approvedJoined: detailData.approved_participants || 0,
                evidenceRequired: detailData.evidence_required || false
              };
            }
          } catch (e) {
            console.error(e);
          }
          return {
            id: act.id,
            title: act.title,
            categoryName: act.category_name || `Category ${act.category}`,
            categoryId: act.category,
            description: act.description,
            startDate: act.start_date,
            endDate: act.end_date,
            points: act.points,
            status: act.status,
            totalJoined: 0,
            approvedJoined: 0,
            evidenceRequired: false
          };
        }));
        
        setActivities(detailedActivities);
      }
    } catch (err) {
      console.error("Failed to load CSR activities", err);
      showToast("Backend connection failed. Displaying local mocks.", "error");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, searchTerm]);

  // Load general details
  useEffect(() => {
    const fetchGeneralDetails = async () => {
      try {
        const [catRes, empRes] = await Promise.all([
          fetch(`${BASE_API_URL}/api/users/categories/dropdown/`),
          fetch(`${BASE_API_URL}/api/users/employees/dropdown/`)
        ]);
        if (catRes.ok) {
          const cats = await catRes.json();
          // Filter only social categories or display all
          setCategories(cats);
        }
        if (empRes.ok) {
          setEmployees(await empRes.json());
        }
      } catch (err) {
        console.error("Failed to fetch general category/employee options", err);
      }
    };
    fetchGeneralDetails();
  }, []);

  useEffect(() => {
    if (activeTab === 'CSR Activities') {
      fetchActivities();
    }
  }, [activeTab, fetchActivities]);

  const handleOpenJoin = (activity) => {
    setJoiningActivity(activity);
    setJoinEmployeeId(employees[0]?.id || '');
    setJoinEvidence(null);
    setEvidenceRequired(activity.evidenceRequired || false);
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    if (!joinEmployeeId) {
      showToast("Please select an employee profile.", "error");
      return;
    }
    if (evidenceRequired && !joinEvidence) {
      showToast("Evidence proof file is required for this activity.", "error");
      return;
    }

    setJoinSubmitting(true);
    const formData = new FormData();
    formData.append('employee', joinEmployeeId);
    if (joinEvidence) {
      formData.append('evidence', joinEvidence);
    }

    try {
      const res = await fetch(`${BASE_API_URL}/api/social/activities/${joiningActivity.id}/join//`, {
        method: 'POST',
        body: formData
      });

      if (res.ok || res.status === 201) {
        showToast("Successfully enrolled in CSR activity!");
        setJoiningActivity(null);
        fetchActivities();
      } else {
        const errorData = await res.json();
        showToast(errorData?.detail || errorData?.non_field_errors?.[0] || "Failed to join activity", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error connecting to backend server", "error");
    } finally {
      setJoinSubmitting(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!newActivity.title.trim()) errors.title = 'Required';
    if (!newActivity.category) errors.category = 'Required';
    if (!newActivity.description.trim()) errors.description = 'Required';
    if (!newActivity.startDate) errors.startDate = 'Required';
    if (!newActivity.endDate) errors.endDate = 'Required';
    if (newActivity.endDate < newActivity.startDate) errors.endDate = 'End date must be after start date';
    if (isNaN(parseInt(newActivity.points)) || parseInt(newActivity.points) <= 0) errors.points = 'Must be positive';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsCreating(true);

    const payload = {
      title: newActivity.title.trim(),
      category: parseInt(newActivity.category),
      description: newActivity.description.trim(),
      start_date: newActivity.startDate,
      end_date: newActivity.endDate,
      points: parseInt(newActivity.points),
      status: newActivity.status
    };

    try {
      const res = await fetch(`${BASE_API_URL}/api/social/activities/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok || res.status === 201) {
        showToast("CSR Activity created successfully!");
        setShowCreateModal(false);
        setNewActivity({
          title: '',
          category: categories[0]?.id || '',
          description: '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          points: '50',
          status: 'upcoming'
        });
        fetchActivities();
      } else {
        const errorData = await res.json();
        showToast(errorData?.detail || errorData?.non_field_errors?.[0] || "Failed to create activity", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error connecting to backend server", "error");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-medium ${
          toastType === 'error' ? 'bg-red-900 text-red-100' : 'bg-slate-900 text-white'
        }`}>
          <span className={`w-2.5 h-2.5 rounded-full ${toastType === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
          {toastMessage}
        </div>
      )}

      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">CSR & Employee Engagement</h2>
            <p className="text-sm text-slate-500 mt-1">Manage activities, track participation, and monitor social impact.</p>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold">
            Live Integrated
          </div>
        </div>
        
        {/* Horizontal Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {['CSR Activities', 'Employee Participation', 'Diversity Dashboard'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white border border-blue-600 shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-800 shadow-sm'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'CSR Activities' && (
            <button 
              onClick={() => {
                setNewActivity(prev => ({ ...prev, category: categories[0]?.id || '' }));
                setFormErrors({});
                setShowCreateModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors inline-flex items-center gap-2 shadow-sm"
            >
              <Plus size={18} />
              New Activity
            </button>
          )}
        </div>
      </div>

      {activeTab === 'CSR Activities' && (
        <>
          <SocialKPICards />
          
          {/* Filters Bar */}
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
                <Filter size={16} className="text-slate-400" />
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer">
                  <option value="All">All Statuses</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="bg-transparent text-sm font-semibold text-slate-700 outline-none cursor-pointer">
                  <option value="All">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="relative w-72 max-w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search CSR activity..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">CSR Activities Ledger</h3>
            {loading ? (
              <div className="text-center py-16 text-slate-500 font-medium bg-white rounded-2xl border border-slate-100 shadow-sm">Loading activity list...</div>
            ) : activities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {activities.map(activity => (
                  <CSRActivityCard key={activity.id} activity={activity} onJoin={handleOpenJoin} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center text-slate-500">
                <Info size={32} className="mx-auto text-slate-400 mb-2" />
                <p className="font-semibold text-slate-700">No CSR activities found</p>
                <p className="text-xs text-slate-400 mt-1">Try modifying your filter options or add a new CSR activity.</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'Employee Participation' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ParticipationTable />
          </div>
          <div className="lg:col-span-1">
            <Leaderboard />
          </div>
        </div>
      )}

      {activeTab === 'Diversity Dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DiversityDashboard />
          <SocialDepartmentChart />
        </div>
      )}

      {/* New Activity Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Create New Activity</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddActivity} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Activity Title</label>
                <input 
                  type="text" 
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="e.g. Local River Clean-up Drive"
                />
                {formErrors.title && <p className="text-xs text-red-500 mt-1">{formErrors.title}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                  value={newActivity.category}
                  onChange={(e) => setNewActivity({...newActivity, category: e.target.value})}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="" disabled>Select category...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {formErrors.category && <p className="text-xs text-red-500 mt-1">{formErrors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  value={newActivity.description}
                  onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 h-20 resize-none"
                  placeholder="Describe the CSR project and scope..."
                />
                {formErrors.description && <p className="text-xs text-red-500 mt-1">{formErrors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <input 
                    type="date"
                    value={newActivity.startDate}
                    onChange={(e) => setNewActivity({...newActivity, startDate: e.target.value})}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  {formErrors.startDate && <p className="text-xs text-red-500 mt-1">{formErrors.startDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input 
                    type="date"
                    value={newActivity.endDate}
                    onChange={(e) => setNewActivity({...newActivity, endDate: e.target.value})}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  {formErrors.endDate && <p className="text-xs text-red-500 mt-1">{formErrors.endDate}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Reward Points (XP)</label>
                  <input 
                    type="number"
                    value={newActivity.points}
                    onChange={(e) => setNewActivity({...newActivity, points: e.target.value})}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  {formErrors.points && <p className="text-xs text-red-500 mt-1">{formErrors.points}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select 
                    value={newActivity.status}
                    onChange={(e) => setNewActivity({...newActivity, status: e.target.value})}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isCreating}
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                >
                  {isCreating ? 'Creating...' : 'Create Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Activity Modal */}
      {joiningActivity && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Enroll in Activity</h3>
                <p className="text-xs text-slate-500 truncate mt-0.5">{joiningActivity.title}</p>
              </div>
              <button onClick={() => setJoiningActivity(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleJoinSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Select Employee Profile</label>
                <select 
                  value={joinEmployeeId}
                  onChange={(e) => setJoinEmployeeId(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Upload Verification Proof {evidenceRequired && <span className="text-red-500">*</span>}
                </label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    onChange={(e) => setJoinEvidence(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload size={28} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-xs font-semibold text-slate-600">
                    {joinEvidence ? joinEvidence.name : 'Click to upload proof file'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, PDF up to 5MB</p>
                </div>
                {evidenceRequired && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-600 font-semibold mt-2">
                    <AlertCircle size={14} />
                    <span>Evidence proof file is required by company policy.</span>
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setJoiningActivity(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={joinSubmitting}
                  className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                >
                  {joinSubmitting ? 'Submitting...' : 'Register Enrollment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialPage;
