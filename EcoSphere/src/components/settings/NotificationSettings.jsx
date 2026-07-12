import React, { useState } from 'react';
import { useToast } from '../reports/ToastNotifications';
import { Save, RotateCcw } from 'lucide-react';

const NotificationSettings = () => {
  const { addToast } = useToast();
  
  const initialSettings = {
    compliance: { inApp: true, email: true, sms: false },
    csrApprovals: { inApp: true, email: false, sms: false },
    challengeApprovals: { inApp: true, email: false, sms: false },
    badgeUnlocks: { inApp: true, email: false, sms: false },
    policyReminder: { inApp: true, email: true, sms: false },
    weeklyReport: { inApp: false, email: true, sms: false },
    systemUpdates: { inApp: true, email: true, sms: false },
  };

  const [settings, setSettings] = useState(initialSettings);

  const handleCheckboxChange = (category, type) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: !prev[category][type]
      }
    }));
  };

  const handleSave = () => {
    addToast('Notification settings saved successfully', 'success');
  };

  const handleReset = () => {
    setSettings(initialSettings);
    addToast('Settings reset to default', 'info');
  };

  const types = [
    { id: 'compliance', label: 'Compliance Issues' },
    { id: 'csrApprovals', label: 'CSR Approvals' },
    { id: 'challengeApprovals', label: 'Challenge Approvals' },
    { id: 'badgeUnlocks', label: 'Badge Unlocks' },
    { id: 'policyReminder', label: 'Policy Reminder' },
    { id: 'weeklyReport', label: 'Weekly ESG Report' },
    { id: 'systemUpdates', label: 'System Updates' },
  ];

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="p-6 border-b border-slate-200">
        <h3 className="text-lg font-bold text-slate-800">Notification Settings</h3>
        <p className="text-sm text-slate-500 mt-1">Manage how and when you receive alerts from the platform.</p>
      </div>

      <div className="p-6">
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Notification Type</th>
                <th className="px-6 py-4 text-center">In-App</th>
                <th className="px-6 py-4 text-center">Email</th>
                <th className="px-6 py-4 text-center">SMS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {types.map((type) => (
                <tr key={type.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-700">{type.label}</td>
                  <td className="px-6 py-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={settings[type.id].inApp}
                      onChange={() => handleCheckboxChange(type.id, 'inApp')}
                      className="w-4 h-4 text-slate-800 rounded border-slate-300 focus:ring-slate-800 cursor-pointer accent-slate-800"
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={settings[type.id].email}
                      onChange={() => handleCheckboxChange(type.id, 'email')}
                      className="w-4 h-4 text-slate-800 rounded border-slate-300 focus:ring-slate-800 cursor-pointer accent-slate-800"
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={settings[type.id].sms}
                      onChange={() => handleCheckboxChange(type.id, 'sms')}
                      className="w-4 h-4 text-slate-800 rounded border-slate-300 focus:ring-slate-800 cursor-pointer accent-slate-800"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex gap-3">
          <button 
            onClick={handleSave}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <Save size={16} /> Save Changes
          </button>
          <button 
            onClick={handleReset}
            className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettings;
