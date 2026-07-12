import React, { useEffect, useState } from 'react';
import { ChevronRight, Shield, AlertTriangle, FileText, Users, RefreshCw } from 'lucide-react';
import AuditTable from '../../components/governance/AuditTable';
import ComplianceTable from '../../components/governance/ComplianceTable';
import PolicyTable from '../../components/governance/PolicyTable';
import AcknowledgementTable from '../../components/governance/AcknowledgementTable';
import { BASE_API_URL } from '../../config';
import {
  mapBackendPolicyToFrontend,
  mapBackendAckToFrontend,
  mapBackendAuditToFrontend,
  mapBackendIssueToFrontend
} from '../../utils/governanceMapper';

const GovernancePage = ({
  activeTab, setActiveTab,
  audits, setAudits,
  complianceIssues, setComplianceIssues,
  policies, setPolicies,
  acknowledgements, setAcknowledgements,
  addNotification
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [backendDepts, setBackendDepts] = useState([]);

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

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [policiesRes, acksRes, auditsRes, issuesRes, employeesRes, deptsRes] = await Promise.all([
        fetch(`${BASE_API_URL}/api/governance/policies/`),
        fetch(`${BASE_API_URL}/api/governance/acknowledgements/`),
        fetch(`${BASE_API_URL}/api/governance/audits/`),
        fetch(`${BASE_API_URL}/api/governance/issues/`),
        fetch(`${BASE_API_URL}/api/users/employees/dropdown/`),
        fetch(`${BASE_API_URL}/api/users/departments/dropdown/`)
      ]);

      if (policiesRes.ok) {
        const data = await policiesRes.json();
        const results = Array.isArray(data) ? data : (data.results || []);
        setPolicies(results.map(mapBackendPolicyToFrontend));
      }
      if (acksRes.ok) {
        const data = await acksRes.json();
        const results = Array.isArray(data) ? data : (data.results || []);
        setAcknowledgements(results.map(mapBackendAckToFrontend));
      }
      if (auditsRes.ok) {
        const data = await auditsRes.json();
        const results = Array.isArray(data) ? data : (data.results || []);
        setAudits(results.map(mapBackendAuditToFrontend));
      }
      if (issuesRes.ok) {
        const data = await issuesRes.json();
        const results = Array.isArray(data) ? data : (data.results || []);
        setComplianceIssues(results.map(mapBackendIssueToFrontend));
      }
      if (employeesRes.ok) {
        const data = await employeesRes.json();
        setEmployees(data);
      }
      if (deptsRes.ok) {
        const data = await deptsRes.json();
        setBackendDepts(data);
      }
    } catch (err) {
      console.warn("Backend offline or unreachable, utilizing existing state/mock data.", err);
      setError("Local backend unreachable. Displaying mock data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'Policies': 
        return (
          <PolicyTable 
            policies={policies} 
            setPolicies={setPolicies} 
            addNotification={addNotification} 
            employees={employees}
            refresh={fetchAllData}
          />
        );
      case 'Policy Acknowledgements': 
        return (
          <AcknowledgementTable 
            acknowledgements={acknowledgements} 
            setAcknowledgements={setAcknowledgements} 
            addNotification={addNotification} 
            employees={employees}
            policies={policies}
            refresh={fetchAllData}
          />
        );
      case 'Audits': 
        return (
          <AuditTable 
            audits={audits} 
            setAudits={setAudits} 
            addNotification={addNotification} 
            employees={employees}
            departments={backendDepts}
            refresh={fetchAllData}
          />
        );
      case 'Compliance Issues': 
        return (
          <ComplianceTable 
            complianceIssues={complianceIssues} 
            setComplianceIssues={setComplianceIssues} 
            addNotification={addNotification} 
            employees={employees}
            departments={backendDepts}
            refresh={fetchAllData}
          />
        );
      default: 
        return (
          <AuditTable 
            audits={audits} 
            setAudits={setAudits} 
            addNotification={addNotification} 
            employees={employees}
            departments={backendDepts}
            refresh={fetchAllData}
          />
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Breadcrumb / Status Indicator */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
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

        {/* Status Indicator & Manual Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
            backgroundColor: error ? '#fef2f2' : '#ecfdf5',
            color: error ? '#ef4444' : '#059669',
            border: `1px solid ${error ? '#fca5a5' : '#a7f3d0'}`
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              backgroundColor: error ? '#ef4444' : '#10b981'
            }}></span>
            {error ? 'Mock Data' : 'Live Connected'}
          </span>

          <button
            onClick={fetchAllData}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0',
              backgroundColor: '#fff', color: '#64748b', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => { if(!loading) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
            onMouseLeave={e => { if(!loading) e.currentTarget.style.backgroundColor = '#fff'; }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
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
