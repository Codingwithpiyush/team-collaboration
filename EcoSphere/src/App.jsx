import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import EnvironmentalPage from './pages/Environmental/EnvironmentalPage';
import { 
  initialGoals, 
  initialEmissionFactors, 
  initialProductProfiles, 
  initialCarbonTransactions 
} from './data/environmentalData';

function App() {
  const [activePage, setActivePage] = useState('Dashboard');
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

  return (
    <Layout 
      activePage={activePage} 
      setActivePage={setActivePage} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      {activePage === 'Dashboard' ? (
        <Dashboard environmentalScore={environmentalScore} />
      ) : (
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
      )}
    </Layout>
  );
}

export default App;
