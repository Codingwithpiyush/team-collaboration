import React, { useState } from 'react';
import BadgeModal from './BadgeModal';

const BadgeGallery = ({ badges }) => {
  const [selectedBadge, setSelectedBadge] = useState(null);

  const getStatusBadge = (status) => {
    if (status === 'Unlocked') return (
      <span style={{
        display: 'inline-block', padding: '3px 8px', fontSize: '11px', fontWeight: 700,
        borderRadius: '6px', backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0'
      }}>
        Unlocked
      </span>
    );
    return (
      <span style={{
        display: 'inline-block', padding: '3px 8px', fontSize: '11px', fontWeight: 700,
        borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#64748b', border: '1px solid #e2e8f0'
      }}>
        Locked
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
        {badges.map((badge) => {
          const isUnlocked = badge.status === 'Unlocked';
          return (
            <div
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: isUnlocked ? '1px solid #fed7aa' : '1px solid #e2e8f0', // Orange tint border for unlocked
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                opacity: isUnlocked ? 1 : 0.65,
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = isUnlocked 
                  ? '0 8px 20px rgba(234,88,12,0.08)' 
                  : '0 8px 16px rgba(0,0,0,0.04)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
              }}
            >
              <div style={{ 
                fontSize: '48px', 
                marginBottom: '16px', 
                filter: isUnlocked ? 'none' : 'grayscale(100%)',
                transition: 'filter 0.2s'
              }}>
                {badge.icon}
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: isUnlocked ? '#1e293b' : '#64748b', margin: '0 0 6px 0' }}>
                {badge.name}
              </h4>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.5, minHeight: '36px' }}>
                {badge.description}
              </p>
              
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#ea580c' }}>
                  Rule: {badge.unlockRule}
                </span>
                {getStatusBadge(badge.status)}
              </div>
            </div>
          );
        })}
      </div>

      <BadgeModal 
        isOpen={!!selectedBadge}
        onClose={() => setSelectedBadge(null)}
        badge={selectedBadge}
      />
    </div>
  );
};

export default BadgeGallery;
