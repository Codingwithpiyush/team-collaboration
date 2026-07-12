import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, AlertTriangle } from 'lucide-react';
import { useToast } from '../reports/ToastNotifications';

const ScoreWeightSettings = () => {
  const [weights, setWeights] = useState({
    environmental: 40,
    social: 30,
    governance: 30
  });
  const [total, setTotal] = useState(100);
  const { addToast } = useToast();

  useEffect(() => {
    setTotal(weights.environmental + weights.social + weights.governance);
  }, [weights]);

  const handleChange = (key, value) => {
    setWeights(prev => ({ ...prev, [key]: parseInt(value) || 0 }));
  };

  const handleSave = () => {
    if (total !== 100) {
      addToast('Total weight must equal exactly 100%', 'error');
      return;
    }
    addToast('Score weights updated successfully', 'success');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <SlidersHorizontal size={20} className="text-slate-500" />
            ESG Score Weights
          </h3>
          <p className="text-xs text-slate-500 mt-1">Impact distribution for overall ESG score</p>
        </div>
        <span className={`text-lg font-bold px-3 py-1 rounded-lg border ${
          total === 100 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
        }`}>
          {total}%
        </span>
      </div>

      {total !== 100 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-700 text-sm">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
          <p>The total weight is <strong>{total}%</strong>. It must equal exactly 100%.</p>
        </div>
      )}

      <div className="space-y-5">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-slate-700">Environmental Weight</span>
            <span className="text-slate-500">{weights.environmental}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={weights.environmental} 
            onChange={(e) => handleChange('environmental', e.target.value)}
            className="w-full accent-emerald-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-slate-700">Social Weight</span>
            <span className="text-slate-500">{weights.social}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={weights.social} 
            onChange={(e) => handleChange('social', e.target.value)}
            className="w-full accent-blue-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-slate-700">Governance Weight</span>
            <span className="text-slate-500">{weights.governance}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={weights.governance} 
            onChange={(e) => handleChange('governance', e.target.value)}
            className="w-full accent-purple-500"
          />
        </div>
      </div>

      <button 
        onClick={handleSave}
        className="w-full mt-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
      >
        Save Weights
      </button>
    </div>
  );
};

export default ScoreWeightSettings;
