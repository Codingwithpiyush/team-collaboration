import React from 'react';
import { FileBarChart2, Download, CalendarClock, Activity, BarChart3 } from 'lucide-react';

const ReportAnalytics = () => {
  const cards = [
    { title: 'Reports Generated', value: '145', icon: FileBarChart2, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Downloads', value: '420', icon: Download, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Scheduled Reports', value: '18', icon: CalendarClock, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Average ESG Score', value: '81', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-100' },
    { title: 'Most Generated', value: 'Env.', icon: BarChart3, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className={`${card.bg} ${card.color} p-3 rounded-lg`}>
            <card.icon size={20} />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 mb-0.5 whitespace-nowrap">{card.title}</p>
            <h4 className="text-xl font-bold text-slate-800">{card.value}</h4>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReportAnalytics;
