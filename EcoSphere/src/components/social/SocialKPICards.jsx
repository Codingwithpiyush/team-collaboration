import React from 'react';
import { TreePine, Users, Clock, Star } from 'lucide-react';
import { socialKPIs } from '../../data/socialData';

const SocialKPICards = () => {
  const kpis = [
    { title: 'Trees Planted', value: socialKPIs.treesPlanted, icon: TreePine, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Active Volunteers', value: socialKPIs.activeVolunteers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Volunteer Hours', value: socialKPIs.volunteerHours, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { title: 'Social Score', value: socialKPIs.socialScore, icon: Star, color: 'text-purple-600', bg: 'bg-purple-100' },
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
