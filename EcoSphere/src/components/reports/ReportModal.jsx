import React, { useState } from 'react';
import { X, Loader2, Download, FileSpreadsheet } from 'lucide-react';
import { dummyReportPreviewData, dummyChartData } from '../../data/reportsData';
import { useToast } from './ToastNotifications';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ReportModal = ({ reportType, onClose }) => {
  const { addToast } = useToast();
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [isLoadingExcel, setIsLoadingExcel] = useState(false);
  
  const data = dummyReportPreviewData[reportType];

  if (!data) return null;

  const handleDownload = (type) => {
    if (type === 'PDF') {
      setIsLoadingPdf(true);
      setTimeout(() => {
        setIsLoadingPdf(false);
        addToast(`${data.title} exported as PDF successfully.`, 'success');
        onClose();
      }, 1500);
    } else {
      setIsLoadingExcel(true);
      setTimeout(() => {
        setIsLoadingExcel(false);
        addToast(`${data.title} exported as Excel successfully.`, 'success');
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{data.title} Preview</h3>
            <div className="flex gap-4 mt-1 text-xs text-slate-500 font-medium">
              <span>Generated: Today</span>
              <span>By: Admin</span>
              <span>Dept: All</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar flex flex-col lg:flex-row gap-8">
          <div className="lg:w-1/3 flex flex-col gap-6">
            <div>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Key Metrics</h4>
              <div className="space-y-3 bg-slate-50 rounded-xl p-4 border border-slate-100">
                {data.metrics.map((metric, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-slate-200/60 last:border-0 last:pb-0">
                    <span className="text-sm font-medium text-slate-600">{metric.label}</span>
                    <span className={`text-sm font-bold ${metric.label === 'Status' ? 'text-emerald-600 bg-emerald-100/50 px-2.5 py-0.5 rounded text-xs' : 'text-slate-800'}`}>
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Trend Analysis</h4>
              <div className="h-[200px] w-full border border-slate-100 rounded-xl p-4 bg-white">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dummyChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dx={-10} width={30} />
                    <Tooltip cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{r: 3, fill: '#3b82f6'}} activeDot={{r: 5}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="lg:w-2/3 flex flex-col gap-6">
            <div>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">Executive Summary</h4>
              <p className="text-slate-600 text-sm leading-relaxed">{data.executiveSummary}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">Key Findings</h4>
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                {data.keyFindings?.map((finding, idx) => (
                  <li key={idx} className="leading-relaxed">{finding}</li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mt-auto">
              <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                Strategic Recommendations
              </h4>
              <p className="text-blue-700 text-sm leading-relaxed font-medium">
                {data.recommendations}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
          <button 
            disabled={isLoadingExcel || isLoadingPdf}
            className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
            onClick={() => handleDownload('Excel')}
          >
            {isLoadingExcel ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} className="text-emerald-600" />}
            Download Excel
          </button>
          <button 
            disabled={isLoadingExcel || isLoadingPdf}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            onClick={() => handleDownload('PDF')}
          >
            {isLoadingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
