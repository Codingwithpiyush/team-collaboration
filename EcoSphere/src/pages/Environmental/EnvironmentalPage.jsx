import React from 'react';
import { ChevronRight, Target, Flame, Award, Activity } from 'lucide-react';
import GoalTable from '../../components/environmental/GoalTable';
import EmissionFactors from '../../components/environmental/EmissionFactors';
import ProductProfiles from '../../components/environmental/ProductProfiles';
import CarbonTransactions from '../../components/environmental/CarbonTransactions';

const EnvironmentalPage = ({
  activeTab, setActiveTab,
  goals, setGoals,
  emissionFactors, setEmissionFactors,
  productProfiles, setProductProfiles,
  carbonTransactions, setCarbonTransactions
}) => {

  const tabs = [
    { name: 'Environmental Goals', icon: Target },
    { name: 'Emission Factors', icon: Flame },
    { name: 'Product ESG Profiles', icon: Award },
    { name: 'Carbon Transactions', icon: Activity }
  ];

  const descriptions = {
    'Environmental Goals': 'Manage your corporate carbon offset targets, track completion progress, and audit milestones.',
    'Emission Factors': 'Maintain a registry of GHG Protocol compliant emissions factors used for calculation.',
    'Product ESG Profiles': 'Review lifecycle assessment, recyclability status, and regulatory compliance ratings for products.',
    'Carbon Transactions': 'Audit activity logs and calculated greenhouse gas emissions across all corporate operations.'
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'Environmental Goals': return <GoalTable goals={goals} setGoals={setGoals} />;
      case 'Emission Factors': return <EmissionFactors emissionFactors={emissionFactors} setEmissionFactors={setEmissionFactors} />;
      case 'Product ESG Profiles': return <ProductProfiles productProfiles={productProfiles} setProductProfiles={setProductProfiles} />;
      case 'Carbon Transactions': return <CarbonTransactions carbonTransactions={carbonTransactions} setCarbonTransactions={setCarbonTransactions} emissionFactors={emissionFactors} />;
      default: return <GoalTable goals={goals} setGoals={setGoals} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Breadcrumb */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '8px',
        fontSize: '14px', fontWeight: 500, color: '#64748b',
        backgroundColor: '#fff', padding: '10px 16px', borderRadius: '12px',
        border: '1px solid #f1f5f9', boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        width: 'fit-content'
      }}>
        <span style={{ color: '#94a3b8' }}>Environmental</span>
        <ChevronRight size={14} style={{ color: '#cbd5e1' }} />
        <span style={{ color: '#1e293b', fontWeight: 600 }}>{activeTab}</span>
      </div>

      {/* Page Title */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>{activeTab}</h2>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>{descriptions[activeTab]}</p>
      </div>

      {/* Tabs */}
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
                  borderBottom: isActive ? '2px solid #059669' : '2px solid transparent',
                  fontSize: '14px', fontWeight: 600,
                  color: isActive ? '#059669' : '#64748b',
                  backgroundColor: 'transparent', border: 'none',
                  borderBottomStyle: 'solid', borderBottomWidth: '2px',
                  borderBottomColor: isActive ? '#059669' : 'transparent',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = '#334155'; e.currentTarget.style.borderBottomColor = '#cbd5e1'; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderBottomColor = 'transparent'; } }}
              >
                <TabIcon size={16} style={{ color: isActive ? '#059669' : '#94a3b8' }} />
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
    </div>
  );
};

export default EnvironmentalPage;
