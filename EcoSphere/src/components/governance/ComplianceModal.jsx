import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const ComplianceModal = ({ isOpen, onClose, onSave, issue, employees = [], departments = [] }) => {
  const [formData, setFormData] = useState({
    issue: '',
    description: '',
    severity: 'Medium',
    department: '',
    owner: '',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'Open'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (issue) {
      setFormData({
        issue: issue.issue || '',
        description: issue.description || '',
        severity: issue.severity || 'Medium',
        department: issue.departmentId || issue.department || '',
        owner: issue.ownerId || issue.owner || '',
        dueDate: issue.dueDate || '',
        status: issue.status === 'Overdue' ? 'Open' : (issue.status || 'Open')
      });
    } else {
      setFormData({
        issue: '',
        description: '',
        severity: 'Medium',
        department: departments && departments.length > 0 ? departments[0].id : '',
        owner: employees && employees.length > 0 ? employees[0].id : '',
        dueDate: new Date().toISOString().split('T')[0],
        status: 'Open'
      });
    }
    setErrors({});
  }, [issue, isOpen, employees, departments]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.issue.trim()) newErrors.issue = 'Issue Title is required';
    if (!formData.owner) newErrors.owner = 'Owner / Assignee is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due Date is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      id: issue ? issue.id : undefined,
      issue: formData.issue.trim(),
      description: formData.description.trim(),
      severity: formData.severity,
      department: isNaN(parseInt(formData.department)) ? formData.department : parseInt(formData.department),
      owner: isNaN(parseInt(formData.owner)) ? formData.owner : parseInt(formData.owner),
      dueDate: formData.dueDate,
      status: formData.status
    });
  };

  const defaultDepts = ['Manufacturing', 'Procurement', 'HR', 'IT', 'Logistics', 'Corporate', 'R&D', 'Sales'];
  const severities = ['High', 'Medium', 'Low'];
  const statuses = ['Open', 'In Progress', 'Resolved'];

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
          {issue ? 'Edit Compliance Issue' : 'Raise Compliance Issue'}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Issue Title</label>
            <input 
              type="text" 
              name="issue"
              value={formData.issue}
              onChange={handleChange}
              placeholder="e.g. Missing MSDS Sheets"
              style={inputStyle(errors.issue)}
              onFocus={e => { e.target.style.borderColor = '#8b5cf6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = errors.issue ? '#fca5a5' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
            />
            {errors.issue && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', marginBottom: 0 }}>{errors.issue}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Severity</label>
              <select name="severity" value={formData.severity} onChange={handleChange} style={inputStyle(false)}>
                {severities.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Department</label>
              {departments && departments.length > 0 ? (
                <select name="department" value={formData.department} onChange={handleChange} style={inputStyle(errors.department)}>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              ) : (
                <select name="department" value={formData.department} onChange={handleChange} style={inputStyle(errors.department)}>
                  {defaultDepts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              )}
              {errors.department && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', marginBottom: 0 }}>{errors.department}</p>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Owner / Assignee</label>
              {employees && employees.length > 0 ? (
                <select name="owner" value={formData.owner} onChange={handleChange} style={inputStyle(errors.owner)}>
                  <option value="">Select Assignee</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                </select>
              ) : (
                <input 
                  type="text" 
                  name="owner"
                  value={formData.owner}
                  onChange={handleChange}
                  placeholder="e.g. Rahul"
                  style={inputStyle(errors.owner)}
                />
              )}
              {errors.owner && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', marginBottom: 0 }}>{errors.owner}</p>}
            </div>
            <div>
              <label style={labelStyle}>Due Date</label>
              <input 
                type="date" 
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                style={inputStyle(errors.dueDate)}
                onFocus={e => { e.target.style.borderColor = '#8b5cf6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = errors.dueDate ? '#fca5a5' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
              {errors.dueDate && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', marginBottom: 0 }}>{errors.dueDate}</p>}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Status</label>
            <select name="status" value={formData.status} onChange={handleChange} style={inputStyle(false)}>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Issue Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              rows="3"
              placeholder="Describe the nature of the non-compliance issue and recovery actions..."
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
            >
              {issue ? 'Save Changes' : 'Create Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplianceModal;
