import React, { useState } from 'react';
import { Eye, Download, Trash2, FileText, Search, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { recentReportsData } from '../../data/reportsData';
import { useToast } from './ToastNotifications';
import ReportModal from './ReportModal';

const RecentReports = () => {
  const { addToast } = useToast();
  const [reports, setReports] = useState(recentReportsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState(null);
  
  const [previewReportType, setPreviewReportType] = useState(null);

  const itemsPerPage = 5;

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      setReports(reports.filter(r => r.id !== id));
      addToast(`Report deleted successfully.`, 'success');
    }
  };

  const handleDownload = (id, name) => {
    setDownloadingId(id);
    setTimeout(() => {
      setDownloadingId(null);
      addToast(`${name} downloaded successfully.`, 'success');
    }, 1500);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedReports = reports
    .filter(r => 
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (departmentFilter === 'All' || r.department === departmentFilter) &&
      (statusFilter === 'All' || r.status === statusFilter)
    )
    .sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'date') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const paginatedReports = filteredAndSortedReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const totalPages = Math.ceil(filteredAndSortedReports.length / itemsPerPage);

  const clearFilters = () => {
    setSearchTerm('');
    setDepartmentFilter('All');
    setStatusFilter('All');
    setCurrentPage(1);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp size={14} className="inline ml-1" /> : <ChevronDown size={14} className="inline ml-1" />;
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-slate-500" />
            <h3 className="text-base font-semibold text-slate-800">Recent Reports</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Search reports..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <select 
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Depts</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Corporate">Corporate</option>
              <option value="Legal">Legal</option>
              <option value="Logistics">Logistics</option>
              <option value="HR">HR</option>
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto flex-1 min-h-[300px]">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                <th className="px-5 py-3 font-semibold cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('name')}>
                  Report Name <SortIcon field="name" />
                </th>
                <th className="px-5 py-3 font-semibold cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('department')}>
                  Department <SortIcon field="department" />
                </th>
                <th className="px-5 py-3 font-semibold cursor-pointer hover:bg-slate-100 transition-colors select-none" onClick={() => handleSort('date')}>
                  Date <SortIcon field="date" />
                </th>
                <th className="px-5 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedReports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-5 py-3 font-medium text-slate-800">{report.name}</td>
                  <td className="px-5 py-3 text-slate-600">{report.department}</td>
                  <td className="px-5 py-3 text-slate-500">{new Date(report.date).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setPreviewReportType('environmental')} className="p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors" title="View">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleDownload(report.id, report.name)} disabled={downloadingId === report.id} className="p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded transition-colors disabled:opacity-50" title="Download">
                        {downloadingId === report.id ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                      </button>
                      <button onClick={() => handleDelete(report.id, report.name)} className="p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedReports.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <FileText size={32} className="text-slate-300 mb-3" />
                      <p className="text-base font-medium text-slate-700 mb-1">No reports found.</p>
                      <p className="text-sm mb-4">Try adjusting your search or filters to find what you're looking for.</p>
                      <button onClick={clearFilters} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors">
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs text-slate-500 font-medium">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedReports.length)} of {filteredAndSortedReports.length}
            </span>
            <div className="flex gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 text-xs font-medium border border-slate-200 rounded text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Prev
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 text-xs font-medium border border-slate-200 rounded text-slate-600 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {previewReportType && (
        <ReportModal reportType={previewReportType} onClose={() => setPreviewReportType(null)} />
      )}
    </>
  );
};

export default RecentReports;
