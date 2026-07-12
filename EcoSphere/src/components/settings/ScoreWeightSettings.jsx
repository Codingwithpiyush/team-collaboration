import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, AlertTriangle } from 'lucide-react';
import { useToast } from '../reports/ToastNotifications';
import { BASE_API_URL } from '../../config';

const ScoreWeightSettings = () => {
  const [weights, setWeights] = useState({
    environmental: 33.33,
    social: 33.33,
    governance: 33.34
  });
  const [total, setTotal] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();

  const fetchWeights = async () => {
    try {
      const res = await fetch(`${BASE_API_URL}/api/users/organization-settings/`);
      if (res.ok) {
        const data = await res.json();
        setWeights({
          environmental: Number(data.environment_weight || 33.33),
          social: Number(data.social_weight || 33.33),
          governance: Number(data.governance_weight || 33.34)
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeights();
  }, []);

  useEffect(() => {
    // Round to two decimal places
    const sum = Number((weights.environmental + weights.social + weights.governance).toFixed(2));
    setTotal(sum);
  }, [weights]);

  const handleChange = (key, value) => {
    setWeights(prev => ({ ...prev, [key]: Number(value) }));
  };

  const handleSave = async () => {
    // Allow slight floating point tolerance for 100%
    if (Math.abs(total - 100) > 0.05) {
      addToast(`Total weight must equal exactly 100% (currently ${total}%)`, 'error');
      return;
    }

    try {
      const res = await fetch(`${BASE_API_URL}/api/users/organization-settings/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          environment_weight: weights.environmental,
          social_weight: weights.social,
          governance_weight: weights.governance
        })
      });

      if (res.ok) {
        addToast('Score weights updated successfully', 'success');
      } else {
        const err = await res.json();
        addToast(err.detail || 'Failed to save weights settings.', 'error');
      }
    } catch (e) {
      addToast('Connection error saving weights.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex justify-center py-12">
        <span className="w-6 h-6 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin"></span>
      </div>
    );
  }

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
        <span className={`text-sm font-bold px-3 py-1 rounded-lg border ${
          Math.abs(total - 100) <= 0.05 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'
        }`}>
          {total}%
        </span>
      </div>

      {Math.abs(total - 100) > 0.05 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-700 text-xs font-semibold">
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
          <p>The total weight is <strong>{total}%</strong>. It must equal exactly 100%.</p>
        </div>
      )}

      <div className="space-y-5">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-semibold text-slate-700">Environmental Weight</span>
            <span className="text-slate-500 font-bold">{weights.environmental}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            step="0.5"
            value={weights.environmental} 
            onChange={(e) => handleChange('environmental', e.target.value)}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-semibold text-slate-700">Social Weight</span>
            <span className="text-slate-500 font-bold">{weights.social}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            step="0.5"
            value={weights.social} 
            onChange={(e) => handleChange('social', e.target.value)}
            className="w-full accent-blue-500 cursor-pointer"
          />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-semibold text-slate-700">Governance Weight</span>
            <span className="text-slate-500 font-bold">{weights.governance}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            step="0.5"
            value={weights.governance} 
            onChange={(e) => handleChange('governance', e.target.value)}
            className="w-full accent-purple-500 cursor-pointer"
          />
        </div>
      </div>

      <button 
        onClick={handleSave}
        className="w-full mt-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
      >
        Save Weights
      </button>
    </div>
  );
};

export default ScoreWeightSettings;
