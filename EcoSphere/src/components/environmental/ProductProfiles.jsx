import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Search, Grid, List, X, AlertTriangle, Award, Recycle, CheckCircle, HelpCircle, AlertCircle, Droplets } from 'lucide-react';
import { BASE_API_URL } from '../../config';

const ProductProfiles = ({ productProfiles, setProductProfiles, refresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [deletingProfile, setDeletingProfile] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    carbonFootprint: '',
    waterFootprint: '',
    recyclabilityRate: '',
    status: 'Active'
  });
  const [errors, setErrors] = useState({});

  const showToast = (msg) => { setToastMessage(msg); setTimeout(() => setToastMessage(''), 3000); };

  const filteredProfiles = useMemo(() => {
    return productProfiles.filter(p => {
      const t = searchTerm.toLowerCase();
      return p.name.toLowerCase().includes(t) || p.sku.toLowerCase().includes(t) || p.status.toLowerCase().includes(t);
    });
  }, [productProfiles, searchTerm]);

  const handleOpenForm = (profile = null) => {
    if (profile) {
      setEditingProfile(profile);
      setFormData({
        name: profile.name,
        sku: profile.sku,
        carbonFootprint: profile.carbonFootprint,
        waterFootprint: profile.waterFootprint,
        recyclabilityRate: profile.recyclabilityRate,
        status: profile.status
      });
    } else {
      setEditingProfile(null);
      setFormData({
        name: '',
        sku: '',
        carbonFootprint: '',
        waterFootprint: '',
        recyclabilityRate: '',
        status: 'Active'
      });
    }
    setErrors({});
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProfile) return;
    try {
      const res = await fetch(`${BASE_API_URL}/api/environmental/product-esg/${deletingProfile.id}/`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast(`Deleted "${deletingProfile.name}"`);
        if (refresh) await refresh();
      } else {
        showToast("Failed to delete product profile", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error connecting to backend", "error");
    }
    setDeletingProfile(null);
  };

  const handleFormChange = (e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Required';
    if (!formData.sku.trim()) e.sku = 'Required';
    if (isNaN(parseFloat(formData.carbonFootprint)) || parseFloat(formData.carbonFootprint) < 0) e.carbonFootprint = 'Must be non-negative';
    if (isNaN(parseFloat(formData.waterFootprint)) || parseFloat(formData.waterFootprint) < 0) e.waterFootprint = 'Must be non-negative';
    const rate = parseFloat(formData.recyclabilityRate);
    if (isNaN(rate) || rate < 0 || rate > 100) e.recyclabilityRate = 'Must be between 0 and 100';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFormSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    const isEdit = !!editingProfile;
    const url = isEdit
      ? `${BASE_API_URL}/api/environmental/product-esg/${editingProfile.id}/`
      : `${BASE_API_URL}/api/environmental/product-esg/`;
    const method = isEdit ? 'PUT' : 'POST';

    const payload = {
      product_name: formData.name.trim(),
      sku: formData.sku.trim(),
      carbon_footprint: parseFloat(formData.carbonFootprint),
      water_footprint: parseFloat(formData.waterFootprint),
      recyclability_rate: parseFloat(formData.recyclabilityRate),
      status: formData.status.toLowerCase()
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok || res.status === 201) {
        showToast(isEdit ? `Updated "${formData.name}"` : `Added "${formData.name}"`);
        setIsModalOpen(false);
        if (refresh) await refresh();
      } else {
        const errorData = await res.json();
        showToast(errorData?.detail || errorData?.non_field_errors?.[0] || "Error saving product ESG profile", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error connecting to backend", "error");
    }
  };

  const getRatingFromFootprint = (footprint) => {
    if (footprint < 15) return 'A';
    if (footprint < 45) return 'B';
    if (footprint < 80) return 'C';
    return 'D';
  };

  const getRatingColor = (r) => {
    const c = r.replace('+', '').replace('-', '').toUpperCase();
    if (c === 'A') return { bg: '#d1fae5', color: '#065f46', border: '#a7f3d0' };
    if (c === 'B') return { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' };
    if (c === 'C') return { bg: '#fef3c7', color: '#92400e', border: '#fde68a' };
    return { bg: '#fee2e2', color: '#b91c1c', border: '#fca5a5' };
  };

  const getStatusStyle = (status) => {
    if (status.toLowerCase() === 'active') return { icon: <CheckCircle size={14} />, color: '#059669', bg: '#ecfdf5' };
    return { icon: <AlertCircle size={14} />, color: '#dc2626', bg: '#fef2f2' };
  };

  const inputStyle = (hasErr) => ({ width: '100%', padding: '10px 16px', borderRadius: '12px', border: `1px solid ${hasErr ? '#fca5a5' : '#e2e8f0'}`, backgroundColor: '#f8fafc', fontSize: '14px', outline: 'none', boxSizing: 'border-box' });
  const labelStyle = { display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '6px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '16px', right: '16px', zIndex: 50, backgroundColor: '#0f172a', color: '#fff', padding: '12px 20px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: 500 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>{toastMessage}
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => handleOpenForm()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', backgroundColor: '#059669', color: '#fff', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 1px 3px rgba(5,150,105,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#047857'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#059669'}>
            <Plus size={16} /><span>Add Profile</span>
          </button>
          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <button onClick={() => setViewMode('grid')} style={{ padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: viewMode === 'grid' ? '#fff' : 'transparent', color: viewMode === 'grid' ? '#1e293b' : '#94a3b8', boxShadow: viewMode === 'grid' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}><Grid size={16} /></button>
            <button onClick={() => setViewMode('table')} style={{ padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', backgroundColor: viewMode === 'table' ? '#fff' : 'transparent', color: viewMode === 'table' ? '#1e293b' : '#94a3b8', boxShadow: viewMode === 'table' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none' }}><List size={16} /></button>
          </div>
        </div>
        <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
          <input type="text" placeholder="Search SKU or Product..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '40px', paddingRight: '16px', paddingTop: '10px', paddingBottom: '10px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', outline: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }} />
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filteredProfiles.length > 0 ? filteredProfiles.map(p => {
            const letterRating = getRatingFromFootprint(p.carbonFootprint);
            const ratingStyle = getRatingColor(letterRating);
            const statusStyle = getStatusStyle(p.status);
            return (
              <div key={p.id} style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'} onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SKU: {p.sku}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={() => handleOpenForm(p)} style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fffbeb'; e.currentTarget.style.color = '#d97706'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}><Edit size={14} /></button>
                      <button onClick={() => setDeletingProfile(p)} style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px', marginTop: 0 }}>{p.name}</h4>
                  
                  {/* Footprint Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><Award size={18} /></div>
                      <div>
                        <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Carbon Rating</span>
                        <span style={{ padding: '2px 8px', fontSize: '12px', fontWeight: 800, borderRadius: '4px', backgroundColor: ratingStyle.bg, color: ratingStyle.color, border: `1px solid ${ratingStyle.border}` }}>{letterRating}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}><Recycle size={18} /></div>
                      <div>
                        <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Recyclability</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#059669' }}>{p.recyclabilityRate}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Footprint Details */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Carbon Footprint</span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#475569' }}>{p.carbonFootprint} kg CO₂e</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Water Footprint</span>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}><Droplets size={14} style={{ color: '#0284c7' }} /> {p.waterFootprint} L</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #f1f5f9', marginTop: '16px', backgroundColor: '#f8fafc', margin: '16px -24px -24px', padding: '16px 24px', borderRadius: '0 0 16px 16px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Registry Status</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#fff', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 700, color: statusStyle.color }}>
                    {statusStyle.icon}<span>{p.status}</span>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div style={{ gridColumn: '1 / -1', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
              <p style={{ fontWeight: 600, color: '#475569', marginBottom: '4px' }}>No products found</p><p style={{ fontSize: '12px' }}>Add a product profile to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Product Name', 'SKU', 'Carbon (kg CO₂e)', 'Water (L)', 'Recyclability', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: ['Carbon (kg CO₂e)', 'Water (L)', 'Recyclability', 'Actions'].includes(h) ? 'center' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map(p => {
                  const statusStyle = getStatusStyle(p.status);
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>{p.name}</td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontSize: '14px', fontWeight: 500 }}>{p.sku}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', color: '#475569', fontSize: '14px', fontWeight: 600 }}>{p.carbonFootprint}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', color: '#475569', fontSize: '14px', fontWeight: 500 }}>{p.waterFootprint}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600, color: '#059669', fontSize: '14px' }}>{p.recyclabilityRate}%</td>
                      <td style={{ padding: '14px 16px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, color: statusStyle.color }}>{statusStyle.icon}<span>{p.status}</span></div></td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <button onClick={() => handleOpenForm(p)} style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fffbeb'; e.currentTarget.style.color = '#d97706'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}><Edit size={16} /></button>
                          <button onClick={() => setDeletingProfile(p)} style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CRUD Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setIsModalOpen(false)}></div>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '480px', padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', zIndex: 10, margin: '0 16px', position: 'relative' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '24px', marginTop: 0 }}>{editingProfile ? 'Edit Product ESG Profile' : 'Add Product ESG Profile'}</h3>
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Product Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="e.g. Sustainable Office Chair" style={inputStyle(errors.name)} />
                {errors.name && <p style={{ fontSize: '12px', color: '#ef4444', margin: '4px 0 0' }}>{errors.name}</p>}
              </div>
              <div>
                <label style={labelStyle}>SKU Code</label>
                <input type="text" name="sku" value={formData.sku} onChange={handleFormChange} placeholder="e.g. CH-SUS-01" style={inputStyle(errors.sku)} />
                {errors.sku && <p style={{ fontSize: '12px', color: '#ef4444', margin: '4px 0 0' }}>{errors.sku}</p>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Carbon Footprint (kg CO₂e)</label>
                  <input type="number" step="any" name="carbonFootprint" value={formData.carbonFootprint} onChange={handleFormChange} placeholder="e.g. 45.2" style={inputStyle(errors.carbonFootprint)} />
                  {errors.carbonFootprint && <p style={{ fontSize: '12px', color: '#ef4444', margin: '4px 0 0' }}>{errors.carbonFootprint}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Water Footprint (L)</label>
                  <input type="number" step="any" name="waterFootprint" value={formData.waterFootprint} onChange={handleFormChange} placeholder="e.g. 120.0" style={inputStyle(errors.waterFootprint)} />
                  {errors.waterFootprint && <p style={{ fontSize: '12px', color: '#ef4444', margin: '4px 0 0' }}>{errors.waterFootprint}</p>}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Recyclability Rate (%)</label>
                  <input type="number" step="any" name="recyclabilityRate" value={formData.recyclabilityRate} onChange={handleFormChange} placeholder="e.g. 92.5" style={inputStyle(errors.recyclabilityRate)} />
                  {errors.recyclabilityRate && <p style={{ fontSize: '12px', color: '#ef4444', margin: '4px 0 0' }}>{errors.recyclabilityRate}</p>}
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select name="status" value={formData.status} onChange={handleFormChange} style={inputStyle(false)}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 600, color: '#475569', backgroundColor: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: 600, color: '#fff', backgroundColor: '#059669', cursor: 'pointer', boxShadow: '0 1px 3px rgba(5,150,105,0.3)' }}>{editingProfile ? 'Save Changes' : 'Add Profile'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingProfile && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setDeletingProfile(null)}></div>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '440px', padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', zIndex: 10, margin: '0 16px', position: 'relative' }}>
            <button onClick={() => setDeletingProfile(null)} style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', flexShrink: 0 }}><AlertTriangle size={24} /></div>
              <div><h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>Delete ESG Profile</h3><p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Are you sure you want to delete <strong style={{ color: '#334155' }}>{deletingProfile.name}</strong>?</p></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', marginTop: '24px' }}>
              <button onClick={() => setDeletingProfile(null)} style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 600, color: '#475569', backgroundColor: '#fff', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleConfirmDelete} style={{ padding: '10px 16px', borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: 600, color: '#fff', backgroundColor: '#ef4444', cursor: 'pointer', boxShadow: '0 1px 3px rgba(239,68,68,0.3)' }}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductProfiles;
