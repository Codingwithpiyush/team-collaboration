import React, { useState, useEffect } from 'react';
import { Briefcase, Users, Clock, CheckCircle } from 'lucide-react';
import { BASE_API_URL } from '../../config';

const SocialKPICards = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${BASE_API_URL}/api/social/dashboard/activity-stats/`);
        if (res.ok) {
          setStats(await res.json());
        }
      } catch (err) {
        console.error("Failed to load activity stats", err);
      }
    };
    fetchStats();
  }, []);

  const kpis = [
    { title: 'Active CSR Initiatives', value: stats ? stats.active_activities : 6, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Total Participants', value: stats ? stats.total_participants : 156, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Pending Approvals', value: stats ? stats.pending_approvals : 12, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { title: 'Approved Volunteers', value: stats ? stats.approved_participations : 144, icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {kpis.map((kpi, index) => (
        <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className={`p-4 rounded-xl ${kpi.bg}`}>
            <kpi.icon size={24} className={kpi.color} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">{kpi.title}</p>
            <p className="text-2xl font-bold text-slate-800">{kpi.value.toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SocialKPICards;
