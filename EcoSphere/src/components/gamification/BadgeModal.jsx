import React from 'react';
import { X, Award, Users } from 'lucide-react';

const BadgeModal = ({ isOpen, onClose, badge }) => {
  if (!isOpen || !badge) return null;

  const isUnlocked = badge.status === 'Unlocked';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div 
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      ></div>

      <div style={{
        backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '460px',
        padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0',
        zIndex: 10, margin: '0 16px', position: 'relative'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '12px', filter: isUnlocked ? 'none' : 'grayscale(100%)' }}>
            {badge.icon}
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: '0 0 6px 0' }}>
            {badge.name}
          </h3>
          <span style={{
            display: 'inline-block', padding: '4px 12px', fontSize: '12px', fontWeight: 700,
            borderRadius: '9999px', 
            backgroundColor: isUnlocked ? '#dcfce7' : '#f1f5f9', 
            color: isUnlocked ? '#15803d' : '#64748b', 
            border: `1px solid ${isUnlocked ? '#bbf7d0' : '#e2e8f0'}`
          }}>
            {badge.status}
          </span>
        </div>

        <div style={{ padding: '16px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Description</span>
            <p style={{ fontSize: '14px', color: '#475569', margin: 0, lineHeight: 1.5 }}>
              {badge.description}
            </p>
          </div>

          <div>
            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Unlock Criteria</span>
            <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: '#fff7ed', border: '1px solid #ffedd5', color: '#c2410c', fontSize: '13px', fontWeight: 600 }}>
              {badge.criteria}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>XP Value</span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#ea580c' }}>{badge.xpRequired} XP</span>
            </div>
            <div>
              <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Unlock Rule</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>{badge.unlockRule}</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
              <Users size={12} />
              <span>Earned By ({badge.earnedBy.length} employees)</span>
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {badge.earnedBy.length > 0 ? (
                badge.earnedBy.map((emp) => (
                  <span 
                    key={emp} 
                    style={{
                      fontSize: '12px', fontWeight: 600, color: '#475569',
                      backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '6px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    {emp}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic' }}>No employees have earned this badge yet.</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px', fontSize: '14px', fontWeight: 600,
              backgroundColor: '#f1f5f9', color: '#475569', border: 'none',
              borderRadius: '12px', cursor: 'pointer', transition: 'background-color 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e2e8f0'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BadgeModal;
