import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Download, Search, Eye, AlertTriangle, FileText, X } from 'lucide-react';
import PolicyModal from './PolicyModal';
import { BASE_API_URL } from '../../config';

const PolicyTable = ({ policies, setPolicies, addNotification, employees = [], refresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [viewingPolicy, setViewingPolicy] = useState(null);
  const [deletingPolicy, setDeletingPolicy] = useState(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Search filter
  const filteredPolicies = useMemo(() => {
    return policies.filter(policy => {
      const term = searchTerm.toLowerCase();
      return (
        policy.name.toLowerCase().includes(term) ||
        (policy.category && policy.category.toLowerCase().includes(term)) ||
        (policy.department && policy.department.toLowerCase().includes(term)) ||
        (policy.status && policy.status.toLowerCase().includes(term))
      );
    });
  }, [policies, searchTerm]);

  // Checkbox helpers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredPolicies.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Modal Handlers
  const handleOpenNewModal = () => {
    setEditingPolicy(null);
    setIsModalOpen(isOpen => true);
  };

  const handleOpenEditModal = (policy) => {
    setEditingPolicy(policy);
    setIsModalOpen(isOpen => true);
  };

  const handleOpenEditSelected = () => {
    if (selectedIds.length !== 1) return;
    const selectedPolicy = policies.find(p => p.id === selectedIds[0]);
    if (selectedPolicy) handleOpenEditModal(selectedPolicy);
  };

  const handleOpenDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setDeletingPolicy({ id: 'BULK', name: `${selectedIds.length} selected policies`, count: selectedIds.length });
  };

  const handleConfirmDelete = async () => {
    if (!deletingPolicy) return;

    try {
      if (deletingPolicy.id === 'BULK') {
        await Promise.all(
          selectedIds.map(id =>
            fetch(`${BASE_API_URL}/api/governance/policies/${id}/`, { method: 'DELETE' })
          )
        );
        showToast(`Deleted ${deletingPolicy.count} policies`);
        setSelectedIds([]);
      } else {
        await fetch(`${BASE_API_URL}/api/governance/policies/${deletingPolicy.id}/`, { method: 'DELETE' });
        showToast(`Deleted policy "${deletingPolicy.name}"`);
        setSelectedIds(prev => prev.filter(id => id !== deletingPolicy.id));
      }
      if (refresh) refresh();
    } catch (err) {
      console.error(err);
      showToast("Failed to delete policy record(s)");
    }
    setDeletingPolicy(null);
  };

  const handleSavePolicy = async (policyData) => {
    const payload = {
      title: policyData.name,
      code: policyData.code || 'POL-' + policyData.name.toUpperCase().replace(/[^A-Z0-9]/g, '-').slice(0, 15) + '-' + Math.floor(100 + Math.random() * 900),
      description: policyData.description,
      version: policyData.version,
      status: policyData.status.toLowerCase(),
      owner: policyData.owner
    };

    try {
      if (editingPolicy) {
        const res = await fetch(`${BASE_API_URL}/api/governance/policies/${editingPolicy.id}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showToast(`Updated policy "${policyData.name}"`);
        } else {
          const errData = await res.json();
          showToast(`Failed: ${JSON.stringify(errData)}`);
        }
      } else {
        const res = await fetch(`${BASE_API_URL}/api/governance/policies/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showToast(`Added new policy "${policyData.name}"`);
          addNotification(`New corporate policy drafted: ${policyData.name} (v${policyData.version})`);
        } else {
          const errData = await res.json();
          showToast(`Failed: ${JSON.stringify(errData)}`);
        }
      }
      if (refresh) refresh();
    } catch (err) {
      console.error(err);
      showToast("Error processing policy save request");
    }
    setIsModalOpen(false);
    setEditingPolicy(null);
  };

  const handleExport = (format) => {
    setIsExportOpen(false);
    showToast(`Exported policy registry as ${format}...`);
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Active': { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' }, // Green
      'Draft': { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' }, // Slate/Gray
      'Archived': { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' } // Red
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
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifycontent: 'space-between', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
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
            <span>New Policy</span>
          </button>

          <button 
            onClick={handleOpenEditSelected}
            disabled={selectedIds.length !== 1}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px',
              backgroundColor: selectedIds.length === 1 ? '#d97706' : '#f1f5f9',
              color: selectedIds.length === 1 ? '#ffffff' : '#94a3b8',
              fontSize: '14px', fontWeight: 600,
              border: selectedIds.length === 1 ? '1px solid #d97706' : '1px solid #e2e8f0',
              cursor: selectedIds.length === 1 ? 'pointer' : 'not-allowed',
              opacity: selectedIds.length === 1 ? 1 : 0.6
            }}
          >
            <Edit size={16} />
            <span>Edit</span>
          </button>

          <button 
            onClick={handleOpenDeleteSelected}
            disabled={selectedIds.length === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px',
              backgroundColor: selectedIds.length > 0 ? '#ef4444' : '#f1f5f9',
              color: selectedIds.length > 0 ? '#ffffff' : '#94a3b8',
              fontSize: '14px', fontWeight: 600,
              border: selectedIds.length > 0 ? '1px solid #ef4444' : '1px solid #e2e8f0',
              cursor: selectedIds.length > 0 ? 'pointer' : 'not-allowed',
              opacity: selectedIds.length > 0 ? 1 : 0.6
            }}
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>

          {/* Export button */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setIsExportOpen(!isExportOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px',
                backgroundColor: '#334155', color: '#ffffff', fontSize: '14px', fontWeight: 600, border: 'none',
                cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(51,65,85,0.2)', transition: 'background-color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1e293b'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#334155'}
            >
              <Download size={16} />
              <span>Export</span>
            </button>
            {isExportOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setIsExportOpen(false)}></div>
                <div style={{
                  position: 'absolute', left: 0, top: '100%', marginTop: '8px',
                  width: '150px', backgroundColor: '#ffffff', borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0',
                  zIndex: 20, padding: '4px 0', overflow: 'hidden'
                }}>
                  {['PDF', 'Excel', 'CSV'].map(fmt => (
                    <button
                      key={fmt}
                      onClick={() => handleExport(fmt)}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '10px 16px', fontSize: '14px', fontWeight: 500,
                        color: '#334155', backgroundColor: 'transparent',
                        border: 'none', cursor: 'pointer', transition: 'background-color 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
          <input
            type="text"
            placeholder="Search Policies..."
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
                <th style={{ padding: '14px 16px', width: '48px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={filteredPolicies.length > 0 && selectedIds.length === filteredPolicies.length}
                    onChange={handleSelectAll}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#7c3aed' }}
                  />
                </th>
                {['Policy Name', 'Category', 'Department', 'Effective Date', 'Version', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '14px 16px', fontSize: '11px', fontWeight: 700,
                    color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em',
                    textAlign: h === 'Actions' ? 'center' : 'left'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPolicies.length > 0 ? (
                filteredPolicies.map((policy) => {
                  const isChecked = selectedIds.includes(policy.id);

                  return (
                    <tr
                      key={policy.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: isChecked ? '#f5f3ff' : 'transparent',
                        transition: 'background-color 0.15s'
                      }}
                      onMouseEnter={e => { if (!isChecked) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                      onMouseLeave={e => { if (!isChecked) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectOne(policy.id)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#7c3aed' }}
                        />
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#f5f3ff', color: '#7c3aed', flexShrink: 0 }}><FileText size={16} /></div>
                          <span
                            onClick={() => setViewingPolicy(policy)}
                            style={{ fontWeight: 600, color: '#1e293b', fontSize: '14px', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#7c3aed'}
                            onMouseLeave={e => e.currentTarget.style.color = '#1e293b'}
                          >
                            {policy.name}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontSize: '14px', fontWeight: 500 }}>
                        {policy.category}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontSize: '14px', fontWeight: 500 }}>
                        {policy.department}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontSize: '14px', fontWeight: 500 }}>
                        {policy.effectiveDate}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#334155', fontSize: '14px', fontWeight: 600 }}>
                        v{policy.version}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {getStatusBadge(policy.status)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <button
                            title="View"
                            onClick={() => setViewingPolicy(policy)}
                            style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            title="Edit"
                            onClick={() => handleOpenEditModal(policy)}
                            style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f5f3ff'; e.currentTarget.style.color = '#7c3aed'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            title="Delete"
                            onClick={() => setDeletingPolicy(policy)}
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
                  <td colSpan="8" style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                    <p style={{ fontWeight: 600, color: '#475569', marginBottom: '4px' }}>No policies registered</p>
                    <p style={{ fontSize: '12px' }}>Create a policy using the toolbar above.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Policy Modal */}
      <PolicyModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingPolicy(null); }}
        onSave={handleSavePolicy}
        policy={editingPolicy}
        employees={employees}
      />

      {/* Details View Modal */}
      {viewingPolicy && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setViewingPolicy(null)}></div>
          <div style={{
            backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '500px',
            padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0',
            zIndex: 10, margin: '0 16px', position: 'relative'
          }}>
            <button
              onClick={() => setViewingPolicy(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
                <FileText size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{viewingPolicy.name}</h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, margin: 0 }}>ID: {viewingPolicy.id}</p>
              </div>
            </div>

            <div style={{ padding: '12px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Category</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>{viewingPolicy.category}</span>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Status</span>
                  {getStatusBadge(viewingPolicy.status)}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Department</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>{viewingPolicy.department}</span>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Effective Date</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>{viewingPolicy.effectiveDate}</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Policy Version</span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>v{viewingPolicy.version}</span>
              </div>

              {viewingPolicy.pdfFile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#7c3aed', backgroundColor: '#f5f3ff', padding: '10px', borderRadius: '12px', fontSize: '13px', border: '1px solid #e9d5ff' }}>
                  <FileText size={16} />
                  <span>Document: <strong style={{ fontWeight: 600 }}>{viewingPolicy.pdfFile}</strong></span>
                </div>
              )}

              {viewingPolicy.description && (
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Policy Scope & Details</span>
                  <p style={{
                    fontSize: '14px', color: '#475569', backgroundColor: '#f8fafc',
                    padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9',
                    lineHeight: 1.6, margin: 0, maxHeight: '160px', overflowY: 'auto'
                  }}>
                    {viewingPolicy.description}
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifycontent: 'flex-end', justifyContent: 'flex-end', paddingTop: '16px' }}>
              <button
                onClick={() => setViewingPolicy(null)}
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
      {deletingPolicy && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setDeletingPolicy(null)}></div>
          <div style={{
            backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '440px',
            padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0',
            zIndex: 10, margin: '0 16px', position: 'relative'
          }}>
            <button
              onClick={() => setDeletingPolicy(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', flexShrink: 0 }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>Delete corporate policy</h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                  Are you sure you want to delete policy <strong style={{ color: '#334155', fontWeight: 600 }}>{deletingPolicy.name}</strong>? This cannot be undone.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', marginTop: '24px' }}>
              <button
                onClick={() => setDeletingPolicy(null)}
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

export default PolicyTable;
