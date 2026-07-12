import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, ArrowUpDown, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { BASE_API_URL } from '../../config';
import { useToast } from '../reports/ToastNotifications';

const CategoriesTable = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortAsc, setSortAsc] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', type: 'environmental', description: '', status: 'active' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const { addToast } = useToast();

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const ordering = sortAsc ? sortField : `-${sortField}`;
      let url = `${BASE_API_URL}/api/users/categories/?page=${currentPage}&search=${searchTerm}&ordering=${ordering}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (typeFilter) url += `&type=${typeFilter}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCategories(data.results || []);
        setTotalCount(data.count || 0);
        setTotalPages(Math.ceil((data.count || 0) / 10)); // standard limit is 10
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load ESG categories.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [currentPage, searchTerm, statusFilter, typeFilter, sortField, sortAsc]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      try {
        const res = await fetch(`${BASE_API_URL}/api/users/categories/${id}/`, {
          method: 'DELETE'
        });
        if (res.ok || res.status === 204) {
          addToast('Category deleted successfully', 'success');
          fetchCategories();
        } else {
          addToast('Cannot delete category in active use.', 'error');
        }
      } catch (err) {
        addToast('Connection failure to delete category.', 'error');
      }
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', type: 'environmental', description: '', status: 'active' });
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({ 
      name: cat.name, 
      type: cat.type || 'environmental', 
      description: cat.description || '', 
      status: cat.status || 'active' 
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      addToast('Category name is required', 'error');
      return;
    }

    try {
      let res;
      if (editingCategory) {
        res = await fetch(`${BASE_API_URL}/api/users/categories/${editingCategory.id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        res = await fetch(`${BASE_API_URL}/api/users/categories/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      if (res.ok) {
        addToast(editingCategory ? 'Category updated successfully' : 'Category created successfully', 'success');
        closeModal();
        fetchCategories();
      } else {
        const err = await res.json();
        addToast(err.detail || 'Validation error saving category', 'error');
      }
    } catch (e) {
      addToast('Error saving category to server.', 'error');
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

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-slate-800">ESG Category Configurations</h3>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search name/description..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800/20 w-full sm:w-56"
            />
          </div>

          {/* Type filter */}
          <select 
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 font-medium"
          >
            <option value="">All ESG Types</option>
            <option value="environmental">Environmental</option>
            <option value="social">Social</option>
            <option value="governance">Governance</option>
          </select>

          {/* Status filter */}
          <select 
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 font-medium"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors whitespace-nowrap cursor-pointer shadow-sm"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>
      </div>

      {/* Table grid */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-2">
            <span className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-slate-800 animate-spin"></span>
            <span className="text-sm font-semibold text-slate-500">Querying categories...</span>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">
                    Category Name <ArrowUpDown size={14} className={sortField === 'name' ? 'text-slate-700' : 'text-slate-400'} />
                  </div>
                </th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{cat.name}</td>
                  <td className="px-6 py-4 font-semibold text-xs whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded capitalize ${
                      cat.type === 'environmental' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      cat.type === 'social' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      'bg-purple-50 text-purple-700 border border-purple-100'
                    }`}>
                      {cat.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 max-w-xs xl:max-w-md truncate">{cat.description || '—'}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        cat.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {cat.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {categories.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No categories found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {!isLoading && categories.length > 0 && (
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-slate-900/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold text-slate-800">
                {editingCategory ? 'Edit ESG Category' : 'Add ESG Category'}
              </h4>
              <button
                onClick={closeModal}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Carbon Offsets"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800/20 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">ESG Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800/20 bg-slate-50"
                >
                  <option value="environmental">Environmental</option>
                  <option value="social">Social</option>
                  <option value="governance">Governance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  rows={3}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief explanation of this Category..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800/20 bg-slate-50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800/20 bg-slate-50"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                Save Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesTable;
