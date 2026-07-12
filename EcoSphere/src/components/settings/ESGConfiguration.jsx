import React, { useState } from 'react';
import { useToast } from '../reports/ToastNotifications';

const ESGConfiguration = () => {
  const { addToast } = useToast();
  
  const [config, setConfig] = useState({
    autoEmission: true,
    requireEvidence: false,
    autoAwardBadges: true,
    esgScoring: true,
    carbonTracking: true,
    challengeXp: true,
    rewardRedemption: false,
    aiRecommendations: true
  });

  const handleToggle = (key, label) => {
    const newValue = !config[key];
    setConfig(prev => ({ ...prev, [key]: newValue }));
    
    addToast(`${label} ${newValue ? 'Enabled' : 'Disabled'}`, 'success');
  };

  const settingsItems = [
    { key: 'autoEmission', label: 'Enable auto emission calculation', description: 'Automatically calculate CO2 emissions when fuel/energy data is entered.' },
    { key: 'requireEvidence', label: 'Require evidence for all CSR activities', description: 'Force employees to upload photos or documents for CSR approval.' },
    { key: 'autoAwardBadges', label: 'Auto-award badges on challenge completion', description: 'Automatically unlock and assign badges when XP thresholds are met.' },
    { key: 'esgScoring', label: 'Enable ESG Scoring', description: 'Calculate and display overall Environmental, Social, and Governance scores on the dashboard.' },
    { key: 'carbonTracking', label: 'Enable Carbon Tracking', description: 'Track carbon transactions across all departments.' },
    { key: 'challengeXp', label: 'Enable Challenge XP', description: 'Award experience points for participating in sustainability challenges.' },
    { key: 'rewardRedemption', label: 'Enable Reward Redemption', description: 'Allow employees to redeem accumulated XP for physical or digital rewards.' },
    { key: 'aiRecommendations', label: 'Enable AI Recommendations', description: 'Show AI-generated insights and recommendations on reports.' }
  ];

  return (
    <div className="p-6 animate-in fade-in duration-300">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800">ESG Configuration & Notifications</h3>
        <p className="text-sm text-slate-500 mt-1">Configure global platform behaviors and tracking modules.</p>
      </div>

      <div className="space-y-4">
        {settingsItems.map((item) => (
          <div key={item.key} className="flex items-start justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="pr-8">
              <h4 className="text-sm font-bold text-slate-700">{item.label}</h4>
              <p className="text-xs text-slate-500 mt-1">{item.description}</p>
            </div>
            
            {/* Custom Toggle Switch */}
            <button 
              onClick={() => handleToggle(item.key, item.label)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-800 focus:ring-offset-2 ${
                config[item.key] ? 'bg-slate-800' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  config[item.key] ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ESGConfiguration;
