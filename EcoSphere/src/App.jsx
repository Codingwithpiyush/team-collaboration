import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import SocialPage from './pages/SocialPage';
import EnvironmentalPage from './pages/Environmental/EnvironmentalPage';
import { 
  initialGoals, 
  initialEmissionFactors, 
  initialProductProfiles, 
  initialCarbonTransactions 
} from './data/environmentalData';

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('Environmental Goals');
  const [goals, setGoals] = useState(initialGoals);
  const [emissionFactors, setEmissionFactors] = useState(initialEmissionFactors);
  const [productProfiles, setProductProfiles] = useState(initialProductProfiles);
  const [carbonTransactions, setCarbonTransactions] = useState(initialCarbonTransactions);

  // Compute dynamic score
  const totalProgress = goals.reduce((acc, goal) => {
    const target = parseFloat(goal.targetCo2);
    const current = parseFloat(goal.currentCo2);
    const progress = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
    return acc + progress;
  }, 0);
  const environmentalScore = goals.length > 0 ? Math.round(totalProgress / goals.length) : 0;

  let activePage = 'Dashboard';
  if (location.pathname === '/environmental') activePage = 'Environmental';
  if (location.pathname === '/social') activePage = 'Social';

  const handleSetActivePage = (page) => {
    if (page === 'Dashboard') navigate('/dashboard');
    else if (page === 'Environmental') navigate('/environmental');
    else if (page === 'Social') navigate('/social');
  };

  return (
    <Layout 
      activePage={activePage}
      setActivePage={handleSetActivePage}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard environmentalScore={environmentalScore} />} />
        <Route path="/social" element={<SocialPage activeTab={activeTab} setActiveTab={setActiveTab} />} />
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
      </Routes>
    </Layout>
  );
}

export default App;
