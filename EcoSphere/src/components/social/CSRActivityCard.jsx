import React from 'react';
import { Calendar, Award, Users, Check, ArrowRight } from 'lucide-react';

const CSRActivityCard = ({ activity, onJoin }) => {
  const getCategoryImage = (catName) => {
    const name = (catName || '').toLowerCase();
    if (name.includes('clean') || name.includes('river') || name.includes('nature') || name.includes('water')) {
      return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80';
    }
    if (name.includes('tree') || name.includes('plant') || name.includes('forest') || name.includes('garden')) {
      return 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&q=80';
    }
    if (name.includes('health') || name.includes('medical') || name.includes('blood') || name.includes('care')) {
      return 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&q=80';
    }
    return 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80';
  };

  const getStatusBadgeStyle = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'active') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (s === 'upcoming') return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-slate-100 text-slate-700 border-slate-200'; // completed
  };

  const maxParticipants = 50;
  const progress = Math.min(Math.round(((activity.totalJoined || 0) / maxParticipants) * 100), 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="h-40 overflow-hidden relative">
        <img 
          src={getCategoryImage(activity.categoryName)} 
          alt={activity.title} 
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" 
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-bold px-2.5 py-1 rounded-lg text-slate-700 shadow-sm border border-white/50">
          {activity.categoryName}
        </div>
        <div className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-lg border shadow-sm ${getStatusBadgeStyle(activity.status)}`}>
          {activity.status}
        </div>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h4 className="text-base font-bold text-slate-800 line-clamp-1">{activity.title}</h4>
          <span className="flex items-center gap-1 shrink-0 bg-blue-50 text-blue-700 text-xs font-extrabold px-2 py-0.5 rounded-md border border-blue-100">
            <Award size={12} />+{activity.points} XP
          </span>
        </div>
        
        <p className="text-xs text-slate-500 line-clamp-2 mb-4 flex-1">{activity.description}</p>
        
        <div className="space-y-2 mb-4 text-xs font-semibold text-slate-600 border-t border-slate-50 pt-3">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-400" />
            <span>{activity.startDate} {activity.endDate && activity.endDate !== activity.startDate ? `to ${activity.endDate}` : ''}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={14} className="text-slate-400" />
            <span>{activity.totalJoined || 0} Joined ({activity.approvedJoined || 0} Approved)</span>
          </div>
        </div>
        
        <div className="mt-auto">
          <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
            <div 
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <button 
            onClick={() => onJoin(activity)}
            disabled={activity.status.toLowerCase() === 'completed'}
            className={`w-full py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activity.status.toLowerCase() === 'completed'
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow'
            }`}
          >
            <span>{activity.status.toLowerCase() === 'completed' ? 'Activity Completed' : 'Join Activity'}</span>
            {activity.status.toLowerCase() !== 'completed' && <ArrowRight size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CSRActivityCard;
