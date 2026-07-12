import React, { useState } from 'react';
import { Calendar, MapPin, User, Users, Check } from 'lucide-react';

const CSRActivityCard = ({ activity }) => {
  const [isJoined, setIsJoined] = useState(false);

  const handleJoin = () => {
    setIsJoined(true);
  };

  const currentParticipants = isJoined ? activity.participants + 1 : activity.participants;
  const currentProgress = Math.min(Math.round((currentParticipants / activity.maxParticipants) * 100), 100);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="h-40 overflow-hidden relative">
        <img src={activity.image} alt={activity.title} className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-xs font-semibold px-2 py-1 rounded text-slate-700 shadow-sm">
          {activity.category}
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col">
        <h4 className="text-lg font-bold text-slate-800 mb-3">{activity.title}</h4>
        
        <div className="space-y-2 mb-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-400" />
            <span>{new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-slate-400" />
            <span className="truncate">{activity.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <User size={16} className="text-slate-400" />
            <span className="truncate">Org: {activity.organizer}</span>
          </div>
        </div>
        
        <div className="mt-auto">
          <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{currentParticipants} / {activity.maxParticipants} Participated</span>
            </div>
            <span>{currentProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
            <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${currentProgress}%` }}></div>
          </div>
          
          <button 
            onClick={handleJoin}
            disabled={isJoined || currentParticipants >= activity.maxParticipants}
            className={`w-full py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              isJoined 
                ? 'bg-emerald-100 text-emerald-700 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isJoined && <Check size={16} />}
            {isJoined ? 'Joined' : 'Join Activity'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CSRActivityCard;
