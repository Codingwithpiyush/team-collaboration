import React from 'react';
import { Sparkles, ArrowRight, Lightbulb } from 'lucide-react';
import { aiInsightsData, aiRecommendation } from '../../data/reportsData';

const AIInsights = () => {
  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col text-white relative">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Sparkles size={120} />
      </div>
      <div className="p-6 border-b border-indigo-800/50 flex items-center gap-2 relative z-10">
        <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-300">
          <Sparkles size={20} />
        </div>
        <h3 className="text-lg font-bold">AI ESG Insights</h3>
      </div>
      
      <div className="p-6 flex-1 flex flex-col relative z-10">
        <div className="space-y-4 mb-6 flex-1">
          {aiInsightsData.map((insight, index) => (
            <div key={index} className="flex gap-3 bg-white/5 p-3 rounded-lg border border-white/10 backdrop-blur-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0"></div>
              <p className="text-sm text-indigo-50 leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-auto bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl p-4 border border-indigo-400/30">
          <div className="flex items-center gap-2 mb-2 text-indigo-200">
            <Lightbulb size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Recommendation</span>
          </div>
          <p className="text-sm text-white font-medium mb-3">
            {aiRecommendation}
          </p>
          <button className="text-xs font-semibold text-indigo-300 hover:text-white flex items-center gap-1 transition-colors">
            Take Action <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
