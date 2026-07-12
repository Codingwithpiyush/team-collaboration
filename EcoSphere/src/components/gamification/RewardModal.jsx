import React, { useState, useEffect } from 'react';
import { X, Flame, AlertCircle, CheckCircle2 } from 'lucide-react';

const RewardModal = ({ isOpen, onClose, reward, leaderboard, onConfirm }) => {
  const [selectedEmployee, setSelectedEmployee] = useState('Rahul');
  const [employeeXp, setEmployeeXp] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedEmployee('Rahul');
      setErrorMsg('');
      setIsSuccess(false);
    }
  }, [isOpen]);

  // Fetch points whenever employee selection changes
  useEffect(() => {
    if (isOpen && selectedEmployee) {
      const emp = leaderboard.find(l => l.name === selectedEmployee && l.type === 'Employee');
      setEmployeeXp(emp ? emp.xp : 0);
      setErrorMsg('');
    }
  }, [selectedEmployee, leaderboard, isOpen]);

  if (!isOpen || !reward) return null;

  const hasEnoughXp = employeeXp >= reward.requiredXp;

  const handleRedeem = (e) => {
    e.preventDefault();
    if (!hasEnoughXp) {
      setErrorMsg(`Not Enough XP. Employee has ${employeeXp} XP, but reward requires ${reward.requiredXp} XP.`);
      return;
    }

    const res = onConfirm(selectedEmployee, reward.id);
    if (res && !res.success) {
      setErrorMsg(res.error);
    } else {
      setIsSuccess(true);
    }
  };

  const employees = ['Rahul', 'Sneha', 'Aditi Rao', 'Priya', 'Amit', 'Vikram', 'Maya'];
  const labelStyle = { display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '6px' };
  const inputStyle = {
    width: '100%', padding: '10px 16px', borderRadius: '12px',
    border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box'
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div 
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      ></div>

      <div style={{
        backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '440px',
        padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0',
        zIndex: 10, margin: '0 16px', position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
        >
          <X size={20} />
        </button>

        {!isSuccess ? (
          <>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '16px', marginTop: 0 }}>
              Redeem Reward
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <div style={{ fontSize: '36px' }}>{reward.icon}</div>
              <div>
                <span style={{ fontWeight: 700, color: '#1e293b', display: 'block', fontSize: '15px' }}>{reward.name}</span>
                <span style={{ fontSize: '13px', color: '#ea580c', fontWeight: 600 }}>Cost: {reward.requiredXp} XP</span>
              </div>
            </div>

            <form onSubmit={handleRedeem} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Select Employee Profile</label>
                <select 
                  value={selectedEmployee} 
                  onChange={e => setSelectedEmployee(e.target.value)}
                  style={inputStyle}
                >
                  {employees.map(emp => <option key={emp} value={emp}>{emp}</option>)}
                </select>
              </div>

              {/* XP Check display */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', padding: '4px 0' }}>
                <span style={{ color: '#64748b', fontWeight: 500 }}>Employee Current XP:</span>
                <span style={{ fontWeight: 700, color: hasEnoughXp ? '#10b981' : '#dc2626' }}>
                  {employeeXp} XP
                </span>
              </div>

              {errorMsg && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '12px', borderRadius: '12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '13px', fontWeight: 600 }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', marginTop: '8px' }}>
                <button 
                  type="button" 
                  onClick={onClose}
                  style={{ padding: '10px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 600, color: '#475569', backgroundColor: '#fff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{
                    padding: '10px 18px', borderRadius: '12px', border: 'none',
                    fontSize: '14px', fontWeight: 600, color: '#ffffff',
                    backgroundColor: '#ea580c', cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(234,88,12,0.2)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#d97706'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ea580c'}
                >
                  Confirm Redemption
                </button>
              </div>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#10b981', display: 'inline-flex', alignItems: 'center', justifycontent: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: '0 0 8px 0' }}>
              Redemption Successful!
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 24px 0', lineHeight: 1.5 }}>
              Voucher code has been generated and dispatched to <strong>{selectedEmployee}</strong>'s registered email address.
            </p>
            <button
              onClick={onClose}
              style={{
                width: '100%', padding: '10px', borderRadius: '12px', border: 'none',
                backgroundColor: '#f1f5f9', color: '#475569', fontSize: '14px', fontWeight: 600,
                cursor: 'pointer'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e2e8f0'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardModal;
