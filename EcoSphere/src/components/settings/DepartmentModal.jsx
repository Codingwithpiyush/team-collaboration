import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const DepartmentModal = ({ initialData, onClose, onSave, employees = [], departments = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    head: '',
    parent_department: '',
    status: 'Active'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        code: initialData.code || '',
        head: initialData.head?.toString() || '',
        parent_department: initialData.parent_department?.toString() || '',
        status: initialData.status === 'active' ? 'Active' : 'Inactive'
      });
    } else {
      setFormData({
        name: '',
        code: '',
        head: '',
        parent_department: '',
        status: 'Active'
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  // Exclude current department from parent options when editing to prevent circular refs
  const filteredParentDepartments = departments.filter(d => 
    !initialData || d.id.toString() !== initialData.id.toString()
  );

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">
            {initialData ? 'Edit Department' : 'New Department'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>
        
        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Department Name</label>
            <input 
              type="text" 
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800/20 text-sm bg-slate-50"
              placeholder="e.g. Sustainability & Innovation"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Department Code</label>
              <input 
                type="text" 
                name="code"
                required
                value={formData.code}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800/20 text-sm bg-slate-50"
                placeholder="e.g. SUST"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
              <select 
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800/20 text-sm bg-slate-50"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Department Head Manager</label>
            <select 
              name="head"
              value={formData.head}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800/20 text-sm bg-slate-50"
            >
              <option value="">— Unassigned —</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name} ({emp.designation})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Parent Department</label>
            <select 
              name="parent_department"
              value={formData.parent_department}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800/20 text-sm bg-slate-50"
            >
              <option value="">— None (Top Level Department) —</option>
              {filteredParentDepartments.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg transition-colors text-sm cursor-pointer shadow-sm"
            >
              Save Department
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default DepartmentModal;
