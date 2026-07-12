import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SocialPage from './pages/SocialPage';
import EnvironmentalPage from './pages/Environmental/EnvironmentalPage';
<<<<<<< HEAD
import ReportsPage from './pages/ReportsPage';
=======
import GovernancePage from './pages/Governance/GovernancePage';
import GamificationPage from './pages/Gamification/GamificationPage';

>>>>>>> fe47715afc776b80cf47a0ed379cf3164b4c3a28
import { 
  initialGoals, 
  initialEmissionFactors, 
  initialProductProfiles, 
  initialCarbonTransactions 
} from './data/environmentalData';

import { initialAudits } from './data/audits';
import { initialComplianceIssues } from './data/compliance';
import { initialPolicies } from './data/policies';
import { initialAcknowledgements } from './data/acknowledgements';

import { initialChallenges } from './data/challenges';
import { initialParticipation } from './data/challengeParticipation';
import { initialBadges } from './data/badges';
import { initialRewards } from './data/rewards';
import { initialLeaderboard } from './data/leaderboard';

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Environmental state
  const [goals, setGoals] = useState(initialGoals);
  const [emissionFactors, setEmissionFactors] = useState(initialEmissionFactors);
  const [productProfiles, setProductProfiles] = useState(initialProductProfiles);
  const [carbonTransactions, setCarbonTransactions] = useState(initialCarbonTransactions);

  // Governance state
  const [audits, setAudits] = useState(initialAudits);
  const [complianceIssues, setComplianceIssues] = useState(initialComplianceIssues);
  const [policies, setPolicies] = useState(initialPolicies);
  const [acknowledgements, setAcknowledgements] = useState(initialAcknowledgements);

  // Gamification state
  const [challenges, setChallenges] = useState(initialChallenges);
  const [participation, setParticipation] = useState(initialParticipation);
  const [badges, setBadges] = useState(initialBadges);
  const [rewards, setRewards] = useState(initialRewards);
  const [leaderboard, setLeaderboard] = useState(initialLeaderboard);

  // Tab navigation state
  const [activeTab, setActiveTab] = useState('Environmental Goals');

  // Notifications state
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Vendor Compliance Check scheduled for next week', time: '1 hour ago', unread: true },
    { id: 2, text: 'Safety Policy updated to Version 4.0', time: '3 hours ago', unread: false }
  ]);

  const addNotification = (text) => {
    setNotifications(prev => [
      { id: Date.now(), text, time: 'Just now', unread: true },
      ...prev
    ]);
  };

  // Compute Environmental score
  const totalProgress = goals.reduce((acc, goal) => {
    const target = parseFloat(goal.targetCo2);
    const current = parseFloat(goal.currentCo2);
    const progress = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
    return acc + progress;
  }, 0);
  const environmentalScore = goals.length > 0 ? Math.round(totalProgress / goals.length) : 0;

  // Compute Governance score:
  const todayStr = '2026-07-12';
  const calculatedIssues = complianceIssues.map(issue => {
    if (issue.status === 'Open' && issue.dueDate < todayStr) {
      return { ...issue, status: 'Overdue' };
    }
    return issue;
  });

  const completedAudits = audits.filter(a => a.status === 'Completed').length;
  const auditPercent = audits.length > 0 ? (completedAudits / audits.length) * 100 : 0;

  const resolvedIssues = calculatedIssues.filter(i => i.status === 'Resolved').length;
  const issuePercent = calculatedIssues.length > 0 ? (resolvedIssues / calculatedIssues.length) * 100 : 0;

  const completedAcks = acknowledgements.filter(ack => ack.status === 'Completed').length;
  const ackPercent = acknowledgements.length > 0 ? (completedAcks / acknowledgements.length) * 100 : 0;

  const governanceScore = Math.round(auditPercent * 0.4 + issuePercent * 0.4 + ackPercent * 0.2);

  // Compute Gamification score:
  // Milestones target is 15000 cumulative XP
  const totalApprovedXP = leaderboard.reduce((acc, l) => acc + (l.type === 'Employee' ? l.xp : 0), 0);
  const gamificationScore = Math.min(Math.round((totalApprovedXP / 15000) * 100), 100);

  // Active page logic
  let activePage = 'Dashboard';
  if (location.pathname === '/environmental') activePage = 'Environmental';
  if (location.pathname === '/social') activePage = 'Social';
<<<<<<< HEAD
  if (location.pathname === '/reports') activePage = 'Reports';
=======
  if (location.pathname === '/governance') activePage = 'Governance';
  if (location.pathname === '/gamification') activePage = 'Gamification';
