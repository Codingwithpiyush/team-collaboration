import React from 'react';
import { Target, TrendingUp, ArrowRight, Award } from 'lucide-react';

const ExecutiveSummaryCard = () => {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-md overflow-hidden h-full flex flex-col text-white relative">
      <div className="p-6 border-b border-slate-700/50 flex items-center justify-between relative z-10">
        <h3 className="text-lg font-bold">Executive Summary</h3>
        <Award className="text-amber-400" size={24} />
      </div>
      
      <div className="p-6 flex-1 flex flex-col relative z-10">
        <div className="flex items-end gap-3 mb-8">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Overall ESG Score</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-5xl font-black tracking-tight text-white">81</h2>
              <span className="text-lg text-slate-400 font-medium">/100</span>
            </div>
          </div>
          <div className="mb-1 bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <TrendingUp size={12} />
            +4 pts
          </div>
        </div>

        <div className="space-y-4 flex-1">
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-sm font-medium text-slate-300">Environmental Trend</span>
            <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-bold">
              <TrendingUp size={16} /> Improving
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-sm font-medium text-slate-300">Social Trend</span>
            <div className="flex items-center gap-1.5 text-blue-400 text-sm font-bold">
              <ArrowRight size={16} /> Stable
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <span className="text-sm font-medium text-slate-300">Governance Trend</span>
            <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-bold">
              <TrendingUp size={16} /> Excellent
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-700/50 flex items-center justify-between">
          <span className="text-sm text-slate-400">Company Performance</span>
          <span className="text-sm font-bold text-amber-400">Top 15% Industry</span>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveSummaryCard;
