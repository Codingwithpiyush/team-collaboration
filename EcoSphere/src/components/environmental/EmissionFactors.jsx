import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Search, X, AlertTriangle, Flame } from 'lucide-react';

const EmissionFactors = ({ emissionFactors, setEmissionFactors }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFactor, setEditingFactor] = useState(null);
  const [deletingFactor, setDeletingFactor] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [formData, setFormData] = useState({ name: '', category: 'Fuel', emissionValue: '', unit: 'kg CO2e/liter', status: 'Active' });
  const [errors, setErrors] = useState({});

  const showToast = (msg) => { setToastMessage(msg); setTimeout(() => setToastMessage(''), 3000); };

  const filteredFactors = useMemo(() => {
    return emissionFactors.filter(ef => {
      const t = searchTerm.toLowerCase();
      return ef.name.toLowerCase().includes(t) || ef.category.toLowerCase().includes(t) || ef.status.toLowerCase().includes(t);
    });
  }, [emissionFactors, searchTerm]);

  const handleSelectAll = (e) => { e.target.checked ? setSelectedIds(filteredFactors.map(f => f.id)) : setSelectedIds([]); };
  const handleSelectOne = (id) => { setSelectedIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]); };

  const handleOpenForm = (factor = null) => {
    if (factor) { setEditingFactor(factor); setFormData({ name: factor.name, category: factor.category, emissionValue: factor.emissionValue, unit: factor.unit, status: factor.status }); }
    else { setEditingFactor(null); setFormData({ name: '', category: 'Fuel', emissionValue: '', unit: 'kg CO2e/liter', status: 'Active' }); }
    setErrors({}); setIsModalOpen(true);
  };

  const handleOpenEditSelected = () => { if (selectedIds.length !== 1) return; const item = emissionFactors.find(ef => ef.id === selectedIds[0]); if (item) handleOpenForm(item); };
  const handleOpenDeleteConfirm = (factor) => setDeletingFactor(factor);
  const handleOpenDeleteSelected = () => { if (selectedIds.length === 0) return; setDeletingFactor({ id: 'BULK', name: `${selectedIds.length} selected factors`, count: selectedIds.length }); };

  const handleConfirmDelete = () => {
    if (!deletingFactor) return;
    if (deletingFactor.id === 'BULK') { setEmissionFactors(p => p.filter(ef => !selectedIds.includes(ef.id))); showToast(`Deleted ${deletingFactor.count} factors`); setSelectedIds([]); }
    else { setEmissionFactors(p => p.filter(ef => ef.id !== deletingFactor.id)); showToast(`Deleted "${deletingFactor.name}"`); setSelectedIds(p => p.filter(id => id !== deletingFactor.id)); }
    setDeletingFactor(null);
  };

  const handleFormChange = (e) => { const { name, value } = e.target; setFormData(p => ({ ...p, [name]: value })); };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Required';
    if (isNaN(parseFloat(formData.emissionValue)) || parseFloat(formData.emissionValue) <= 0) e.emissionValue = 'Must be positive';
    if (!formData.unit.trim()) e.unit = 'Required';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleFormSubmit = (ev) => {
    ev.preventDefault(); if (!validate()) return;
    const rec = { id: editingFactor ? editingFactor.id : 'EF-' + Date.now(), name: formData.name.trim(), category: formData.category, emissionValue: parseFloat(formData.emissionValue), unit: formData.unit.trim(), status: formData.status };
    if (editingFactor) { setEmissionFactors(p => p.map(ef => ef.id === rec.id ? rec : ef)); showToast(`Updated "${rec.name}"`); }
    else { setEmissionFactors(p => [rec, ...p]); showToast(`Added "${rec.name}"`); }
    setIsModalOpen(false);
  };

  const categories = ['Fuel', 'Utility', 'Travel', 'Waste', 'Material'];
  const inputStyle = (hasErr) => ({ width: '100%', padding: '10px 16px', borderRadius: '12px', border: `1px solid ${hasErr ? '#fca5a5' : '#e2e8f0'}`, backgroundColor: '#f8fafc', fontSize: '14px', outline: 'none', boxSizing: 'border-box' });
  const labelStyle = { display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '6px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '16px', right: '16px', zIndex: 50, backgroundColor: '#0f172a', color: '#fff', padding: '12px 20px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: 500 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
          {toastMessage}
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => handleOpenForm()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', backgroundColor: '#059669', color: '#fff', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 1px 3px rgba(5,150,105,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#047857'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#059669'}>
            <Plus size={16} /><span>Add Factor</span>
          </button>
          <button onClick={handleOpenEditSelected} disabled={selectedIds.length !== 1} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', backgroundColor: selectedIds.length === 1 ? '#f59e0b' : '#f1f5f9', color: selectedIds.length === 1 ? '#fff' : '#94a3b8', fontSize: '14px', fontWeight: 600, border: `1px solid ${selectedIds.length === 1 ? '#f59e0b' : '#e2e8f0'}`, cursor: selectedIds.length === 1 ? 'pointer' : 'not-allowed', opacity: selectedIds.length === 1 ? 1 : 0.6 }}>
            <Edit size={16} /><span>Edit</span>
          </button>
          <button onClick={handleOpenDeleteSelected} disabled={selectedIds.length === 0} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', backgroundColor: selectedIds.length > 0 ? '#ef4444' : '#f1f5f9', color: selectedIds.length > 0 ? '#fff' : '#94a3b8', fontSize: '14px', fontWeight: 600, border: `1px solid ${selectedIds.length > 0 ? '#ef4444' : '#e2e8f0'}`, cursor: selectedIds.length > 0 ? 'pointer' : 'not-allowed', opacity: selectedIds.length > 0 ? 1 : 0.6 }}>
            <Trash2 size={16} /><span>Delete</span>
          </button>
        </div>
        <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
          <input type="text" placeholder="Search Emission Factors..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '40px', paddingRight: searchTerm ? '36px' : '16px', paddingTop: '10px', paddingBottom: '10px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', outline: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }} />
          {searchTerm && <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px' }}><X size={16} /></button>}
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '14px 16px', width: '48px', textAlign: 'center' }}>
                  <input type="checkbox" checked={filteredFactors.length > 0 && selectedIds.length === filteredFactors.length} onChange={handleSelectAll} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#10b981' }} />
                </th>
                {['Factor Name', 'Category', 'Emission Value', 'Unit', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: h === 'Emission Value' ? 'right' : h === 'Actions' ? 'center' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredFactors.length > 0 ? filteredFactors.map(ef => {
                const isChecked = selectedIds.includes(ef.id);
                return (
                  <tr key={ef.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: isChecked ? '#f0fdf4' : 'transparent', transition: 'background-color 0.15s' }}
                    onMouseEnter={e => { if (!isChecked) e.currentTarget.style.backgroundColor = '#f8fafc'; }} onMouseLeave={e => { if (!isChecked) e.currentTarget.style.backgroundColor = 'transparent'; }}>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <input type="checkbox" checked={isChecked} onChange={() => handleSelectOne(ef.id)} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#10b981' }} />
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#fff7ed', color: '#ea580c', flexShrink: 0 }}><Flame size={16} /></div>
                        <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>{ef.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 600, borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#475569' }}>{ef.category}</span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: '#334155', fontSize: '14px' }}>{ef.emissionValue}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '14px', fontWeight: 500 }}>{ef.unit}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 600, borderRadius: '9999px', backgroundColor: ef.status === 'Active' ? '#dcfce7' : '#f1f5f9', color: ef.status === 'Active' ? '#15803d' : '#64748b', border: `1px solid ${ef.status === 'Active' ? '#bbf7d0' : '#e2e8f0'}` }}>{ef.status}</span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <button onClick={() => handleOpenForm(ef)} title="Edit" style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fffbeb'; e.currentTarget.style.color = '#d97706'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleOpenDeleteConfirm(ef)} title="Delete" style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan="7" style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}><p style={{ fontWeight: 600, color: '#475569', marginBottom: '4px' }}>No emission factors found</p><p style={{ fontSize: '12px' }}>Add an emission factor to get started.</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setIsModalOpen(false)}></div>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '460px', padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', zIndex: 10, margin: '0 16px', position: 'relative' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '24px', marginTop: 0 }}>{editingFactor ? 'Edit Emission Factor' : 'Add Emission Factor'}</h3>
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><label style={labelStyle}>Factor Name</label><input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="e.g. Diesel" style={inputStyle(errors.name)} />{errors.name && <p style={{ fontSize: '12px', color: '#ef4444', margin: '4px 0 0' }}>{errors.name}</p>}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div><label style={labelStyle}>Category</label><select name="category" value={formData.category} onChange={handleFormChange} style={inputStyle(false)}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label style={labelStyle}>Status</label><select name="status" value={formData.status} onChange={handleFormChange} style={inputStyle(false)}><option value="Active">Active</option><option value="Inactive">Inactive</option></select></div>
              </div>
              <div><label style={labelStyle}>Emission Value</label><input type="number" step="0.0001" name="emissionValue" value={formData.emissionValue} onChange={handleFormChange} placeholder="e.g. 2.68" style={inputStyle(errors.emissionValue)} />{errors.emissionValue && <p style={{ fontSize: '12px', color: '#ef4444', margin: '4px 0 0' }}>{errors.emissionValue}</p>}</div>
              <div><label style={labelStyle}>Unit</label><input type="text" name="unit" value={formData.unit} onChange={handleFormChange} placeholder="e.g. kg CO2e/liter" style={inputStyle(errors.unit)} />{errors.unit && <p style={{ fontSize: '12px', color: '#ef4444', margin: '4px 0 0' }}>{errors.unit}</p>}</div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 600, color: '#475569', backgroundColor: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: 600, color: '#fff', backgroundColor: '#059669', cursor: 'pointer', boxShadow: '0 1px 3px rgba(5,150,105,0.3)' }}>{editingFactor ? 'Save Changes' : 'Add Factor'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingFactor && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setDeletingFactor(null)}></div>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '440px', padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', zIndex: 10, margin: '0 16px', position: 'relative' }}>
            <button onClick={() => setDeletingFactor(null)} style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', flexShrink: 0 }}><AlertTriangle size={24} /></div>
              <div><h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>Delete Emission Factor</h3><p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Are you sure you want to delete <strong style={{ color: '#334155' }}>{deletingFactor.name}</strong>?</p></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', marginTop: '24px' }}>
              <button onClick={() => setDeletingFactor(null)} style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 600, color: '#475569', backgroundColor: '#fff', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleConfirmDelete} style={{ padding: '10px 16px', borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: 600, color: '#fff', backgroundColor: '#ef4444', cursor: 'pointer', boxShadow: '0 1px 3px rgba(239,68,68,0.3)' }}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmissionFactors;
