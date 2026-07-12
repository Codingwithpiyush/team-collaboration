import React from 'react';
import { initialActivityLog } from '../../data/settingsData';
import { Activity, Settings, Users, ShieldAlert, Download } from 'lucide-react';

const ActivityTimeline = () => {
  const getIcon = (type) => {
    switch(type) {
      case 'system': return <Settings size={14} />;
      case 'department': return <Users size={14} />;
      case 'config': return <Activity size={14} />;
      case 'notification': return <ShieldAlert size={14} />;
      case 'backup': return <Download size={14} />;
      default: return <Activity size={14} />;
    }
  };

  const getColor = (type) => {
    switch(type) {
      case 'system': return 'bg-purple-100 text-purple-600';
      case 'department': return 'bg-blue-100 text-blue-600';
      case 'config': return 'bg-emerald-100 text-emerald-600';
      case 'notification': return 'bg-amber-100 text-amber-600';
      case 'backup': return 'bg-indigo-100 text-indigo-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Activity size={20} className="text-slate-500" />
        Activity Log
      </h3>
      
      <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
        {initialActivityLog.map((log) => (
          <div key={log.id} className="relative pl-6">
            <div className={`absolute -left-[13px] top-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${getColor(log.type)}`}>
              {getIcon(log.type)}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">{log.action}</p>
              <p className="text-xs text-slate-400 mt-0.5">{log.time}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-6 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-medium rounded-lg transition-colors border border-slate-200 border-dashed">
        View Full History
      </button>
    </div>
  );
};

export default ActivityTimeline;
