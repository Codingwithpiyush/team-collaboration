import React from 'react';
import { Flame, Inbox } from 'lucide-react';

const RewardCard = ({ reward, onRedeemClick }) => {
  const isOutOfStock = reward.stock <= 0;

  return (
    <div 
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.2s, box-shadow 0.2s',
        opacity: isOutOfStock ? 0.6 : 1
      }}
      onMouseEnter={e => {
        if (!isOutOfStock) {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
      }}
    >
      <div>
        {/* Reward Image / Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          backgroundColor: '#fff7ed',
          color: '#ea580c',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          marginBottom: '16px',
          border: '1px solid #ffedd5'
        }}>
          {reward.icon}
        </div>

        <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: '0 0 6px 0' }}>
          {reward.name}
        </h4>
        <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.5, minHeight: '36px' }}>
          {reward.description}
        </p>
      </div>

      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: 700, color: '#ea580c' }}>
            <Flame size={16} />
            <span>{reward.requiredXp} XP</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: isOutOfStock ? '#dc2626' : '#64748b' }}>
            <Inbox size={12} />
            <span>{isOutOfStock ? 'Out of stock' : `${reward.stock} left`}</span>
          </div>
        </div>

        <button
          onClick={() => onRedeemClick(reward)}
          disabled={isOutOfStock}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: isOutOfStock ? '#cbd5e1' : '#ea580c',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 700,
            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.15s',
            boxShadow: isOutOfStock ? 'none' : '0 2px 4px rgba(234,88,12,0.15)'
          }}
          onMouseEnter={e => { if(!isOutOfStock) e.currentTarget.style.backgroundColor = '#d97706'; }}
          onMouseLeave={e => { if(!isOutOfStock) e.currentTarget.style.backgroundColor = '#ea580c'; }}
        >
          {isOutOfStock ? 'Out of Stock' : 'Redeem Reward'}
        </button>
      </div>
    </div>
  );
};

export default RewardCard;
