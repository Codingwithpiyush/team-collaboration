import React, { useState } from 'react';
import { Search, Filter, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { employeeParticipation } from '../../data/socialData';

const ParticipationTable = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = employeeParticipation.filter(item => 
    item.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200"><CheckCircle2 size={12}/> Approved</span>;
      case 'Pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200"><Clock size={12}/> Pending</span>;
      case 'Rejected':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200"><XCircle size={12}/> Rejected</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Employee Participation</h3>
          <p className="text-sm text-slate-500">Track approvals and points earned</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search employee or activity..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <button className="px-3 py-2 border border-slate-200 text-slate-600 bg-white rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-medium">
            <Filter size={16} />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <th className="px-6 py-3 font-semibold">Employee</th>
              <th className="px-6 py-3 font-semibold">Department</th>
              <th className="px-6 py-3 font-semibold">Activity</th>
              <th className="px-6 py-3 font-semibold">Proof Uploaded</th>
              <th className="px-6 py-3 font-semibold text-center">Points Earned</th>
              <th className="px-6 py-3 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredData.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{row.employee}</td>
                <td className="px-6 py-4 text-slate-600">{row.department}</td>
                <td className="px-6 py-4 text-slate-600">{row.activity}</td>
                <td className="px-6 py-4">
                  <span className="text-blue-600 hover:underline cursor-pointer flex items-center gap-1 text-xs">
                    {row.proof}
                  </span>
                </td>
                <td className="px-6 py-4 text-center font-medium text-emerald-600">+{row.points}</td>
                <td className="px-6 py-4 text-center">
                  {getStatusBadge(row.status)}
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-slate-500">No records found matching your search.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
        <span className="text-xs text-slate-500">Showing {filteredData.length} entries</span>
        <div className="flex gap-1">
          <button className="px-3 py-1 border border-slate-200 rounded text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50">Prev</button>
          <button className="px-3 py-1 border border-slate-200 rounded text-xs font-medium bg-blue-600 text-white">1</button>
          <button className="px-3 py-1 border border-slate-200 rounded text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
};

export default ParticipationTable;
