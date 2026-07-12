import React from 'react';
import { recentActivities } from '../data/dashboardData';
import { CheckCircle2, AlertCircle, Leaf, FileCheck, Trophy, Users, Briefcase } from 'lucide-react';

const RecentActivity = ({ data }) => {
  const activities = data && data.length > 0 ? data : recentActivities;

  const getIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'environmental':
        return <div className="p-2 rounded-full bg-emerald-100 text-emerald-600"><Leaf size={16} /></div>;
      case 'social':
        return <div className="p-2 rounded-full bg-blue-100 text-blue-600"><Users size={16} /></div>;
      case 'governance':
        return <div className="p-2 rounded-full bg-purple-100 text-purple-600"><Briefcase size={16} /></div>;
      case 'gamification':
        return <div className="p-2 rounded-full bg-amber-100 text-amber-600"><Trophy size={16} /></div>;
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

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return timeStr; // fallback if it's already a string like "2 hours ago"
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-slate-800 mb-6">Recent Activity</h3>
      
      <div className="flex-1 space-y-6 max-h-[380px] overflow-y-auto pr-2 scrollbar-thin">
        {activities.map((activity, index) => (
          <div key={activity.id || index} className="flex gap-4 relative">
            {index !== activities.length - 1 && (
              <div className="absolute left-4 top-10 bottom-[-16px] w-[2px] bg-slate-100"></div>
            )}
            <div className="relative z-10 shrink-0">
              {getIcon(activity.type)}
            </div>
            <div className="pt-1.5">
              <p className="text-sm text-slate-700 font-medium">{activity.title || activity.text}</p>
              {activity.description && (
                <p className="text-xs text-slate-500 mt-1">{activity.description}</p>
              )}
              <p className="text-xs text-slate-400 mt-1">{formatTime(activity.time)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
