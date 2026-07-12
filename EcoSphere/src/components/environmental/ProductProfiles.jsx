import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Search, Grid, List, X, AlertTriangle, Award, Recycle, CheckCircle, HelpCircle, AlertCircle } from 'lucide-react';

const ProductProfiles = ({ productProfiles, setProductProfiles }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [deletingProfile, setDeletingProfile] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [formData, setFormData] = useState({ name: '', category: 'Packaging', carbonRating: 'A', recyclable: 'Yes', compliance: 'Compliant' });
  const [errors, setErrors] = useState({});

  const showToast = (msg) => { setToastMessage(msg); setTimeout(() => setToastMessage(''), 3000); };

  const filteredProfiles = useMemo(() => {
    return productProfiles.filter(p => {
      const t = searchTerm.toLowerCase();
      return p.name.toLowerCase().includes(t) || p.category.toLowerCase().includes(t) || p.carbonRating.toLowerCase().includes(t) || p.compliance.toLowerCase().includes(t);
    });
  }, [productProfiles, searchTerm]);

  const handleOpenForm = (profile = null) => {
    if (profile) { setEditingProfile(profile); setFormData({ name: profile.name, category: profile.category, carbonRating: profile.carbonRating, recyclable: profile.recyclable, compliance: profile.compliance }); }
    else { setEditingProfile(null); setFormData({ name: '', category: 'Packaging', carbonRating: 'A', recyclable: 'Yes', compliance: 'Compliant' }); }
    setErrors({}); setIsModalOpen(true);
  };

  const handleConfirmDelete = () => { if (!deletingProfile) return; setProductProfiles(p => p.filter(x => x.id !== deletingProfile.id)); showToast(`Deleted "${deletingProfile.name}"`); setDeletingProfile(null); };
  const handleFormChange = (e) => { setFormData(p => ({ ...p, [e.target.name]: e.target.value })); };

  const validate = () => { const e = {}; if (!formData.name.trim()) e.name = 'Required'; setErrors(e); return Object.keys(e).length === 0; };

  const handleFormSubmit = (ev) => {
    ev.preventDefault(); if (!validate()) return;
    const rec = { id: editingProfile ? editingProfile.id : 'P-' + Date.now(), name: formData.name.trim(), category: formData.category, carbonRating: formData.carbonRating, recyclable: formData.recyclable, compliance: formData.compliance };
    if (editingProfile) { setProductProfiles(p => p.map(x => x.id === rec.id ? rec : x)); showToast(`Updated "${rec.name}"`); }
    else { setProductProfiles(p => [rec, ...p]); showToast(`Added "${rec.name}"`); }
    setIsModalOpen(false);
  };

  const getRatingColor = (r) => {
    const c = r.replace('+', '').replace('-', '').toUpperCase();
    if (c === 'A') return { bg: '#d1fae5', color: '#065f46', border: '#a7f3d0' };
    if (c === 'B') return { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' };
    if (c === 'C') return { bg: '#fef3c7', color: '#92400e', border: '#fde68a' };
    return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
  };

  const getComplianceStyle = (comp) => {
    if (comp === 'Compliant') return { icon: <CheckCircle size={14} />, color: '#059669', bg: '#ecfdf5' };
    if (comp === 'Under Review') return { icon: <HelpCircle size={14} />, color: '#d97706', bg: '#fffbeb' };
    return { icon: <AlertCircle size={14} />, color: '#dc2626', bg: '#fef2f2' };
  };

  const categories = ['Packaging', 'Electronics', 'Hardware', 'Office Supply', 'Raw Material'];
  const ratings = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];
  const compliances = ['Compliant', 'Under Review', 'Non-compliant'];
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
          <input type="text" placeholder="Search Products..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '40px', paddingRight: '16px', paddingTop: '10px', paddingBottom: '10px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', outline: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }} />
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filteredProfiles.length > 0 ? filteredProfiles.map(p => {
            const ratingStyle = getRatingColor(p.carbonRating);
            const compStyle = getComplianceStyle(p.compliance);
            return (
              <div key={p.id} style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'} onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{p.category}</span>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={() => handleOpenForm(p)} style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fffbeb'; e.currentTarget.style.color = '#d97706'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}><Edit size={14} /></button>
                      <button onClick={() => setDeletingProfile(p)} style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }} onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', marginBottom: '16px', marginTop: 0 }}>{p.name}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><Award size={18} /></div>
                      <div>
                        <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>CO₂ Rating</span>
                        <span style={{ padding: '2px 8px', fontSize: '12px', fontWeight: 800, borderRadius: '4px', backgroundColor: ratingStyle.bg, color: ratingStyle.color, border: `1px solid ${ratingStyle.border}` }}>{p.carbonRating}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><Recycle size={18} /></div>
                      <div>
                        <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Recyclable</span>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: p.recyclable === 'Yes' ? '#059669' : '#dc2626' }}>{p.recyclable}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #f1f5f9', marginTop: '16px', backgroundColor: '#f8fafc', margin: '16px -24px -24px', padding: '16px 24px', borderRadius: '0 0 16px 16px' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Compliance</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#fff', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 700, color: compStyle.color }}>
                    {compStyle.icon}<span>{p.compliance}</span>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div style={{ gridColumn: '1 / -1', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
              <p style={{ fontWeight: 600, color: '#475569', marginBottom: '4px' }}>No products found</p><p style={{ fontSize: '12px' }}>Add a product to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Product Name', 'Category', 'Carbon Rating', 'Recyclable', 'Compliance', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '14px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: ['Carbon Rating', 'Recyclable', 'Actions'].includes(h) ? 'center' : 'left' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.map(p => {
                  const ratingStyle = getRatingColor(p.carbonRating);
                  const compStyle = getComplianceStyle(p.compliance);
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }} onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>{p.name}</td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontSize: '14px', fontWeight: 500 }}>{p.category}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}><span style={{ padding: '2px 10px', fontSize: '12px', fontWeight: 800, borderRadius: '4px', backgroundColor: ratingStyle.bg, color: ratingStyle.color, border: `1px solid ${ratingStyle.border}` }}>{p.carbonRating}</span></td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600, color: p.recyclable === 'Yes' ? '#059669' : '#dc2626', fontSize: '14px' }}>{p.recyclable}</td>
                      <td style={{ padding: '14px 16px' }}><div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, color: compStyle.color }}>{compStyle.icon}<span>{p.compliance}</span></div></td>
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
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '460px', padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', zIndex: 10, margin: '0 16px', position: 'relative' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '24px', marginTop: 0 }}>{editingProfile ? 'Edit Product ESG Profile' : 'Add Product ESG Profile'}</h3>
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div><label style={labelStyle}>Product Name</label><input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="e.g. Eco-Bottle 500ml" style={inputStyle(errors.name)} />{errors.name && <p style={{ fontSize: '12px', color: '#ef4444', margin: '4px 0 0' }}>{errors.name}</p>}</div>
              <div><label style={labelStyle}>Category</label><select name="category" value={formData.category} onChange={handleFormChange} style={inputStyle(false)}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div><label style={labelStyle}>Carbon Rating</label><select name="carbonRating" value={formData.carbonRating} onChange={handleFormChange} style={inputStyle(false)}>{ratings.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
                <div><label style={labelStyle}>Recyclable</label><select name="recyclable" value={formData.recyclable} onChange={handleFormChange} style={inputStyle(false)}><option value="Yes">Yes</option><option value="No">No</option></select></div>
              </div>
              <div><label style={labelStyle}>Compliance Status</label><select name="compliance" value={formData.compliance} onChange={handleFormChange} style={inputStyle(false)}>{compliances.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
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
