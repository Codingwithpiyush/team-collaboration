import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Search, Eye, CheckCircle, AlertTriangle, Calendar, X } from 'lucide-react';
import ComplianceModal from './ComplianceModal';
import { BASE_API_URL } from '../../config';

const ComplianceTable = ({ complianceIssues, setComplianceIssues, addNotification, employees = [], departments = [], refresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  const [viewingIssue, setViewingIssue] = useState(null);
  const [deletingIssue, setDeletingIssue] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Search filter
  const filteredIssues = useMemo(() => {
    return complianceIssues.filter(issue => {
      const term = searchTerm.toLowerCase();
      return (
        (issue.issue && issue.issue.toLowerCase().includes(term)) ||
        (issue.department && issue.department.toLowerCase().includes(term)) ||
        (issue.owner && issue.owner.toLowerCase().includes(term)) ||
        (issue.status && issue.status.toLowerCase().includes(term)) ||
        (issue.severity && issue.severity.toLowerCase().includes(term))
      );
    });
  }, [complianceIssues, searchTerm]);

  // Actions
  const handleOpenNewModal = () => {
    setEditingIssue(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (issue) => {
    setEditingIssue(issue);
    setIsModalOpen(true);
  };

  const handleResolveIssue = async (id) => {
    const issue = complianceIssues.find(i => i.id === id);
    if (!issue) return;

    try {
      const res = await fetch(`${BASE_API_URL}/api/governance/issues/${id}/resolve/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution_notes: 'Resolved via dashboard interface.' })
      });
      if (res.ok) {
        showToast(`Issue "${issue.issue}" marked as Resolved`);
        addNotification(`Compliance issue resolved: ${issue.issue} (${issue.department})`);
        if (refresh) refresh();
      } else {
        const err = await res.json();
        showToast(`Failed: ${JSON.stringify(err)}`);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to resolve compliance issue");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingIssue) return;
    try {
      const res = await fetch(`${BASE_API_URL}/api/governance/issues/${deletingIssue.id}/`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast(`Deleted compliance issue "${deletingIssue.issue}"`);
        if (refresh) refresh();
      } else {
        showToast("Failed to delete compliance issue");
      }
    } catch (err) {
      console.error(err);
      showToast("Error occurred during deletion");
    }
    setDeletingIssue(null);
  };

  const mapStatusToBackend = (status) => {
    const map = {
      'Open': 'open',
      'In Progress': 'in_progress',
      'Resolved': 'resolved',
      'Overdue': 'overdue'
    };
    return map[status] || 'open';
  };

  const handleSaveIssue = async (issueData) => {
    const payload = {
      title: issueData.issue,
      description: issueData.description || 'No description provided.',
      severity: issueData.severity.toLowerCase(),
      status: mapStatusToBackend(issueData.status),
      assigned_to: issueData.owner,
      department: issueData.department,
      due_date: issueData.dueDate
    };

    try {
      if (editingIssue) {
        const res = await fetch(`${BASE_API_URL}/api/governance/issues/${editingIssue.id}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showToast(`Updated issue "${issueData.issue}"`);
          if (issueData.status === 'Resolved' && editingIssue.status !== 'Resolved') {
            addNotification(`Compliance issue resolved: ${issueData.issue}`);
          }
        } else {
          const errData = await res.json();
          showToast(`Failed: ${JSON.stringify(errData)}`);
        }
      } else {
        const res = await fetch(`${BASE_API_URL}/api/governance/issues/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showToast(`Raised new compliance issue "${issueData.issue}"`);
          addNotification(`New compliance issue raised: ${issueData.issue}`);
        } else {
          const errData = await res.json();
          showToast(`Failed: ${JSON.stringify(errData)}`);
        }
      }
      if (refresh) refresh();
    } catch (err) {
      console.error(err);
      showToast("Error saving compliance issue");
    }
    setIsModalOpen(false);
    setEditingIssue(null);
  };

  // Severity Badge Style
  const getSeverityBadge = (severity) => {
    const styles = {
      'High': { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' },
      'Medium': { bg: '#ffedd5', text: '#c2410c', border: '#fed7aa' },
      'Low': { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' }
    };
    const s = styles[severity] || { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };

    return (
      <span style={{
        display: 'inline-block', padding: '3px 8px', fontSize: '11px', fontWeight: 700,
        borderRadius: '6px', backgroundColor: s.bg, color: s.text, border: `1px solid ${s.border}`
      }}>
        {severity}
      </span>
    );
  };

  // Status Badge Style
  const getStatusBadge = (status) => {
    const styles = {
      'Open': { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' }, // Red
      'Resolved': { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' }, // Green
      'In Progress': { bg: '#fef9c3', text: '#a16207', border: '#fef08a' }, // Yellow
      'Overdue': { bg: '#f3e8ff', text: '#6b21a8', border: '#e9d5ff' } // Purple
    };
    const s = styles[status] || { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };

    return (
      <span style={{
        display: 'inline-block', padding: '4px 10px', fontSize: '12px', fontWeight: 600,
        borderRadius: '9999px', backgroundColor: s.bg, color: s.text, border: `1px solid ${s.border}`
      }}>
        {status}
      </span>
    );
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
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#a78bfa', display: 'inline-block' }}></span>
          {toastMessage}
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <button 
            onClick={handleOpenNewModal}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px',
              backgroundColor: '#7c3aed', color: '#ffffff', fontSize: '14px', fontWeight: 600, border: 'none',
              cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(124,58,237,0.2)', transition: 'background-color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#6d28d9'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#7c3aed'}
          >
            <Plus size={16} />
            <span>Raise Issue</span>
          </button>
        </div>

        <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
          <input
            type="text"
            placeholder="Search Issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', paddingLeft: '40px', paddingRight: searchTerm ? '32px' : '12px',
              paddingTop: '9px', paddingBottom: '9px',
              backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px',
              fontSize: '14px', outline: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Table Card */}
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '16px',
        border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Issue Description', 'Severity', 'Department', 'Owner', 'Due Date', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '14px 16px', fontSize: '11px', fontWeight: 700,
                    color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em',
                    textAlign: h === 'Severity' ? 'center' : h === 'Actions' ? 'center' : 'left'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredIssues.length > 0 ? (
                filteredIssues.map((issue) => {
                  return (
                    <tr
                      key={issue.id}
                      style={{ borderBottom: '1px solid #f1f5f9' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          onClick={() => setViewingIssue(issue)}
                          style={{ fontWeight: 600, color: '#1e293b', fontSize: '14px', cursor: 'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#7c3aed'}
                          onMouseLeave={e => e.currentTarget.style.color = '#1e293b'}
                        >
                          {issue.issue}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        {getSeverityBadge(issue.severity)}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontSize: '14px', fontWeight: 500 }}>
                        {issue.department}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontSize: '14px', fontWeight: 500 }}>
                        {issue.owner}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontSize: '14px', fontWeight: 500 }}>
                        {issue.dueDate}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {getStatusBadge(issue.status)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <button
                            title="View"
                            onClick={() => setViewingIssue(issue)}
                            style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                          >
                            <Eye size={16} />
                          </button>
                          
                          {/* Resolve Button (Visible only when status is not Resolved) */}
                          {issue.status !== 'Resolved' && (
                            <button
                              title="Resolve Issue"
                              onClick={() => handleResolveIssue(issue.id)}
                              style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#10b981' }}
                              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ecfdf5'; e.currentTarget.style.color = '#059669'; }}
                              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#10b981'; }}
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}

                          <button
                            title="Edit"
                            onClick={() => handleOpenEditModal(issue)}
                            style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f5f3ff'; e.currentTarget.style.color = '#7c3aed'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                          >
                            <Edit size={16} />
                          </button>
                          
                          <button
                            title="Delete"
                            onClick={() => setDeletingIssue(issue)}
                            style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                    <p style={{ fontWeight: 600, color: '#475569', marginBottom: '4px' }}>No issues logged</p>
                    <p style={{ fontSize: '12px' }}>Great compliance record! No open items.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Modal */}
      <ComplianceModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingIssue(null); }}
        onSave={handleSaveIssue}
        issue={editingIssue}
        employees={employees}
        departments={departments}
      />

      {/* View Details Modal */}
      {viewingIssue && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setViewingIssue(null)}></div>
          <div style={{
            backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '500px',
            padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0',
            zIndex: 10, margin: '0 16px', position: 'relative'
          }}>
            <button
              onClick={() => setViewingIssue(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{viewingIssue.issue}</h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, margin: 0 }}>ID: {viewingIssue.id}</p>
              </div>
            </div>

            <div style={{ padding: '12px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Department</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>{viewingIssue.department}</span>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Status</span>
                  {getStatusBadge(viewingIssue.status)}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Severity</span>
                  <span style={{ marginTop: '2px', display: 'inline-block' }}>{getSeverityBadge(viewingIssue.severity)}</span>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Due Date</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} style={{ color: '#94a3b8' }} />
                    {viewingIssue.dueDate}
                  </span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Owner / Assignee</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>{viewingIssue.owner}</span>
              </div>

              {viewingIssue.description && (
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Issue Details</span>
                  <p style={{
                    fontSize: '14px', color: '#475569', backgroundColor: '#f8fafc',
                    padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9',
                    lineHeight: 1.6, margin: 0, maxHeight: '160px', overflowY: 'auto'
                  }}>
                    {viewingIssue.description}
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '16px' }}>
              {viewingIssue.status !== 'Resolved' && (
                <button
                  onClick={() => { handleResolveIssue(viewingIssue.id); setViewingIssue(null); }}
                  style={{
                    padding: '8px 16px', fontSize: '14px', fontWeight: 600,
                    backgroundColor: '#10b981', color: '#ffffff', border: 'none',
                    borderRadius: '12px', cursor: 'pointer', transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#059669'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#10b981'}
                >
                  Resolve Issue
                </button>
              )}
              <button
                onClick={() => setViewingIssue(null)}
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
      {deletingIssue && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setDeletingIssue(null)}></div>
          <div style={{
            backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '440px',
            padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0',
            zIndex: 10, margin: '0 16px', position: 'relative'
          }}>
            <button
              onClick={() => setDeletingIssue(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', flexShrink: 0 }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>Delete Compliance Issue</h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                  Are you sure you want to delete <strong style={{ color: '#334155', fontWeight: 600 }}>{deletingIssue.issue}</strong>? This will remove the issue from logs permanently.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', marginTop: '24px' }}>
              <button
                onClick={() => setDeletingIssue(null)}
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
                onClick={handleConfirmDelete}
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

export default ComplianceTable;
