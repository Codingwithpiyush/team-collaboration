import React, { useState } from 'react';
import { CalendarClock, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from './ToastNotifications';

const ScheduleReportCard = () => {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Environmental Report',
    frequency: 'Weekly',
    email: 'admin@ecosphere.com'
  });

  const handleSchedule = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      addToast(`${formData.frequency} ${formData.type} scheduled successfully.`, 'success');
    }, 1500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-5 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
        <CalendarClock size={18} className="text-slate-500" />
        <h3 className="text-base font-semibold text-slate-800">Schedule Reports</h3>
      </div>
      
      <form onSubmit={handleSchedule} className="p-6 flex-1 flex flex-col gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Report Type</label>
          <select 
            value={formData.type}
            onChange={e => setFormData({...formData, type: e.target.value})}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Environmental Report</option>
            <option>Social Report</option>
            <option>Governance Report</option>
            <option>ESG Summary</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Frequency</label>
          <div className="flex gap-2">
            {['Daily', 'Weekly', 'Monthly'].map(freq => (
              <button
                key={freq}
                type="button"
                onClick={() => setFormData({...formData, frequency: freq})}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                  formData.frequency === freq ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {freq}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Recipient Email</label>
          <input 
            type="email" 
            required
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mt-auto pt-2">
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Schedule Report'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleReportCard;
