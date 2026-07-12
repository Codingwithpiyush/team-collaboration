import React, { useState } from 'react';
import { Play, Settings2, RotateCcw, Loader2 } from 'lucide-react';
import { useToast } from './ToastNotifications';

const initialFilters = {
  dateRange: 'YTD',
  department: 'All',
  module: 'All',
  employee: 'All',
  challenge: 'All',
  esgCategory: 'All'
};

const CustomReportBuilder = () => {
  const { addToast } = useToast();
  const [filters, setFilters] = useState(initialFilters);
  const [loadingAction, setLoadingAction] = useState(null);

  const handleExport = (type) => {
    setLoadingAction(type);
    setTimeout(() => {
      setLoadingAction(null);
      addToast(`Custom Report exported successfully as ${type}.`, 'success');
    }, 1500);
  };

  const handleRun = () => {
    setLoadingAction('Run');
    setTimeout(() => {
      setLoadingAction(null);
      addToast('Report generated successfully based on filters.', 'success');
    }, 1500);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    addToast('Filters reset to default.', 'success');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Settings2 size={18} className="text-slate-500" />
          <h3 className="text-base font-semibold text-slate-800">Custom Report Builder: Filters</h3>
        </div>
        <button 
          onClick={handleReset}
          className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw size={14} />
          Reset Filters
        </button>
      </div>
      
      <div className="p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <select 
            value={filters.dateRange}
            onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-slate-200 focus:outline-none min-w-[140px]"
          >
            <option value="YTD">Date Range: YTD</option>
            <option value="Last Quarter">Last Quarter</option>
            <option value="Last Year">Last Year</option>
          </select>
          <select 
            value={filters.department}
            onChange={(e) => setFilters({...filters, department: e.target.value})}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-slate-200 focus:outline-none min-w-[140px]"
          >
            <option value="All">Department: All</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="IT">IT</option>
            <option value="HR">HR</option>
          </select>
          <select 
            value={filters.module}
            onChange={(e) => setFilters({...filters, module: e.target.value})}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-slate-200 focus:outline-none min-w-[140px]"
          >
            <option value="All">Module: All</option>
            <option value="Environmental">Environmental</option>
            <option value="Social">Social</option>
            <option value="Governance">Governance</option>
          </select>
          <select 
            value={filters.employee}
            onChange={(e) => setFilters({...filters, employee: e.target.value})}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-slate-200 focus:outline-none min-w-[140px]"
          >
            <option value="All">Employee: All</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <select 
            value={filters.challenge}
            onChange={(e) => setFilters({...filters, challenge: e.target.value})}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-slate-200 focus:outline-none min-w-[140px]"
          >
            <option value="All">Challenge: All</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
          </select>
          <select 
            value={filters.esgCategory}
            onChange={(e) => setFilters({...filters, esgCategory: e.target.value})}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-slate-200 focus:outline-none min-w-[140px]"
          >
            <option value="All">ESG Category: All</option>
            <option value="E - Environment">E - Environment</option>
            <option value="S - Social">S - Social</option>
            <option value="G - Governance">G - Governance</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleRun}
            disabled={loadingAction !== null}
            className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 min-w-[130px] disabled:opacity-80"
          >
            {loadingAction === 'Run' ? <Loader2 size={16} className="animate-spin text-blue-400" /> : <Play size={16} className="text-blue-400" fill="currentColor" />}
            Run Report
          </button>
          <button 
            onClick={() => handleExport('PDF')} 
            disabled={loadingAction !== null}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors min-w-[110px] flex justify-center items-center"
          >
            {loadingAction === 'PDF' ? <Loader2 size={16} className="animate-spin text-slate-500" /> : 'Export: PDF'}
          </button>
          <button 
            onClick={() => handleExport('Excel')} 
            disabled={loadingAction !== null}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors min-w-[110px] flex justify-center items-center"
          >
            {loadingAction === 'Excel' ? <Loader2 size={16} className="animate-spin text-slate-500" /> : 'Export: Excel'}
          </button>
          <button 
            onClick={() => handleExport('CSV')} 
            disabled={loadingAction !== null}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors min-w-[110px] flex justify-center items-center"
          >
            {loadingAction === 'CSV' ? <Loader2 size={16} className="animate-spin text-slate-500" /> : 'Export: CSV'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomReportBuilder;