>>>>>>> fe47715afc776b80cf47a0ed379cf3164b4c3a28

  const handleSetActivePage = (page) => {
    if (page === 'Dashboard') navigate('/dashboard');
    else if (page === 'Environmental') navigate('/environmental');
    else if (page === 'Social') navigate('/social');
<<<<<<< HEAD
    else if (page === 'Reports') navigate('/reports');
=======
    else if (page === 'Governance') navigate('/governance');
    else if (page === 'Gamification') navigate('/gamification');
  };

  // Gamification Approval/Redeem Logic
  const handleApproveParticipation = (partId) => {
    const part = participation.find(p => p.id === partId);
    if (!part) return;

    // 1. Update participation status
    setParticipation(prev => prev.map(p => p.id === partId ? { ...p, status: 'Approved' } : p));

    // 2. Award XP in leaderboard
    setLeaderboard(prev => {
      const exists = prev.some(l => l.name === part.employee && l.type === 'Employee');
      let updatedList = [];
      if (exists) {
        updatedList = prev.map(l => (l.name === part.employee && l.type === 'Employee') ? { ...l, xp: l.xp + part.xp } : l);
      } else {
        updatedList = [...prev, { id: 'L-' + Date.now(), rank: prev.length + 1, name: part.employee, type: 'Employee', xp: part.xp, department: 'Manufacturing' }];
      }
      
      // Re-sort & Re-rank
      const sorted = [...updatedList].sort((a, b) => b.xp - a.xp);
      return sorted.map((item, idx) => ({ ...item, rank: idx + 1 }));
    });

    // 3. Check and unlock badges
    setBadges(prevBadges => {
      const empLeaderboardEntry = leaderboard.find(l => l.name === part.employee && l.type === 'Employee');
      const currentEmpXp = empLeaderboardEntry ? empLeaderboardEntry.xp + part.xp : part.xp;
      
      return prevBadges.map(badge => {
        const alreadyEarned = badge.earnedBy.includes(part.employee);
        let shouldUnlock = false;

        if (!alreadyEarned) {
          // Rule checks
          if (badge.name === 'Green Beginner') {
            shouldUnlock = true; // Joined their first challenge (just approved)
          } else if (badge.name === 'Carbon Saver' && (part.challenge === 'Sustainability Sprint' || part.challenge === 'Recycle Challenge')) {
            shouldUnlock = true;
          } else if (badge.name === 'Sustainability Champion' && currentEmpXp >= 300) {
            shouldUnlock = true;
          } else if (badge.name === 'ESG Hero' && currentEmpXp >= 1000) {
            shouldUnlock = true;
          }
        }

        if (shouldUnlock) {
          addNotification(`Badge Unlocked: ${part.employee} earned the "${badge.icon} ${badge.name}" badge!`);
          return {
            ...badge,
            status: 'Unlocked',
            earnedBy: [...badge.earnedBy, part.employee]
          };
        }
        return badge;
      });
    });

    addNotification(`Challenge Approved: ${part.employee} was awarded ${part.xp} XP for "${part.challenge}"`);
  };

  const handleRejectParticipation = (partId) => {
    const part = participation.find(p => p.id === partId);
    if (!part) return;

    setParticipation(prev => prev.map(p => p.id === partId ? { ...p, status: 'Rejected' } : p));
    addNotification(`Challenge Rejected: ${part.employee}'s submission for "${part.challenge}" was rejected`);
  };

  const handleRedeemReward = (employeeName, rewardId) => {
    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return { success: false, error: 'Reward not found' };

    const employee = leaderboard.find(l => l.name === employeeName && l.type === 'Employee');
    if (!employee) return { success: false, error: 'Employee profile not registered in leaderboard' };

    if (employee.xp < reward.requiredXp) {
      return { success: false, error: `Insufficient XP. Requires ${reward.requiredXp} XP, but you only have ${employee.xp} XP.` };
    }

    if (reward.stock <= 0) {
      return { success: false, error: 'Reward out of stock' };
    }

    // Deduct XP in leaderboard
    setLeaderboard(prev => {
      const updated = prev.map(l => (l.name === employeeName && l.type === 'Employee') ? { ...l, xp: l.xp - reward.requiredXp } : l);
      const sorted = [...updated].sort((a, b) => b.xp - a.xp);
      return sorted.map((item, idx) => ({ ...item, rank: idx + 1 }));
    });

    // Decrement reward stock
    setRewards(prev => prev.map(r => r.id === rewardId ? { ...r, stock: r.stock - 1 } : r));

    addNotification(`Reward Redeemed: ${employeeName} redeemed "${reward.icon} ${reward.name}" for ${reward.requiredXp} XP`);
    return { success: true };
>>>>>>> fe47715afc776b80cf47a0ed379cf3164b4c3a28
  };

  return (
    <Layout 
      activePage={activePage}
      setActivePage={handleSetActivePage}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      notifications={notifications}
      setNotifications={setNotifications}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={
          <Dashboard 
            environmentalScore={environmentalScore} 
            governanceScore={governanceScore}
            gamificationScore={gamificationScore}
          />
        } />
        <Route path="/social" element={<SocialPage activeTab={activeTab} setActiveTab={setActiveTab} />} />
        <Route path="/reports" element={<ReportsPage activeTab={activeTab} />} />
        <Route path="/environmental" element={
          <EnvironmentalPage 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            goals={goals}
            setGoals={setGoals}
            emissionFactors={emissionFactors}
            setEmissionFactors={setEmissionFactors}
            productProfiles={productProfiles}
            setProductProfiles={setProductProfiles}
            carbonTransactions={carbonTransactions}
            setCarbonTransactions={setCarbonTransactions}
          />
        } />
        <Route path="/governance" element={
          <GovernancePage 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            audits={audits}
            setAudits={setAudits}
            complianceIssues={calculatedIssues}
            setComplianceIssues={setComplianceIssues}
            policies={policies}
            setPolicies={setPolicies}
            acknowledgements={acknowledgements}
            setAcknowledgements={setAcknowledgements}
            addNotification={addNotification}
          />
        } />
        <Route path="/gamification" element={
          <GamificationPage 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            challenges={challenges}
            setChallenges={setChallenges}
            participation={participation}
            setParticipation={setParticipation}
            badges={badges}
            setBadges={setBadges}
            rewards={rewards}
            setRewards={setRewards}
            leaderboard={leaderboard}
            setLeaderboard={setLeaderboard}
            onApprove={handleApproveParticipation}
            onReject={handleRejectParticipation}
            onRedeem={handleRedeemReward}
            addNotification={addNotification}
          />
        } />
      </Routes>
    </Layout>
  );
}

export default App;
