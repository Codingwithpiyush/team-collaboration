import React, { useState, useEffect } from 'react';
import { X, Upload, FileText } from 'lucide-react';

const PolicyModal = ({ isOpen, onClose, onSave, policy }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Sustainability',
    department: 'Corporate',
    version: '1.0',
    effectiveDate: new Date().toISOString().split('T')[0],
    description: '',
    status: 'Draft',
    pdfFile: null
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (policy) {
      setFormData({
        name: policy.name || '',
        category: policy.category || 'Sustainability',
        department: policy.department || 'Corporate',
        version: policy.version || '1.0',
        effectiveDate: policy.effectiveDate || '',
        description: policy.description || '',
        status: policy.status || 'Draft',
        pdfFile: policy.pdfFile || null
      });
    } else {
      setFormData({
        name: '',
        category: 'Sustainability',
        department: 'Corporate',
        version: '1.0',
        effectiveDate: new Date().toISOString().split('T')[0],
        description: '',
        status: 'Draft',
        pdfFile: null
      });
    }
    setErrors({});
  }, [policy, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, pdfFile: e.target.files[0].name }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Policy Name is required';
    if (!formData.version.trim()) newErrors.version = 'Version is required';
    if (!formData.effectiveDate) newErrors.effectiveDate = 'Effective Date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      id: policy ? policy.id : 'POL-' + Date.now(),
      name: formData.name.trim(),
      category: formData.category,
      department: formData.department,
      version: formData.version.trim(),
      effectiveDate: formData.effectiveDate,
      description: formData.description.trim(),
      status: formData.status,
      pdfFile: formData.pdfFile
    });
  };

  const departments = ['Corporate', 'Logistics', 'Manufacturing', 'HR', 'IT', 'Procurement', 'R&D', 'Sales'];
  const categories = ['Ethics', 'Sustainability', 'Health & Safety', 'Compliance', 'Supply Chain', 'Human Rights'];
  const statuses = ['Active', 'Draft', 'Archived'];

  const labelStyle = { display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '6px' };
  const inputStyle = (hasErr) => ({
    width: '100%', padding: '10px 16px', borderRadius: '12px',
    border: `1px solid ${hasErr ? '#fca5a5' : '#e2e8f0'}`,
    backgroundColor: '#f8fafc', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s'
  });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div 
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      ></div>

      <div style={{
        backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '540px',
        padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0',
        zIndex: 10, margin: '0 16px', position: 'relative', maxHeight: '90vh', overflowY: 'auto'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
        >
          <X size={20} />
        </button>

        <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '24px', marginTop: 0 }}>
          {policy ? 'Edit Policy Details' : 'New ESG Policy'}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Policy Name</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Environmental Policy"
              style={inputStyle(errors.name)}
              onFocus={e => { e.target.style.borderColor = '#8b5cf6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = errors.name ? '#fca5a5' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
            />
            {errors.name && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', marginBottom: 0 }}>{errors.name}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Category</label>
              <select name="category" value={formData.category} onChange={handleChange} style={inputStyle(false)}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Department</label>
              <select name="department" value={formData.department} onChange={handleChange} style={inputStyle(false)}>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Version</label>
              <input 
                type="text" 
                name="version"
                value={formData.version}
                onChange={handleChange}
                placeholder="e.g. 1.0"
                style={inputStyle(errors.version)}
                onFocus={e => { e.target.style.borderColor = '#8b5cf6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = errors.version ? '#fca5a5' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
              {errors.version && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', marginBottom: 0 }}>{errors.version}</p>}
            </div>
            <div>
              <label style={labelStyle}>Effective Date</label>
              <input 
                type="date" 
                name="effectiveDate"
                value={formData.effectiveDate}
                onChange={handleChange}
                style={inputStyle(errors.effectiveDate)}
                onFocus={e => { e.target.style.borderColor = '#8b5cf6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = errors.effectiveDate ? '#fca5a5' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
              {errors.effectiveDate && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', marginBottom: 0 }}>{errors.effectiveDate}</p>}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Policy Status</label>
            <select name="status" value={formData.status} onChange={handleChange} style={inputStyle(false)}>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Description / Scope Summary</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              rows="3"
              placeholder="Provide a detailed description of the policy scope, guidelines, or key references..."
              style={{ ...inputStyle(false), resize: 'vertical' }}
              onFocus={e => { e.target.style.borderColor = '#8b5cf6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
            ></textarea>
          </div>

          <div>
            <label style={labelStyle}>Upload Policy Document (PDF)</label>
            <div style={{
              border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '20px',
              textAlign: 'center', backgroundColor: '#f8fafc', position: 'relative', cursor: 'pointer'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#8b5cf6'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#e2e8f0'}
            >
              <input 
                type="file" 
                accept=".pdf" 
                onChange={handleFileChange}
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
              />
              {formData.pdfFile ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#7c3aed', fontWeight: 600 }}>
                  <FileText size={24} />
                  <span style={{ fontSize: '13px' }}>{formData.pdfFile}</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                  <Upload size={24} style={{ color: '#94a3b8' }} />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>Drag and drop policy PDF or click to browse</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>PDF format only, max size 10MB</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', marginTop: '8px' }}>
            <button 
              type="button" 
              onClick={onClose} 
              style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 600, color: '#475569', backgroundColor: '#fff', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              style={{
                padding: '10px 20px', borderRadius: '12px', border: 'none',
                fontSize: '14px', fontWeight: 600, color: '#ffffff',
                backgroundColor: '#7c3aed', cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(124,58,237,0.2)'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#6d28d9'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#7c3aed'}
            >
              {policy ? 'Save Changes' : 'Save Policy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PolicyModal;
