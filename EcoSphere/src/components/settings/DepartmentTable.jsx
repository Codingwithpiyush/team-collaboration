import React, { useState } from 'react';
import { Search, Edit, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { initialDepartments } from '../../data/settingsData';
import { useToast } from '../reports/ToastNotifications';
import DepartmentModal from './DepartmentModal';

const DepartmentTable = () => {
  const [departments, setDepartments] = useState(initialDepartments);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const { addToast } = useToast();

  const handleEdit = (dept) => {
    setEditingDept(dept);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if(window.confirm('Are you sure you want to delete this department?')) {
      setDepartments(departments.filter(d => d.id !== id));
      addToast('Department deleted successfully', 'success');
    }
  };

  const handleSave = (deptData) => {
    if (editingDept) {
      setDepartments(departments.map(d => d.id === editingDept.id ? { ...deptData, id: d.id } : d));
      addToast('Department updated successfully', 'success');
    } else {
      setDepartments([{ ...deptData, id: `DEP-00${departments.length + 1}` }, ...departments]);
      addToast('Department created successfully', 'success');
    }
    setIsModalOpen(false);
    setEditingDept(null);
  };

  const handleSort = () => {
    setSortAsc(!sortAsc);
  };

  const filteredDepts = departments
    .filter(d => 
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.head.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));

  const totalPages = Math.ceil(filteredDepts.length / itemsPerPage);
  const paginatedDepts = filteredDepts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setEditingDept(null); setIsModalOpen(true); }}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> New Department
          </button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search departments..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800/20 w-full sm:w-64"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 cursor-pointer hover:bg-slate-100" onClick={handleSort}>
                <div className="flex items-center gap-1">Name <ArrowUpDown size={14} className={sortAsc ? 'text-slate-400' : 'text-slate-700'} /></div>
              </th>
              <th className="px-6 py-3">Code</th>
              <th className="px-6 py-3">Head</th>
              <th className="px-6 py-3">Parent Dept</th>
              <th className="px-6 py-3">Employees</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedDepts.map((dept) => (
              <tr key={dept.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800 whitespace-nowrap">{dept.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{dept.code}</td>
                <td className="px-6 py-4 whitespace-nowrap">{dept.head}</td>
                <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{dept.parent}</td>
                <td className="px-6 py-4">{dept.employees}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                    dept.status === 'Active' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}>
                    {dept.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => handleEdit(dept)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(dept.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            
            {filteredDepts.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                  No departments found matching "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50">
        <span>Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredDepts.length)} of {filteredDepts.length} entries</span>
        <div className="flex items-center gap-1">
          <button 
            className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-50" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-7 h-7 rounded text-xs font-medium ${
                currentPage === page ? 'bg-slate-800 text-white' : 'hover:bg-slate-200 text-slate-600'
              }`}
            >
              {page}
            </button>
          ))}
          <button 
            className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-50" 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {isModalOpen && (
        <DepartmentModal 
          initialData={editingDept}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default DepartmentTable;
