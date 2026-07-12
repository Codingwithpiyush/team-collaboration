import React, { useState, useMemo } from 'react';
import { ChevronRight, Gamepad2, AlertTriangle, FileText, Gift, Award, HelpCircle } from 'lucide-react';
import ChallengeCard from '../../components/gamification/ChallengeCard';
import ChallengeModal from '../../components/gamification/ChallengeModal';
import ParticipationTable from '../../components/gamification/ParticipationTable';
import BadgeGallery from '../../components/gamification/BadgeGallery';
import RewardCard from '../../components/gamification/RewardCard';
import RewardModal from '../../components/gamification/RewardModal';
import Leaderboard from '../../components/gamification/Leaderboard';

const GamificationPage = ({
  activeTab, setActiveTab,
  challenges, setChallenges,
  participation, setParticipation,
  badges, setBadges,
  rewards, setRewards,
  leaderboard, setLeaderboard,
  onApprove, onReject,
  onRedeem, addNotification
}) => {

  const tabs = [
    { name: 'Challenges', icon: Gamepad2 },
    { name: 'Challenge Participation', icon: FileText },
    { name: 'Badges', icon: Award },
    { name: 'Rewards', icon: Gift },
    { name: 'Leaderboard', icon: Award }
  ];

  const descriptions = {
    'Challenges': 'Join active sustainability sprints, complete objectives to earn XP, and contribute to ESG targets.',
    'Challenge Participation': 'Track employee sign-ups, review evidence proof files, and approve reward points.',
    'Badges': 'Unlock achievements for outstanding sustainability engagement and showcase milestones.',
    'Rewards': 'Redeem accumulated XP points for vouchers, coupons, gift cards, or merchandise.',
    'Leaderboard': 'Compare departments and employee ESG points standings in the corporate leaderboards.'
  };

  // Challenges search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All'); // Status chip filter
  
  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('form'); // form (new/edit), join
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [deletingChallenge, setDeletingChallenge] = useState(null);
  const [viewingChallenge, setViewingChallenge] = useState(null);

  // Rewards states
  const [selectedReward, setSelectedReward] = useState(null);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg) => { setToastMessage(msg); setTimeout(() => setToastMessage(''), 3000); };

  // 1. Challenges Filtering
  const filteredChallenges = useMemo(() => {
    return challenges.filter(c => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = c.title.toLowerCase().includes(term) || c.description.toLowerCase().includes(term);
      const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'All' || c.difficulty === selectedDifficulty;
      const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
    });
  }, [challenges, searchTerm, selectedCategory, selectedDifficulty, selectedStatus]);

  // Categories list
  const categories = ['All', 'Carbon footprint', 'Waste Management', 'Energy Conservation', 'Product ESG', 'CSR Activity'];
  const difficulties = ['All', 'Easy', 'Medium', 'Hard'];
  const statuses = ['All', 'Draft', 'Active', 'Under Review', 'Completed', 'Archived'];

  // Challenge CRUD Actions
  const handleOpenCreate = () => {
    setSelectedChallenge(null);
    setModalMode('form');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (challenge) => {
    setSelectedChallenge(challenge);
    setModalMode('form');
    setIsFormModalOpen(true);
  };

  const handleOpenJoin = (challenge) => {
    setSelectedChallenge(challenge);
    setModalMode('join');
    setIsFormModalOpen(true);
  };

  const handleDuplicate = (challenge) => {
    const dup = {
      ...challenge,
      id: 'CH-' + Date.now(),
      title: `${challenge.title} (Copy)`,
      status: 'Draft',
      participantsCount: 0
    };
    setChallenges(prev => [...prev, dup]);
    showToast(`Duplicated "${challenge.title}" into draft.`);
  };

  const handleDeleteConfirm = () => {
    if (!deletingChallenge) return;
    setChallenges(prev => prev.filter(c => c.id !== deletingChallenge.id));
    showToast(`Deleted challenge "${deletingChallenge.title}"`);
    setDeletingChallenge(null);
  };

  const handleSaveChallenge = (challengeData) => {
    if (selectedChallenge) {
      setChallenges(prev => prev.map(c => c.id === challengeData.id ? challengeData : c));
      showToast(`Updated challenge "${challengeData.title}"`);
    } else {
      setChallenges(prev => [challengeData, ...prev]);
      showToast(`Created new challenge "${challengeData.title}"`);
      addNotification(`New challenge created: "${challengeData.title}" worth ${challengeData.xpReward} XP.`);
    }
    setIsFormModalOpen(false);
  };

  const handleJoinChallengeSubmit = (joinData) => {
    // 1. Create participation entry
    const newPart = {
      id: 'PART-' + Date.now(),
      employee: joinData.employee,
      challenge: joinData.challenge,
      progress: 100, // evidence is uploaded so it is marked fully complete for audit review
      proof: joinData.proof,
      xp: joinData.xp,
      status: 'Pending',
      remarks: joinData.remarks
    };

    setParticipation(prev => [newPart, ...prev]);

    // 2. Increment challenge participant count
    setChallenges(prev => prev.map(c => c.id === joinData.challengeId ? { ...c, participantsCount: c.participantsCount + 1 } : c));

    showToast(`Successfully registered "${joinData.employee}" to join challenge.`);
    addNotification(`Challenge joined: ${joinData.employee} submitted proof for "${joinData.challenge}".`);
    setIsFormModalOpen(false);
  };

  // Reward Redemption confirm
  const handleOpenRedeem = (reward) => {
    setSelectedReward(reward);
    setIsRewardModalOpen(true);
  };

  const handleRedeemConfirm = (employee, rewardId) => {
    const res = onRedeem(employee, rewardId);
    if (res && res.success) {
      setIsRewardModalOpen(false);
    }
    return res;
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'Challenges':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Toolbar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
              <button
                onClick={handleOpenCreate}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px',
                  backgroundColor: '#ea580c', color: '#ffffff', fontSize: '14px', fontWeight: 600, border: 'none',
                  cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(234,88,12,0.2)', transition: 'background-color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#d97706'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ea580c'}
              >
                <span>+ New Challenge</span>
              </button>

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                {/* Category Select */}
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 600, color: '#475569', outline: 'none' }}
                >
                  <option value="All">All Categories</option>
                  {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                {/* Difficulty Select */}
                <select
                  value={selectedDifficulty}
                  onChange={e => setSelectedDifficulty(e.target.value)}
                  style={{ padding: '8px 12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 600, color: '#475569', outline: 'none' }}
                >
                  <option value="All">All Difficulties</option>
                  {difficulties.slice(1).map(d => <option key={d} value={d}>{d}</option>)}
                </select>

                {/* Search Challenge */}
                <input
                  type="text"
                  placeholder="Search Challenges..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ padding: '9px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', outline: 'none', width: '200px' }}
                />
              </div>
            </div>

            {/* Horizontal Status Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              {statuses.map(s => {
                const isSelected = selectedStatus === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSelectedStatus(s)}
                    style={{
                      padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 700,
                      backgroundColor: isSelected ? '#ea580c' : '#f1f5f9',
                      color: isSelected ? '#ffffff' : '#475569',
                      transition: 'all 0.15s'
                    }}
                  >
                    {s === 'All' ? 'All Statuses' : s}
                  </button>
                );
              })}
            </div>

            {/* Challenge Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '24px' }}>
              {filteredChallenges.length > 0 ? (
                filteredChallenges.map(c => (
                  <ChallengeCard 
                    key={c.id} 
                    challenge={c} 
                    onJoin={handleOpenJoin}
                    onView={setViewingChallenge}
                    onEdit={handleOpenEdit}
                    onDelete={setDeletingChallenge}
                    onDuplicate={handleDuplicate}
                  />
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                  <p style={{ fontWeight: 600, color: '#475569', marginBottom: '4px' }}>No challenges match the filters</p>
                  <p style={{ fontSize: '12px' }}>Try relaxing search query or status criteria.</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'Challenge Participation':
        return (
          <ParticipationTable 
            participation={participation} 
            onApprove={onApprove} 
            onReject={onReject} 
          />
        );
      case 'Badges':
        return <BadgeGallery badges={badges} />;
      case 'Rewards':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {rewards.map(reward => (
                <RewardCard 
                  key={reward.id} 
                  reward={reward} 
                  onRedeemClick={handleOpenRedeem}
                />
              ))}
            </div>
          </div>
        );
      case 'Leaderboard':
        return <Leaderboard leaderboard={leaderboard} />;
      default:
        return <Leaderboard leaderboard={leaderboard} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast message */}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: '16px', right: '16px', zIndex: 50,
          backgroundColor: '#0f172a', color: '#fff', padding: '12px 20px',
          borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: 500
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f97316', display: 'inline-block' }}></span>
          {toastMessage}
        </div>
      )}

      {/* Breadcrumb */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        fontSize: '14px', fontWeight: 500, color: '#64748b',
        backgroundColor: '#fff', padding: '10px 16px', borderRadius: '12px',
        border: '1px solid #f1f5f9', boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        width: 'fit-content'
      }}>
        <span style={{ color: '#94a3b8' }}>Gamification</span>
        <ChevronRight size={14} style={{ color: '#cbd5e1' }} />
        <span style={{ color: '#1e293b', fontWeight: 600 }}>{activeTab}</span>
      </div>

      {/* Page Title */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>{activeTab}</h2>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>{descriptions[activeTab]}</p>
      </div>

      {/* Tab Menu Header */}
      <div style={{ borderBottom: '2px solid #e2e8f0' }}>
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '-2px' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.name;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 20px',
                  borderBottom: isActive ? '2px solid #ea580c' : '2px solid transparent',
                  fontSize: '14px', fontWeight: 600,
                  color: isActive ? '#ea580c' : '#64748b',
                  backgroundColor: 'transparent', border: 'none',
                  borderBottomStyle: 'solid', borderBottomWidth: '2px',
                  borderBottomColor: isActive ? '#ea580c' : 'transparent',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = '#334155'; e.currentTarget.style.borderBottomColor = '#cbd5e1'; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderBottomColor = 'transparent'; } }}
              >
                <TabIcon size={16} style={{ color: isActive ? '#ea580c' : '#94a3b8' }} />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {renderActiveTabContent()}
      </div>

      {/* Challenge creation/edit/join Modal */}
      <ChallengeModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveChallenge}
        challenge={selectedChallenge}
        mode={modalMode}
        onJoinSubmit={handleJoinChallengeSubmit}
      />

      {/* Reward Confirmation Modal */}
      <RewardModal 
        isOpen={isRewardModalOpen}
        onClose={() => setIsRewardModalOpen(false)}
        reward={selectedReward}
        leaderboard={leaderboard}
        onConfirm={handleRedeemConfirm}
      />

      {/* View Challenge Details Modal */}
      {viewingChallenge && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setViewingChallenge(null)}></div>
          <div style={{
            backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '500px',
            padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0',
            zIndex: 10, margin: '0 16px', position: 'relative'
          }}>
            <button
              onClick={() => setViewingChallenge(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '40px' }}>{viewingChallenge.icon}</div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{viewingChallenge.title}</h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, margin: 0 }}>ID: {viewingChallenge.id}</p>
              </div>
            </div>

            <div style={{ padding: '12px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Category</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>{viewingChallenge.category}</span>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Difficulty</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>{viewingChallenge.difficulty}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>XP Reward</span>
                  <span style={{ fontSize: '15px', fontWeight: 800, color: '#ea580c' }}>{viewingChallenge.xpReward} XP</span>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Status</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>{viewingChallenge.status}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Active Period</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>{viewingChallenge.startDate} to {viewingChallenge.endDate}</span>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Signed Participants</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>{viewingChallenge.participantsCount || 0} employees</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Evidence Required</span>
                <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: '#fff7ed', border: '1px solid #ffedd5', color: '#c2410c', fontSize: '13px', fontWeight: 600 }}>
                  {viewingChallenge.evidenceRequired}
                </div>
              </div>

              {viewingChallenge.description && (
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Description / Guidelines</span>
                  <p style={{
                    fontSize: '14px', color: '#475569', backgroundColor: '#f8fafc',
                    padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9',
                    lineHeight: 1.6, margin: 0, maxHeight: '160px', overflowY: 'auto'
                  }}>
                    {viewingChallenge.description}
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '16px' }}>
              {viewingChallenge.status === 'Active' && (
                <button
                  onClick={() => { handleOpenJoin(viewingChallenge); setViewingChallenge(null); }}
                  style={{
                    padding: '8px 16px', fontSize: '14px', fontWeight: 600,
                    backgroundColor: '#ea580c', color: '#ffffff', border: 'none',
                    borderRadius: '12px', cursor: 'pointer', transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#d97706'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ea580c'}
                >
                  Join Challenge
                </button>
              )}
              <button
                onClick={() => setViewingChallenge(null)}
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
      )}

      {/* Delete Confirmation */}
      {deletingChallenge && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setDeletingChallenge(null)}></div>
          <div style={{
            backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '440px',
            padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0',
            zIndex: 10, margin: '0 16px', position: 'relative'
          }}>
            <button
              onClick={() => setDeletingChallenge(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', flexShrink: 0 }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>Delete Challenge</h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                  Are you sure you want to delete the challenge <strong style={{ color: '#334155', fontWeight: 600 }}>{deletingChallenge.title}</strong>? This action cannot be undone.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', marginTop: '24px' }}>
              <button
                onClick={() => setDeletingChallenge(null)}
                style={{
                  padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0',
                  fontSize: '14px', fontWeight: 600, color: '#475569',
                  backgroundColor: '#ffffff', cursor: 'pointer', transition: 'background-color 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                style={{
                  padding: '10px 16px', borderRadius: '12px', border: 'none',
                  fontSize: '14px', fontWeight: 600, color: '#ffffff',
                  backgroundColor: '#ef4444', cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(239,68,68,0.3)', transition: 'background-color 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#dc2626'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ef4444'}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamificationPage;
