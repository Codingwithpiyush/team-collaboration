import React, { useState, useMemo } from 'react';
import { Search, Send, CheckCircle2, Eye, X, Mail, Plus } from 'lucide-react';
import { BASE_API_URL } from '../../config';

const AcknowledgementTable = ({ acknowledgements, setAcknowledgements, addNotification, employees = [], policies = [], refresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingAck, setViewingAck] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAck, setNewAck] = useState({ policyId: '', employeeId: '' });

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Search filter
  const filteredAcks = useMemo(() => {
    return acknowledgements.filter(ack => {
      const term = searchTerm.toLowerCase();
      return (
        (ack.employee && ack.employee.toLowerCase().includes(term)) ||
        (ack.policy && ack.policy.toLowerCase().includes(term)) ||
        (ack.status && ack.status.toLowerCase().includes(term))
      );
    });
  }, [acknowledgements, searchTerm]);

  // Actions
  const handleSendReminder = (id) => {
    const ack = acknowledgements.find(a => a.id === id);
    if (!ack) return;

    // Local/mock notification dispatch since backend doesn't trigger email
    showToast(`Reminder email dispatched to ${ack.employee}`);
    addNotification(`Policy acknowledgement reminder sent to ${ack.employee} for "${ack.policy}"`);
  };

  const handleMarkComplete = async (id) => {
    const ack = acknowledgements.find(a => a.id === id);
    if (!ack) return;

    try {
      const res = await fetch(`${BASE_API_URL}/api/governance/policies/${ack.policyId}/acknowledge/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee: ack.employeeId })
      });
      if (res.ok) {
        showToast(`Acknowledgement marked Complete for ${ack.employee}`);
        addNotification(`Policy acknowledged: ${ack.employee} completed signing "${ack.policy}"`);
        if (refresh) refresh();
      } else {
        const err = await res.json();
        showToast(`Failed: ${JSON.stringify(err)}`);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to complete acknowledgement");
    }
  };

  const handleRecordSignoff = async (e) => {
    e.preventDefault();
    if (!newAck.policyId || !newAck.employeeId) {
      showToast("Please select both a policy and an employee");
      return;
    }

    try {
      const res = await fetch(`${BASE_API_URL}/api/governance/policies/${newAck.policyId}/acknowledge/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee: parseInt(newAck.employeeId) })
      });

      if (res.ok) {
        showToast("Policy sign-off successfully recorded");
        setIsAddModalOpen(false);
        setNewAck({ policyId: '', employeeId: '' });
        if (refresh) refresh();
      } else {
        const err = await res.json();
        showToast(`Failed: ${err.detail || JSON.stringify(err)}`);
      }
    } catch (err) {
      console.error(err);
      showToast("Error recording policy sign-off");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Completed': { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' }, // Green
      'Pending': { bg: '#fef9c3', text: '#a16207', border: '#fef08a' }, // Yellow
      'Expired': { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' } // Red
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#334155', margin: 0 }}>Policy Acknowledgement Tracking</h3>
          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px',
              backgroundColor: '#7c3aed', color: '#ffffff', fontSize: '13px', fontWeight: 600, border: 'none',
              cursor: 'pointer', transition: 'background-color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#6d28d9'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#7c3aed'}
          >
            <Plus size={14} />
            <span>Record Sign-off</span>
          </button>
        </div>

        <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
          <input
            type="text"
            placeholder="Search employees or policies..."
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
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Employee', 'Policy Reference', 'Acknowledged Date', 'Status', 'Reminder Sent', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '14px 16px', fontSize: '11px', fontWeight: 700,
                    color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em',
                    textAlign: h === 'Actions' ? 'center' : 'left'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAcks.length > 0 ? (
                filteredAcks.map((ack) => {
                  return (
                    <tr
                      key={ack.id}
                      style={{ borderBottom: '1px solid #f1f5f9' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>
                        {ack.employee}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontSize: '14px', fontWeight: 500 }}>
                        {ack.policy}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontSize: '14px', fontWeight: 500 }}>
                        {ack.acknowledgedDate}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {getStatusBadge(ack.status)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          fontSize: '13px', fontWeight: 600,
                          color: ack.reminderSent === 'Yes' ? '#7c3aed' : '#64748b'
                        }}>{ack.reminderSent}</span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <button
                            title="View details"
                            onClick={() => setViewingAck(ack)}
                            style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                          >
                            <Eye size={16} />
                          </button>

                          {/* Send Reminder Action */}
                          {ack.status !== 'Completed' && (
                            <button
                              title="Send Reminder Email"
                              onClick={() => handleSendReminder(ack.id)}
                              style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#7c3aed' }}
                              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f5f3ff'; e.currentTarget.style.color = '#6d28d9'; }}
                              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#7c3aed'; }}
                            >
                              <Send size={16} />
                            </button>
                          )}

                          {/* Mark Complete Action */}
                          {ack.status !== 'Completed' && (
                            <button
                              title="Mark as Complete"
                              onClick={() => handleMarkComplete(ack.id)}
                              style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#10b981' }}
                              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ecfdf5'; e.currentTarget.style.color = '#059669'; }}
                              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#10b981'; }}
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                    <p style={{ fontWeight: 600, color: '#475569', marginBottom: '4px' }}>No records found</p>
                    <p style={{ fontSize: '12px' }}>Adjust search term or review employee roster.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Sign-off Modal */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setIsAddModalOpen(false)}></div>
          <form onSubmit={handleRecordSignoff} style={{
            backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '440px',
            padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0',
            zIndex: 10, margin: '0 16px', position: 'relative'
          }}>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '20px', marginTop: 0 }}>Record Policy Sign-off</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Select Policy</label>
                <select
                  value={newAck.policyId}
                  onChange={e => setNewAck(prev => ({ ...prev, policyId: e.target.value }))}
                  style={{ width: '100%', padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '14px', outline: 'none' }}
                >
                  <option value="">Select a Policy</option>
                  {policies.map(p => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Select Employee</label>
                <select
                  value={newAck.employeeId}
                  onChange={e => setNewAck(prev => ({ ...prev, employeeId: e.target.value }))}
                  style={{ width: '100%', padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '14px', outline: 'none' }}
                >
                  <option value="">Select an Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.department_name})</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '20px', borderTop: '1px solid #f1f5f9', marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 600, color: '#475569', backgroundColor: '#ffffff', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ padding: '10px 16px', borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: 600, color: '#ffffff', backgroundColor: '#7c3aed', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(124,58,237,0.2)' }}
              >
                Submit Sign-off
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Details Modal */}
      {viewingAck && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setViewingAck(null)}></div>
          <div style={{
            backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '440px',
            padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0',
            zIndex: 10, margin: '0 16px', position: 'relative'
          }}>
            <button
              onClick={() => setViewingAck(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
                <Mail size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Acknowledgement Info</h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, margin: 0 }}>Record: {viewingAck.id}</p>
              </div>
            </div>

            <div style={{ padding: '12px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Employee Name</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>{viewingAck.employee}</span>
              </div>

              <div>
                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Policy Reference</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>{viewingAck.policy}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Signing Date</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>{viewingAck.acknowledgedDate}</span>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Status</span>
                  {getStatusBadge(viewingAck.status)}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Reminders Dispatched</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>{viewingAck.reminderSent === 'Yes' ? 'Yes, notification email sent' : 'No notification email sent'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '16px' }}>
              {viewingAck.status !== 'Completed' && (
                <button
                  onClick={() => { handleMarkComplete(viewingAck.id); setViewingAck(null); }}
                  style={{
                    padding: '8px 16px', fontSize: '14px', fontWeight: 600,
                    backgroundColor: '#10b981', color: '#ffffff', border: 'none',
                    borderRadius: '12px', cursor: 'pointer', transition: 'background-color 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#059669'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#10b981'}
                >
                  Mark Complete
                </button>
              )}
              <button
                onClick={() => setViewingAck(null)}
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
    </div>
  );
};

export default AcknowledgementTable;
