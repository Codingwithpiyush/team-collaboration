import React, { useState } from 'react';
import SocialKPICards from '../components/social/SocialKPICards';
import CSRActivityCard from '../components/social/CSRActivityCard';
import ParticipationTable from '../components/social/ParticipationTable';
import DiversityDashboard from '../components/social/DiversityDashboard';
import SocialDepartmentChart from '../components/social/SocialDepartmentChart';
import Leaderboard from '../components/social/Leaderboard';
import { csrActivities as initialActivities } from '../data/socialData';
import { Plus, X } from 'lucide-react';

const SocialPage = ({ activeTab, setActiveTab }) => {
  const [activities, setActivities] = useState(initialActivities);
  const [showModal, setShowModal] = useState(false);
  
  const [newActivity, setNewActivity] = useState({
    title: '',
    category: 'Environment',
    location: '',
  });

  const handleAddActivity = (e) => {
    e.preventDefault();
    if (!newActivity.title) return;
    
    const activity = {
      id: Date.now(),
      title: newActivity.title,
      category: newActivity.category,
      date: new Date().toISOString().split('T')[0],
      location: newActivity.location || 'TBD',
      organizer: 'Current User',
      participants: 0,
      maxParticipants: 50,
      progress: 0,
      image: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?w=400&q=80', // generic tree/nature image
    };
    
    setActivities([activity, ...activities]);
    setShowModal(false);
    setNewActivity({ title: '', category: 'Environment', location: '' });
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">CSR & Employee Engagement</h2>
          <p className="text-sm text-slate-500 mt-1">Manage activities, track participation, and monitor social impact.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          New Activity
        </button>
      </div>

      {activeTab === 'CSR Activities' && (
        <>
          <SocialKPICards />
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">CSR Activities</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {activities.map(activity => (
                <CSRActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
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
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Create New Activity</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddActivity} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Activity Title</label>
                <input 
                  type="text" 
                  required
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Community Garden Prep"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select 
                  value={newActivity.category}
                  onChange={(e) => setNewActivity({...newActivity, category: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option>Environment</option>
                  <option>Health</option>
                  <option>Community</option>
                  <option>Education</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input 
                  type="text" 
                  value={newActivity.location}
                  onChange={(e) => setNewActivity({...newActivity, location: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Main Office"
                />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Create Activity
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
