import React, { useState, useEffect } from 'react';
import { X, Upload, Flame, FileText } from 'lucide-react';

const ChallengeModal = ({ isOpen, onClose, onSave, challenge, mode = 'form', onJoinSubmit }) => {
  // 1. Challenge Form State (mode === 'form')
  const [formFields, setFormFields] = useState({
    title: '',
    category: 'Carbon footprint',
    description: '',
    difficulty: 'Medium',
    xpReward: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    evidenceRequired: '',
    status: 'Draft',
    icon: '🏆'
  });

  // 2. Join Challenge State (mode === 'join')
  const [joinFields, setJoinFields] = useState({
    employee: 'Rahul',
    proofFile: null,
    remarks: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (mode === 'form') {
        if (challenge) {
          setFormFields({
            title: challenge.title || '',
            category: challenge.category || 'Carbon footprint',
            description: challenge.description || '',
            difficulty: challenge.difficulty || 'Medium',
            xpReward: challenge.xpReward || '',
            startDate: challenge.startDate || '',
            endDate: challenge.endDate || '',
            evidenceRequired: challenge.evidenceRequired || '',
            status: challenge.status || 'Draft',
            icon: challenge.icon || '🏆'
          });
        } else {
          setFormFields({
            title: '',
            category: 'Carbon footprint',
            description: '',
            difficulty: 'Medium',
            xpReward: '',
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            evidenceRequired: '',
            status: 'Draft',
            icon: '🏆'
          });
        }
      } else if (mode === 'join') {
        setJoinFields({
          employee: 'Rahul',
          proofFile: null,
          remarks: ''
        });
      }
      setErrors({});
    }
  }, [challenge, isOpen, mode]);

  if (!isOpen) return null;

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormFields(prev => ({ ...prev, [name]: value }));
  };

  const handleJoinChange = (e) => {
    const { name, value } = e.target;
    setJoinFields(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setJoinFields(prev => ({ ...prev, proofFile: e.target.files[0].name }));
    }
  };

  const validateForm = () => {
    const err = {};
    if (!formFields.title.trim()) err.title = 'Title is required';
    if (!formFields.description.trim()) err.description = 'Description is required';
    if (!formFields.endDate) err.endDate = 'End Date is required';
    if (!formFields.evidenceRequired.trim()) err.evidenceRequired = 'Evidence requirement description is required';
    
    const xp = parseInt(formFields.xpReward);
    if (isNaN(xp) || xp <= 0) err.xpReward = 'XP reward must be a positive number';
    
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const validateJoin = () => {
    const err = {};
    if (!joinFields.employee.trim()) err.employee = 'Employee name is required';
    if (!joinFields.proofFile) err.proofFile = 'Proof upload is required';
    
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'form') {
      if (!validateForm()) return;
      onSave({
        id: challenge ? challenge.id : 'CH-' + Date.now(),
        title: formFields.title.trim(),
        category: formFields.category,
        description: formFields.description.trim(),
        difficulty: formFields.difficulty,
        xpReward: parseInt(formFields.xpReward),
        startDate: formFields.startDate,
        endDate: formFields.endDate,
        evidenceRequired: formFields.evidenceRequired.trim(),
        status: formFields.status,
        icon: formFields.icon,
        participantsCount: challenge ? challenge.participantsCount : 0
      });
    } else if (mode === 'join') {
      if (!validateJoin()) return;
      onJoinSubmit({
        employee: joinFields.employee,
        challenge: challenge.title,
        proof: joinFields.proofFile,
        remarks: joinFields.remarks.trim(),
        xp: challenge.xpReward,
        challengeId: challenge.id
      });
    }
  };

  const categories = ['Carbon footprint', 'Waste Management', 'Energy Conservation', 'Product ESG', 'CSR Activity'];
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const statuses = ['Draft', 'Active', 'Under Review', 'Completed', 'Archived'];
  const employees = ['Rahul', 'Sneha', 'Aditi Rao', 'Priya', 'Amit', 'Vikram', 'Maya'];

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
          {mode === 'form' 
            ? (challenge ? 'Edit Challenge Details' : 'Create New Challenge') 
            : `Join Challenge: ${challenge?.title}`}
        </h3>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mode === 'form' ? (
            /* CHALLENGE FORM FIELDS */
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Icon</label>
                  <select name="icon" value={formFields.icon} onChange={handleFormChange} style={inputStyle(false)}>
                    {['🏆', '🏃‍♂️', '♻️', '🚲', '📄', '💡', '🌳', '🔌', '🚿'].map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Challenge Title</label>
                  <input 
                    type="text" 
                    name="title"
                    value={formFields.title}
                    onChange={handleFormChange}
                    placeholder="e.g. Sustainability Sprint"
                    style={inputStyle(errors.title)}
                  />
                  {errors.title && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{errors.title}</p>}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select name="category" value={formFields.category} onChange={handleFormChange} style={inputStyle(false)}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Difficulty</label>
                  <select name="difficulty" value={formFields.difficulty} onChange={handleFormChange} style={inputStyle(false)}>
                    {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>XP Reward</label>
                <input 
                  type="number" 
                  name="xpReward"
                  value={formFields.xpReward}
                  onChange={handleFormChange}
                  placeholder="e.g. 200"
                  style={inputStyle(errors.xpReward)}
                />
                {errors.xpReward && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{errors.xpReward}</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Start Date</label>
                  <input type="date" name="startDate" value={formFields.startDate} onChange={handleFormChange} style={inputStyle(false)} />
                </div>
                <div>
                  <label style={labelStyle}>End Date (Deadline)</label>
                  <input type="date" name="endDate" value={formFields.endDate} onChange={handleFormChange} style={inputStyle(errors.endDate)} />
                  {errors.endDate && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{errors.endDate}</p>}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Evidence Required</label>
                <input 
                  type="text" 
                  name="evidenceRequired"
                  value={formFields.evidenceRequired}
                  onChange={handleFormChange}
                  placeholder="e.g. Travel log snapshots / certificate upload"
                  style={inputStyle(errors.evidenceRequired)}
                />
                {errors.evidenceRequired && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{errors.evidenceRequired}</p>}
              </div>

              <div>
                <label style={labelStyle}>Status</label>
                <select name="status" value={formFields.status} onChange={handleFormChange} style={inputStyle(false)}>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Challenge Description</label>
                <textarea 
                  name="description" 
                  value={formFields.description} 
                  onChange={handleFormChange}
                  rows="3"
                  placeholder="Explain instructions and rules for the challenge..."
                  style={{ ...inputStyle(false), resize: 'vertical' }}
                ></textarea>
                {errors.description && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{errors.description}</p>}
              </div>
            </>
          ) : (
            /* JOIN CHALLENGE FIELDS */
            <>
              <div>
                <label style={labelStyle}>Select Employee</label>
                <select name="employee" value={joinFields.employee} onChange={handleJoinChange} style={inputStyle(false)}>
                  {employees.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>

              <div>
                <label style={labelStyle}>Required Evidence</label>
                <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: '#fff7ed', border: '1px solid #ffedd5', color: '#c2410c', fontSize: '13px', fontWeight: 600 }}>
                  {challenge?.evidenceRequired}
                </div>
              </div>

              <div>
                <label style={labelStyle}>Upload Proof Document</label>
                <div style={{
                  border: '2px dashed #fdba74', borderRadius: '12px', padding: '20px',
                  textAlign: 'center', backgroundColor: '#fffbf7', position: 'relative', cursor: 'pointer'
                }}>
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', width: '100%', height: '100%' }}
                  />
                  {joinFields.proofFile ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#ea580c', fontWeight: 700 }}>
                      <FileText size={24} />
                      <span style={{ fontSize: '13px' }}>{joinFields.proofFile}</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#c2410c' }}>
                      <Upload size={24} style={{ color: '#fdba74' }} />
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>Click to browse or drop files here</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>Images or PDF accepted</span>
                    </div>
                  )}
                </div>
                {errors.proofFile && <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{errors.proofFile}</p>}
              </div>

              <div>
                <label style={labelStyle}>Participant Remarks</label>
                <textarea 
                  name="remarks" 
                  value={joinFields.remarks} 
                  onChange={handleJoinChange}
                  rows="3"
                  placeholder="Notes on what you achieved or details about uploaded proof..."
                  style={{ ...inputStyle(false), resize: 'vertical' }}
                ></textarea>
              </div>
            </>
          )}

          {/* Action Buttons */}
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
                backgroundColor: '#ea580c', cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(234,88,12,0.2)'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#d97706'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ea580c'}
            >
              {mode === 'form' 
                ? (challenge ? 'Save Changes' : 'Create Challenge') 
                : 'Join Challenge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChallengeModal;
