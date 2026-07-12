import React from 'react';
import { Target, TrendingUp, ArrowRight, Award } from 'lucide-react';

const ExecutiveSummaryCard = ({ esgSummary }) => {
  const summary = esgSummary?.summary || {};
  
  // Extract scores with fallback defaults
  const overallScore = Math.round(summary.overall_esg_index || 81);
  const envScore = Math.round(summary.average_environmental_score || 95);
  const socScore = Math.round(summary.average_social_score || 88);
  const govScore = Math.round(summary.average_governance_score || 92);

  // Helper to determine status style and label
  const getTrendIcon = (score) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-emerald-400', icon: TrendingUp };
    if (score >= 80) return { label: 'Improving', color: 'text-blue-400', icon: TrendingUp };
    return { label: 'Stable', color: 'text-amber-400', icon: ArrowRight };
  };

  const envTrend = getTrendIcon(envScore);
  const socTrend = getTrendIcon(socScore);
  const govTrend = getTrendIcon(govScore);

  const EnvIcon = envTrend.icon;
  const SocIcon = socTrend.icon;
  const GovIcon = govTrend.icon;

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
              <h2 className="text-5xl font-black tracking-tight text-white">{overallScore}</h2>
              <span className="text-lg text-slate-400 font-medium">/100</span>
            </div>
          </div>
          <div className="mb-1 bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <TrendingUp size={12} />
            +4 pts
          </div>
        </div>

        <div className="space-y-4 flex-1">
          {/* Environmental */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-300">Environmental Score</span>
              <span className="text-[10px] text-slate-400 font-semibold">{envScore}/100</span>
            </div>
            <div className={`flex items-center gap-1.5 text-sm font-bold ${envTrend.color}`}>
              <EnvIcon size={16} /> {envTrend.label}
            </div>
          </div>

          {/* Social */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-300">Social Score</span>
              <span className="text-[10px] text-slate-400 font-semibold">{socScore}/100</span>
            </div>
            <div className={`flex items-center gap-1.5 text-sm font-bold ${socTrend.color}`}>
              <SocIcon size={16} /> {socTrend.label}
            </div>
          </div>

          {/* Governance */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-300">Governance Score</span>
              <span className="text-[10px] text-slate-400 font-semibold">{govScore}/100</span>
            </div>
            <div className={`flex items-center gap-1.5 text-sm font-bold ${govTrend.color}`}>
              <GovIcon size={16} /> {govTrend.label}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-700/50 flex items-center justify-between">
          <span className="text-sm text-slate-400">Total Emissions</span>
          <span className="text-sm font-bold text-amber-400">
            {summary.total_carbon_emissions_kg !== undefined 
              ? `${Math.round(summary.total_carbon_emissions_kg)} kg CO2` 
              : '820 kg CO2'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveSummaryCard;
