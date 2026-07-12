import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const AuditModal = ({ isOpen, onClose, onSave, audit }) => {
  const [formData, setFormData] = useState({
    title: '',
    department: 'Manufacturing',
    auditor: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Environmental Audit',
    description: '',
    status: 'Scheduled'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (audit) {
      setFormData({
        title: audit.title || '',
        department: audit.department || 'Manufacturing',
        auditor: audit.auditor || '',
        date: audit.date || '',
        type: audit.type || 'Environmental Audit',
        description: audit.description || '',
        status: audit.status || 'Scheduled'
      });
    } else {
      setFormData({
        title: '',
        department: 'Manufacturing',
        auditor: '',
        date: new Date().toISOString().split('T')[0],
        type: 'Environmental Audit',
        description: '',
        status: 'Scheduled'
      });
    }
    setErrors({});
  }, [audit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Audit Title is required';
    if (!formData.auditor.trim()) newErrors.auditor = 'Auditor name is required';
    if (!formData.date) newErrors.date = 'Audit Date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      id: audit ? audit.id : 'AUD-' + Date.now(),
      title: formData.title.trim(),
      department: formData.department,
      auditor: formData.auditor.trim(),
      date: formData.date,
      type: formData.type,
      description: formData.description.trim(),
      status: formData.status,
      findings: audit ? audit.findings : 'No Issues' // Default for new audits
    });
  };

  const departments = ['Manufacturing', 'Procurement', 'HR', 'IT', 'Logistics', 'Corporate', 'R&D', 'Sales'];
  const auditTypes = ['Environmental Audit', 'Supply Chain Audit', 'Internal Audit', 'Compliance Audit', 'Safety Audit'];
  const statuses = ['Completed', 'Under Review', 'Scheduled', 'Cancelled'];

  const labelStyle = { display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '6px' };
  const inputStyle = (hasErr) => ({
    width: '100%', padding: '10px 16px', borderRadius: '12px',
    border: `1px solid ${hasErr ? '#fca5a5' : '#e2e8f0'}`,
    backgroundColor: '#f8fafc', fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s'
  });

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Backdrop */}
      <div 
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      ></div>

      {/* Modal Box */}
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
          {audit ? 'Edit Audit Record' : 'Schedule New Audit'}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Audit Title</label>
            <input 
              type="text" 
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Q2 Waste Audit"
              style={inputStyle(errors.title)}
              onFocus={e => { e.target.style.borderColor = '#8b5cf6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = errors.title ? '#fca5a5' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
            />
            {errors.title && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', marginBottom: 0 }}>{errors.title}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Department</label>
              <select name="department" value={formData.department} onChange={handleChange} style={inputStyle(false)}>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Audit Type</label>
              <select name="type" value={formData.type} onChange={handleChange} style={inputStyle(false)}>
                {auditTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Auditor Name</label>
              <input 
                type="text" 
                name="auditor"
                value={formData.auditor}
                onChange={handleChange}
                placeholder="e.g. S. Nair"
                style={inputStyle(errors.auditor)}
                onFocus={e => { e.target.style.borderColor = '#8b5cf6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = errors.auditor ? '#fca5a5' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
              {errors.auditor && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', marginBottom: 0 }}>{errors.auditor}</p>}
            </div>
            <div>
              <label style={labelStyle}>Audit Date</label>
              <input 
                type="date" 
                name="date"
                value={formData.date}
                onChange={handleChange}
                style={inputStyle(errors.date)}
                onFocus={e => { e.target.style.borderColor = '#8b5cf6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = errors.date ? '#fca5a5' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
              {errors.date && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', marginBottom: 0 }}>{errors.date}</p>}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Audit Status</label>
            <select name="status" value={formData.status} onChange={handleChange} style={inputStyle(false)}>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Description / Scope</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              rows="3"
              placeholder="Define scope, key checkpoints, or references..."
              style={{ ...inputStyle(false), resize: 'vertical' }}
              onFocus={e => { e.target.style.borderColor = '#8b5cf6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
            ></textarea>
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
              {audit ? 'Save Changes' : 'Create Audit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuditModal;
