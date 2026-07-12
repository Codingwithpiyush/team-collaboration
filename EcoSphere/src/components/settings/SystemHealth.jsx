import React from 'react';
import { Database, HardDrive, BellRing, Clock, Cpu } from 'lucide-react';

const SystemHealth = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Cpu size={20} className="text-slate-500" />
        System Health
      </h3>

      <div className="space-y-6">
        
        {/* DB Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Database size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">Database Status</p>
              <p className="text-xs text-slate-500">PostgreSQL Primary</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-md flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Connected
          </span>
        </div>

        {/* Storage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <HardDrive size={16} className="text-slate-400" /> Storage Used
            </div>
            <span className="text-sm font-bold text-slate-800">67%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full w-[67%]"></div>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-right">33.5 GB / 50 GB</p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <BellRing size={14} />
              <span className="text-xs font-medium">Notifications</span>
            </div>
            <p className="text-lg font-bold text-slate-800">28 Active</p>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <Clock size={14} />
              <span className="text-xs font-medium">Last Backup</span>
            </div>
            <p className="text-sm font-bold text-slate-800 mt-1">Today 10:30 AM</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Platform Version</span>
          <span className="font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded">v1.0.4-stable</span>
        </div>

      </div>
    </div>
  );
};

export default SystemHealth;
