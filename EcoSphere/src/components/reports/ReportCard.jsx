import React, { useState } from 'react';
import { Leaf, Users, Briefcase, BarChart2 } from 'lucide-react';
import ReportModal from './ReportModal';

const iconMap = {
  Leaf: Leaf,
  Users: Users,
  Briefcase: Briefcase,
  BarChart2: BarChart2
};

const ReportCard = ({ report }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const IconComponent = iconMap[report.icon];

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-slate-100 p-2 rounded-lg text-slate-700">
              {IconComponent && <IconComponent size={20} />}
            </div>
            <h3 className="text-lg font-bold text-slate-800">{report.title}</h3>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            {report.description}
          </p>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6 mt-auto">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Report Overview</h4>
            <div className="space-y-2 text-xs text-slate-600 font-medium">
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Data Sources</span>
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
                  {report.type === 'environmental' ? '4 modules' : report.type === 'social' ? '3 modules' : report.type === 'governance' ? '2 modules' : 'All modules'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                <span className="text-slate-500">Last Generated</span>
                <span className="text-slate-700">Today, 09:00 AM</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Supported Formats</span>
                <span className="text-blue-600 font-bold tracking-wide">PDF, XLS, CSV</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-auto">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Generate
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Preview
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <ReportModal reportType={report.type} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
};

export default ReportCard;
