import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, Plus, Upload, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { BASE_API_URL } from '../../config';
import { useToast } from '../reports/ToastNotifications';
import DepartmentModal from './DepartmentModal';

const DepartmentTable = () => {
  const [departments, setDepartments] = useState([]);
  const [employeesDropdown, setEmployeesDropdown] = useState([]);
  const [deptsDropdown, setDeptsDropdown] = useState([]);
  const [stats, setStats] = useState({ total_departments: 0, active_departments: 0, total_employees: 0 });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);

  const { addToast } = useToast();

  // Load departments, employees dropdown, and stats
  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const ordering = sortAsc ? sortField : `-${sortField}`;
      let url = `${BASE_API_URL}/api/users/departments/?page=${currentPage}&search=${searchTerm}&ordering=${ordering}`;
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setDepartments(data.results || []);
        // Page size is 10
        setTotalCount(data.count || 0);
        setTotalPages(Math.ceil((data.count || 0) / 10));
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load departments', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDropdownsAndStats = async () => {
    try {
      const [empRes, deptRes, statsRes] = await Promise.all([
        fetch(`${BASE_API_URL}/api/users/employees/dropdown/`),
        fetch(`${BASE_API_URL}/api/users/departments/dropdown/`),
        fetch(`${BASE_API_URL}/api/users/departments/statistics/`)
      ]);

      if (empRes.ok) setEmployeesDropdown(await empRes.json());
      if (deptRes.ok) setDeptsDropdown(await deptRes.json());
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [currentPage, searchTerm, statusFilter, sortField, sortAsc]);

  useEffect(() => {
    fetchDropdownsAndStats();
  }, []);

  const handleEdit = (dept) => {
    setEditingDept(dept);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete the department "${name}"?`)) {
      try {
        const res = await fetch(`${BASE_API_URL}/api/users/departments/${id}/`, {
          method: 'DELETE'
        });

        if (res.ok || res.status === 204) {
          addToast('Department deleted successfully', 'success');
          fetchDepartments();
          fetchDropdownsAndStats();
        } else {
          const errData = await res.json();
          addToast(errData.detail || 'Cannot delete department with active employees.', 'error');
        }
      } catch (err) {
        addToast('Connection failure to delete department', 'error');
      }
    }
  };

  const handleSave = async (deptData) => {
    try {
      let res;
      const payload = {
        name: deptData.name,
        code: deptData.code.toUpperCase(),
        status: deptData.status.toLowerCase(),
        parent_department: deptData.parent_department ? parseInt(deptData.parent_department) : null,
        head: deptData.head ? parseInt(deptData.head) : null
      };

      if (editingDept) {
        // Edit
        res = await fetch(`${BASE_API_URL}/api/users/departments/${editingDept.id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Create
        res = await fetch(`${BASE_API_URL}/api/users/departments/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        addToast(editingDept ? 'Department updated successfully' : 'Department created successfully', 'success');
        setIsModalOpen(false);
        setEditingDept(null);
        fetchDepartments();
        fetchDropdownsAndStats();
      } else {
        const errData = await res.json();
        const message = errData.detail || errData.code?.[0] || errData.non_field_errors?.[0] || 'Validation error saving department';
        addToast(message, 'error');
      }
    } catch (err) {
      addToast('Error contacting server.', 'error');
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
    setCurrentPage(1);
  };

  // Bulk Import handler
  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${BASE_API_URL}/api/users/departments/import/`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        addToast(`Successfully imported ${data.departments_created} departments!`, 'success');
        fetchDepartments();
        fetchDropdownsAndStats();
      } else {
        const err = await res.json();
        addToast(err.detail || 'Import failed. Check file template columns.', 'error');
      }
    } catch (err) {
      addToast('Error uploading file.', 'error');
    } finally {
      setIsImporting(false);
      // Reset input element value
      e.target.value = '';
    }
  };

  // Bulk Export handler
  const handleExport = async (format) => {
    try {
      let url = `${BASE_API_URL}/api/users/departments/export/?export=${format.toLowerCase()}`;
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        const ext = format === 'EXCEL' ? 'xlsx' : format.toLowerCase();
        link.setAttribute('download', `departments_export.${ext}`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        addToast(`Departments exported as ${format} successfully.`, 'success');
      } else {
        addToast('Export failed on backend.', 'error');
      }
    } catch (err) {
      addToast('Error exporting departments.', 'error');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mini stats dashboard */}
      <div className="grid grid-cols-3 gap-4 p-5 bg-slate-50/50 border-b border-slate-100">
        <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total Departments</span>
          <h4 className="text-xl font-black text-slate-800 mt-1">{stats.total_departments || 0}</h4>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Active</span>
          <h4 className="text-xl font-black text-emerald-600 mt-1">{stats.active_departments || 0}</h4>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200/60 shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Headcount</span>
          <h4 className="text-xl font-black text-blue-600 mt-1">{stats.total_employees || 0}</h4>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => { setEditingDept(null); setIsModalOpen(true); }}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Plus size={16} /> New Department
          </button>

          {/* Bulk Import Label */}
          <label className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-sm font-medium transition-colors cursor-pointer shadow-sm">
            <Upload size={16} className="text-slate-500" />
            <span>{isImporting ? 'Importing...' : 'Bulk Import'}</span>
            <input 
              type="file" 
              accept=".csv,.xlsx,.xls" 
              onChange={handleImportFile} 
              disabled={isImporting} 
              className="hidden" 
            />
          </label>

          {/* Export Dropdown */}
          <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
            <span className="px-3 py-2 text-xs font-bold text-slate-400 border-r border-slate-100 bg-slate-50">EXPORT</span>
            <button onClick={() => handleExport('PDF')} className="p-2 hover:bg-slate-50 text-slate-700 border-r border-slate-100" title="Export PDF"><FileText size={16} /></button>
            <button onClick={() => handleExport('EXCEL')} className="p-2 hover:bg-slate-50 text-slate-700 border-r border-slate-100" title="Export Excel"><FileSpreadsheet size={16} className="text-emerald-600" /></button>
            <button onClick={() => handleExport('CSV')} className="p-2 hover:bg-slate-50 text-slate-700" title="Export CSV"><Download size={16} /></button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Status filter */}
          <select 
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none text-slate-600 font-medium"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search code/name..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800/20 w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-2">
            <span className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-slate-800 animate-spin"></span>
            <span className="text-sm font-semibold text-slate-500">Querying departments...</span>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">Name <ArrowUpDown size={14} className={sortField === 'name' ? 'text-slate-700' : 'text-slate-400'} /></div>
                </th>
                <th className="px-6 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('code')}>
                  <div className="flex items-center gap-1">Code <ArrowUpDown size={14} className={sortField === 'code' ? 'text-slate-700' : 'text-slate-400'} /></div>
                </th>
                <th className="px-6 py-3">Head Manager</th>
                <th className="px-6 py-3">Employees Count</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">{dept.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs">{dept.code}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">{dept.head_name || 'System / Unassigned'}</td>
                  <td className="px-6 py-4 font-semibold">{dept.employee_count}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                      dept.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {dept.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(dept)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(dept.id, dept.name)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {departments.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    No departments found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {!isLoading && departments.length > 0 && (
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50">
          <span>Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} entries</span>
          <div className="flex items-center gap-1">
            <button 
              className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-50 cursor-pointer" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded text-xs font-semibold ${
                  currentPage === page ? 'bg-slate-800 text-white' : 'hover:bg-slate-200 text-slate-600 cursor-pointer'
                }`}
              >
                {page}
              </button>
            ))}
            <button 
              className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-50 cursor-pointer" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Department creation/edit modal */}
      {isModalOpen && (
        <DepartmentModal 
          initialData={editingDept}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          employees={employeesDropdown}
          departments={deptsDropdown}
        />
      )}
    </div>
  );
};

export default DepartmentTable;
