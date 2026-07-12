import React, { useState, useEffect } from 'react';
import { useToast } from '../reports/ToastNotifications';
import { BASE_API_URL } from '../../config';
import { Loader2 } from 'lucide-react';

const ESGConfiguration = () => {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [config, setConfig] = useState({
    auto_emission_calculation: true,
    require_evidence: false,
    auto_badge_unlock: true
  });

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_API_URL}/api/users/organization-settings/`);
      if (res.ok) {
        const data = await res.json();
        setConfig({
          auto_emission_calculation: data.auto_emission_calculation,
          require_evidence: data.require_evidence,
          auto_badge_unlock: data.auto_badge_unlock
        });
      }
    } catch (e) {
      console.error(e);
      addToast('Failed to load global ESG settings.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleToggle = async (key, label) => {
    const newValue = !config[key];
    
    // Optimistic Update
    setConfig(prev => ({ ...prev, [key]: newValue }));

    try {
      const res = await fetch(`${BASE_API_URL}/api/users/organization-settings/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [key]: newValue
        })
      });

      if (res.ok) {
        addToast(`${label} ${newValue ? 'Enabled' : 'Disabled'}`, 'success');
      } else {
        // Revert
        setConfig(prev => ({ ...prev, [key]: !newValue }));
        addToast('Failed to save settings changes on server.', 'error');
      }
    } catch (e) {
      // Revert
      setConfig(prev => ({ ...prev, [key]: !newValue }));
      addToast('Server connection error.', 'error');
    }
  };

  const settingsItems = [
    { key: 'auto_emission_calculation', label: 'Enable auto emission calculation', description: 'Automatically calculate CO2 emissions when fuel/energy data is entered.' },
    { key: 'require_evidence', label: 'Require evidence for all CSR activities', description: 'Force employees to upload photos or documents for CSR approval.' },
    { key: 'auto_badge_unlock', label: 'Auto-award badges on challenge completion', description: 'Automatically unlock and assign badges when XP thresholds are met.' }
  ];

  if (isLoading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
        <Loader2 className="animate-spin text-slate-500" size={28} />
        <span className="text-sm font-semibold text-slate-500">Querying platform settings...</span>
      </div>
    );
  }

  return (
    <div className="p-6 animate-in fade-in duration-300">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-800">ESG Configuration Flags</h3>
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
