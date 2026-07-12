import React, { useState, useMemo } from 'react';
import { Search, CheckCircle, XCircle, Eye, FileText, X } from 'lucide-react';

const ParticipationTable = ({ participation, onApprove, onReject }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingProof, setViewingProof] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const filteredParticipation = useMemo(() => {
    return participation.filter(p => {
      const term = searchTerm.toLowerCase();
      return (
        p.employee.toLowerCase().includes(term) ||
        p.challenge.toLowerCase().includes(term) ||
        p.status.toLowerCase().includes(term)
      );
    });
  }, [participation, searchTerm]);

  const handleApprove = (id, employee, challenge) => {
    onApprove(id);
    showToast(`Approved submission from ${employee} for ${challenge}`);
  };

  const handleReject = (id, employee, challenge) => {
    onReject(id);
    showToast(`Rejected submission from ${employee} for ${challenge}`);
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Approved': { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' }, // Green
      'Pending': { bg: '#ffedd5', text: '#ea580c', border: '#fed7aa' }, // Orange (Gamification Pending)
      'Rejected': { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' } // Red
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

      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#334155', margin: 0 }}>Participant Submissions Approval</h3>
        </div>

        <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
          <input
            type="text"
            placeholder="Search employees or challenges..."
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
                {['Employee', 'Challenge Name', 'Progress', 'Evidence Proof', 'XP Value', 'Approval Status', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '14px 16px', fontSize: '11px', fontWeight: 700,
                    color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em',
                    textAlign: ['Progress', 'XP Value'].includes(h) ? 'right' : h === 'Actions' ? 'center' : 'left'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredParticipation.length > 0 ? (
                filteredParticipation.map((part) => {
                  return (
                    <tr
                      key={part.id}
                      style={{ borderBottom: '1px solid #f1f5f9' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#1e293b', fontSize: '14px' }}>
                        {part.employee}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontSize: '14px', fontWeight: 500 }}>
                        {part.challenge}
                      </td>
                      <td style={{ padding: '14px 16px', width: '150px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '60px', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${part.progress}%`, height: '100%', backgroundColor: '#f97316' }}></div>
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>{part.progress}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button 
                          onClick={() => setViewingProof(part)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600,
                            color: '#ea580c', border: 'none', backgroundColor: 'transparent', cursor: 'pointer'
                          }}
                          onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                        >
                          <FileText size={14} />
                          <span>{part.proof}</span>
                        </button>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: '#334155', fontSize: '14px' }}>
                        {part.xp} XP
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {getStatusBadge(part.status)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <button
                            title="View Proof details"
                            onClick={() => setViewingProof(part)}
                            style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                          >
                            <Eye size={16} />
                          </button>

                          {/* Approval Actions (Visible only when status is Pending) */}
                          {part.status === 'Pending' && (
                            <>
                              <button
                                title="Approve Submission"
                                onClick={() => handleApprove(part.id, part.employee, part.challenge)}
                                style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#10b981' }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ecfdf5'; e.currentTarget.style.color = '#059669'; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#10b981'; }}
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                title="Reject Submission"
                                onClick={() => handleReject(part.id, part.employee, part.challenge)}
                                style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#ef4444' }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#ef4444'; }}
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                    <p style={{ fontWeight: 600, color: '#475569', marginBottom: '4px' }}>No submissions logged</p>
                    <p style={{ fontSize: '12px' }}>Review search terms or wait for new challenge sign-ups.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Proof Details Modal */}
      {viewingProof && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setViewingProof(null)}></div>
          <div style={{
            backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '460px',
            padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0',
            zIndex: 10, margin: '0 16px', position: 'relative'
          }}>
            <button
              onClick={() => setViewingProof(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
                <FileText size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Submission Evidence</h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, margin: 0 }}>ID: {viewingProof.id}</p>
              </div>
            </div>

            <div style={{ padding: '12px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Participant Name</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>{viewingProof.employee}</span>
              </div>

              <div>
                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Challenge</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>{viewingProof.challenge}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Claimed Reward</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#ea580c' }}>{viewingProof.xp} XP</span>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Status</span>
                  {getStatusBadge(viewingProof.status)}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ea580c', backgroundColor: '#fff7ed', padding: '10px', borderRadius: '12px', fontSize: '13px', border: '1px solid #ffedd5' }}>
                <FileText size={16} />
                <span>Uploaded Proof: <strong style={{ fontWeight: 600 }}>{viewingProof.proof}</strong></span>
              </div>

              {viewingProof.remarks && (
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Participant Remarks</span>
                  <p style={{
                    fontSize: '14px', color: '#475569', backgroundColor: '#f8fafc',
                    padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9',
                    lineHeight: 1.6, margin: 0, maxHeight: '160px', overflowY: 'auto'
                  }}>
                    {viewingProof.remarks}
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '16px' }}>
              {viewingProof.status === 'Pending' && (
                <>
                  <button
                    onClick={() => { handleApprove(viewingProof.id, viewingProof.employee, viewingProof.challenge); setViewingProof(null); }}
                    style={{
                      padding: '8px 16px', fontSize: '14px', fontWeight: 600,
                      backgroundColor: '#10b981', color: '#ffffff', border: 'none',
                      borderRadius: '12px', cursor: 'pointer', transition: 'background-color 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#059669'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#10b981'}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => { handleReject(viewingProof.id, viewingProof.employee, viewingProof.challenge); setViewingProof(null); }}
                    style={{
                      padding: '8px 16px', fontSize: '14px', fontWeight: 600,
                      backgroundColor: '#ef4444', color: '#ffffff', border: 'none',
                      borderRadius: '12px', cursor: 'pointer', transition: 'background-color 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#dc2626'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ef4444'}
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => setViewingProof(null)}
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

export default ParticipationTable;
