import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const GoalModal = ({ isOpen, onClose, onSave, goal }) => {
  const [formData, setFormData] = useState({
    name: '',
    department: 'Logistics',
    targetCo2: '',
    currentCo2: '',
    deadline: '',
    status: 'Active',
    description: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (goal) {
      setFormData({
        name: goal.name || '',
        department: goal.department || 'Logistics',
        targetCo2: goal.targetCo2 || '',
        currentCo2: goal.currentCo2 || '',
        deadline: goal.deadline || '',
        status: goal.status || 'Active',
        description: goal.description || ''
      });
    } else {
      setFormData({
        name: '',
        department: 'Logistics',
        targetCo2: '',
        currentCo2: '',
        deadline: '',
        status: 'Active',
        description: ''
      });
    }
    setErrors({});
  }, [goal, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Goal Name is required';
    if (!formData.department) newErrors.department = 'Department is required';
    const target = parseFloat(formData.targetCo2);
    if (isNaN(target) || target <= 0) newErrors.targetCo2 = 'Target CO₂ must be a positive number';
    const current = parseFloat(formData.currentCo2);
    if (isNaN(current) || current < 0) newErrors.currentCo2 = 'Current CO₂ must be a non-negative number';
    if (!isNaN(target) && target > 0 && !isNaN(current) && current > target) {
      newErrors.currentCo2 = 'Current CO₂ cannot exceed Target CO₂';
    }
    if (!formData.deadline) newErrors.deadline = 'Deadline is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      id: goal ? goal.id : 'G-' + Date.now(),
      name: formData.name.trim(),
      department: formData.department,
      targetCo2: parseFloat(formData.targetCo2),
      currentCo2: parseFloat(formData.currentCo2),
      deadline: formData.deadline,
      status: formData.status,
      description: formData.description.trim()
    });
  };

  const departments = ['Logistics', 'Manufacturing', 'Corporate', 'R&D', 'Sales'];
  const statuses = ['Active', 'On Track', 'Completed', 'Delayed'];

  const inputStyle = (hasError) => ({
    width: '100%', padding: '10px 16px', borderRadius: '12px',
    border: `1px solid ${hasError ? '#fca5a5' : '#e2e8f0'}`,
    backgroundColor: '#f8fafc', fontSize: '14px', outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s', boxSizing: 'border-box'
  });

  const labelStyle = {
    display: 'block', fontSize: '14px', fontWeight: 600,
    color: '#334155', marginBottom: '6px'
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} onClick={onClose}></div>
      <div style={{
        backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '540px',
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
          {goal ? 'Edit Environmental Goal' : 'New Environmental Goal'}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Goal Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Reduce Fleet Emissions" style={inputStyle(errors.name)}
              onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = errors.name ? '#fca5a5' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
            />
            {errors.name && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', marginBottom: 0 }}>{errors.name}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Department</label>
              <select name="department" value={formData.department} onChange={handleChange} style={inputStyle(false)}>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status</label>
              <select name="status" value={formData.status} onChange={handleChange} style={inputStyle(false)}>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Target CO₂ (t)</label>
              <input type="number" name="targetCo2" value={formData.targetCo2} onChange={handleChange} placeholder="e.g. 500" style={inputStyle(errors.targetCo2)}
                onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = errors.targetCo2 ? '#fca5a5' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
              {errors.targetCo2 && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', marginBottom: 0 }}>{errors.targetCo2}</p>}
            </div>
            <div>
              <label style={labelStyle}>Current CO₂ (t)</label>
              <input type="number" name="currentCo2" value={formData.currentCo2} onChange={handleChange} placeholder="e.g. 390" style={inputStyle(errors.currentCo2)}
                onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)'; }}
                onBlur={e => { e.target.style.borderColor = errors.currentCo2 ? '#fca5a5' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
              />
              {errors.currentCo2 && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', marginBottom: 0 }}>{errors.currentCo2}</p>}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Deadline</label>
            <input type="date" name="deadline" value={formData.deadline} onChange={handleChange} style={inputStyle(errors.deadline)}
              onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = errors.deadline ? '#fca5a5' : '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
            />
            {errors.deadline && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px', marginBottom: 0 }}>{errors.deadline}</p>}
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows="3"
              placeholder="Provide a detailed description of this ESG goal..."
              style={{ ...inputStyle(false), resize: 'vertical' }}
              onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={{
              padding: '10px 20px', borderRadius: '12px', border: '1px solid #e2e8f0',
              fontSize: '14px', fontWeight: 600, color: '#475569', backgroundColor: '#fff', cursor: 'pointer'
            }}>
              Cancel
            </button>
            <button type="submit" style={{
              padding: '10px 20px', borderRadius: '12px', border: 'none',
              fontSize: '14px', fontWeight: 600, color: '#ffffff',
              backgroundColor: '#059669', cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(5,150,105,0.3)'
            }}>
              {goal ? 'Save Changes' : 'Save Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalModal;
