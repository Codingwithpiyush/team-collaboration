import React from 'react';
import { Play, Settings2, RotateCcw, Loader2, Calendar } from 'lucide-react';

const CustomReportBuilder = ({ 
  filters, 
  setFilters, 
  filterOptions = {}, 
  onRun, 
  onExport, 
  onReset,
  loadingAction 
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Settings2 size={18} className="text-slate-500" />
          <h3 className="text-base font-semibold text-slate-800">Custom Report Builder: Filters</h3>
        </div>
        <button 
          onClick={onReset}
          className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw size={14} />
          Reset Filters
        </button>
      </div>
      
      <div className="p-6">
        {/* Filters Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          {/* Module Select */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Module / Domain</span>
            <select 
              value={filters.module}
              onChange={(e) => setFilters({...filters, module: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-slate-200 focus:outline-none bg-slate-50"
            >
              <option value="environmental">Environmental Performance</option>
              <option value="social">Social & CSR Engagement</option>
              <option value="governance">Governance & Compliance</option>
              <option value="gamification">Gamification Sprint Participation</option>
            </select>
          </div>

          {/* Department Select */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department</span>
            <select 
              value={filters.department}
              onChange={(e) => setFilters({...filters, department: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-slate-200 focus:outline-none bg-slate-50"
            >
              <option value="">All Departments</option>
              {filterOptions.departments?.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>

          {/* Employee Select */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</span>
            <select 
              value={filters.employee}
              onChange={(e) => setFilters({...filters, employee: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-slate-200 focus:outline-none bg-slate-50"
            >
              <option value="">All Employees</option>
              {filterOptions.employees?.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          {/* Category Select */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">ESG Category</span>
            <select 
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-slate-200 focus:outline-none bg-slate-50"
            >
              <option value="">All Categories</option>
              {filterOptions.categories?.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
              ))}
            </select>
          </div>

          {/* Challenge Select */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gamified Challenge</span>
            <select 
              value={filters.challenge}
              onChange={(e) => setFilters({...filters, challenge: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-slate-200 focus:outline-none bg-slate-50"
            >
              <option value="">All Challenges</option>
              {filterOptions.challenges?.map(ch => (
                <option key={ch.id} value={ch.id}>{ch.title}</option>
              ))}
            </select>
          </div>

          {/* Date Picker Start */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Calendar size={12} /> Start Date</span>
            <input 
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-slate-200 focus:outline-none bg-slate-50"
            />
          </div>

          {/* Date Picker End */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1"><Calendar size={12} /> End Date</span>
            <input 
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-slate-200 focus:outline-none bg-slate-50"
            />
          </div>

          {/* Status Select */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status Filter</span>
            <select 
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-slate-200 focus:outline-none bg-slate-50"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="open">Open</option>
            </select>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={onRun}
            disabled={loadingAction !== null}
            className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 min-w-[130px] disabled:opacity-80 cursor-pointer shadow-sm"
          >
            {loadingAction === 'Run' ? <Loader2 size={16} className="animate-spin text-blue-400" /> : <Play size={16} className="text-blue-400" fill="currentColor" />}
            Run Report
          </button>
          <button 
            onClick={() => onExport('PDF')} 
            disabled={loadingAction !== null}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors min-w-[110px] flex justify-center items-center cursor-pointer shadow-sm"
          >
            {loadingAction === 'PDF' ? <Loader2 size={16} className="animate-spin text-slate-500" /> : 'Export: PDF'}
          </button>
          <button 
            onClick={() => onExport('Excel')} 
            disabled={loadingAction !== null}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors min-w-[110px] flex justify-center items-center cursor-pointer shadow-sm"
          >
            {loadingAction === 'Excel' ? <Loader2 size={16} className="animate-spin text-slate-500" /> : 'Export: Excel'}
          </button>
          <button 
            onClick={() => onExport('CSV')} 
            disabled={loadingAction !== null}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors min-w-[110px] flex justify-center items-center cursor-pointer shadow-sm"
          >
            {loadingAction === 'CSV' ? <Loader2 size={16} className="animate-spin text-slate-500" /> : 'Export: CSV'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomReportBuilder;
