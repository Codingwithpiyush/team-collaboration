import React from 'react';
import { Award, Clock, Copy, Edit, Trash2, Eye, Flame, ShieldAlert, Award as AwardIcon } from 'lucide-react';

const ChallengeCard = ({ challenge, onJoin, onView, onEdit, onDelete, onDuplicate }) => {
  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy': return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' };
      case 'Medium': return { bg: '#ffedd5', text: '#c2410c', border: '#fed7aa' };
      case 'Hard': return { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' };
      default: return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Active': return { bg: '#ffedd5', text: '#ea580c', border: '#fed7aa' }; // Orange
      case 'Draft': return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' }; // Slate
      case 'Under Review': return { bg: '#f3e8ff', text: '#7c3aed', border: '#e9d5ff' }; // Purple
      case 'Completed': return { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' }; // Blue
      case 'Archived': return { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' }; // Red
      default: return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
    }
  };

  const diffStyle = getDifficultyColor(challenge.difficulty);
  const statusStyle = getStatusStyle(challenge.status);

  return (
    <div 
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '2px solid #fdba74', // Orange border
        padding: '20px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer'
      }}
      className="hover-card"
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(234, 88, 12, 0.1), 0 4px 6px -2px rgba(234, 88, 12, 0.05)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)';
      }}
    >
      {/* Top Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
          <div style={{ fontSize: '32px' }}>{challenge.icon || '🏆'}</div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{
              display: 'inline-block', padding: '3px 8px', fontSize: '11px', fontWeight: 700,
              borderRadius: '6px', backgroundColor: diffStyle.bg, color: diffStyle.text, border: `1px solid ${diffStyle.border}`
            }}>
              {challenge.difficulty}
            </span>
            <span style={{
              display: 'inline-block', padding: '3px 8px', fontSize: '11px', fontWeight: 700,
              borderRadius: '6px', backgroundColor: statusStyle.bg, color: statusStyle.text, border: `1px solid ${statusStyle.border}`
            }}>
              {challenge.status}
            </span>
          </div>
        </div>

        <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b', margin: '0 0 8px 0', lineHeight: 1.4 }}>
          {challenge.title}
        </h4>
        
        <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {challenge.description}
        </p>

        {/* XP Reward & Deadline */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#ea580c', fontWeight: 700 }}>
            <Flame size={16} />
            <span>{challenge.xpReward} XP Reward</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
            <Clock size={14} />
            <span>Ends {challenge.endDate}</span>
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        {/* Quick actions icons */}
        <div style={{ display: 'flex', gap: '2px' }}>
          <button 
            title="View Details"
            onClick={(e) => { e.stopPropagation(); onView(challenge); }}
            style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            <Eye size={15} />
          </button>
          <button 
            title="Edit"
            onClick={(e) => { e.stopPropagation(); onEdit(challenge); }}
            style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ffedd5'; e.currentTarget.style.color = '#ea580c'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            <Edit size={15} />
          </button>
          <button 
            title="Duplicate"
            onClick={(e) => { e.stopPropagation(); onDuplicate(challenge); }}
            style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f0fdf4'; e.currentTarget.style.color = '#15803d'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            <Copy size={15} />
          </button>
          <button 
            title="Delete"
            onClick={(e) => { e.stopPropagation(); onDelete(challenge); }}
            style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* Join button / info */}
        {challenge.status === 'Active' ? (
          <button 
            onClick={(e) => { e.stopPropagation(); onJoin(challenge); }}
            style={{
              padding: '8px 16px', borderRadius: '10px', border: 'none',
              backgroundColor: '#ea580c', color: '#ffffff', fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 2px 4px rgba(234,88,12,0.2)', transition: 'background-color 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#d97706'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ea580c'}
          >
            Join Challenge
          </button>
        ) : (
          <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
            {challenge.participantsCount || 0} participants
          </span>
        )}
      </div>
    </div>
  );
};

export default ChallengeCard;
