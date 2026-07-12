import React from 'react';
import { recentActivities } from '../data/dashboardData';
import { CheckCircle2, AlertCircle, Leaf, FileCheck } from 'lucide-react';

const RecentActivity = () => {
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <div className="p-2 rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 size={16} /></div>;
      case 'warning':
        return <div className="p-2 rounded-full bg-amber-100 text-amber-600"><AlertCircle size={16} /></div>;
      case 'info':
        return <div className="p-2 rounded-full bg-blue-100 text-blue-600"><Leaf size={16} /></div>;
      case 'neutral':
        return <div className="p-2 rounded-full bg-slate-100 text-slate-600"><FileCheck size={16} /></div>;
      default:
        return <div className="p-2 rounded-full bg-slate-100 text-slate-600"><FileCheck size={16} /></div>;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full">
      <h3 className="text-lg font-semibold text-slate-800 mb-6">Recent Activity</h3>
      
      <div className="space-y-6">
        {recentActivities.map((activity, index) => (
          <div key={activity.id} className="flex gap-4 relative">
            {index !== recentActivities.length - 1 && (
              <div className="absolute left-4 top-10 bottom-[-16px] w-[2px] bg-slate-100"></div>
            )}
            <div className="relative z-10 shrink-0">
              {getIcon(activity.type)}
            </div>
            <div className="pt-1.5">
              <p className="text-sm text-slate-700 font-medium">{activity.text}</p>
              <p className="text-xs text-slate-400 mt-1">2 hours ago</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
