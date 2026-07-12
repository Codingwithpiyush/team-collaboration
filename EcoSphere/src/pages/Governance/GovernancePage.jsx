import React from 'react';
import { ChevronRight, Shield, AlertTriangle, FileText, Users } from 'lucide-react';
import AuditTable from '../../components/governance/AuditTable';
import ComplianceTable from '../../components/governance/ComplianceTable';
import PolicyTable from '../../components/governance/PolicyTable';
import AcknowledgementTable from '../../components/governance/AcknowledgementTable';

const GovernancePage = ({
  activeTab, setActiveTab,
  audits, setAudits,
  complianceIssues, setComplianceIssues,
  policies, setPolicies,
  acknowledgements, setAcknowledgements,
  addNotification
}) => {

  const tabs = [
    { name: 'Policies', icon: FileText },
    { name: 'Policy Acknowledgements', icon: Users },
    { name: 'Audits', icon: Shield },
    { name: 'Compliance Issues', icon: AlertTriangle }
  ];

  const descriptions = {
    'Policies': 'Manage corporate ESG policy frameworks, edit active drafts, and maintain version history logs.',
    'Policy Acknowledgements': 'Track employee policy readings, dispatch reminder emails, and manage compliance signing records.',
    'Audits': 'Schedule internal, environmental, and supplier sustainability audits, and log key auditor findings.',
    'Compliance Issues': 'Track issues raised during audits, resolve non-compliance items, and monitor remediation due dates.'
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'Policies': 
        return (
          <PolicyTable 
            policies={policies} 
            setPolicies={setPolicies} 
            addNotification={addNotification} 
          />
        );
      case 'Policy Acknowledgements': 
        return (
          <AcknowledgementTable 
            acknowledgements={acknowledgements} 
            setAcknowledgements={setAcknowledgements} 
            addNotification={addNotification} 
          />
        );
      case 'Audits': 
        return (
          <AuditTable 
            audits={audits} 
            setAudits={setAudits} 
            addNotification={addNotification} 
          />
        );
      case 'Compliance Issues': 
        return (
          <ComplianceTable 
            complianceIssues={complianceIssues} 
            setComplianceIssues={setComplianceIssues} 
            addNotification={addNotification} 
          />
        );
      default: 
        return (
          <AuditTable 
            audits={audits} 
            setAudits={setAudits} 
            addNotification={addNotification} 
          />
        );
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
        <span style={{ color: '#94a3b8' }}>Governance</span>
        <ChevronRight size={14} style={{ color: '#cbd5e1' }} />
        <span style={{ color: '#1e293b', fontWeight: 600 }}>{activeTab}</span>
      </div>

      {/* Page Title */}
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>{activeTab}</h2>
        <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>{descriptions[activeTab]}</p>
      </div>

      {/* Tabs Menu */}
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
                  borderBottom: isActive ? '2px solid #7c3aed' : '2px solid transparent',
                  fontSize: '14px', fontWeight: 600,
                  color: isActive ? '#7c3aed' : '#64748b',
                  backgroundColor: 'transparent', border: 'none',
                  borderBottomStyle: 'solid', borderBottomWidth: '2px',
                  borderBottomColor: isActive ? '#7c3aed' : 'transparent',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = '#334155'; e.currentTarget.style.borderBottomColor = '#cbd5e1'; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderBottomColor = 'transparent'; } }}
              >
                <TabIcon size={16} style={{ color: isActive ? '#7c3aed' : '#94a3b8' }} />
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

export default GovernancePage;
