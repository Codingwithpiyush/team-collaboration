import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Download, Search, Eye, AlertTriangle, Calendar, X, Filter } from 'lucide-react';
import AuditModal from './AuditModal';
import { BASE_API_URL } from '../../config';

const AuditTable = ({ audits, setAudits, addNotification, employees = [], departments = [], refresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  const [selectedIds, setSelectedIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAudit, setEditingAudit] = useState(null);
  const [viewingAudit, setViewingAudit] = useState(null);
  const [deletingAudit, setDeletingAudit] = useState(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Filter lists based on existing data
  const deptList = useMemo(() => {
    const depts = new Set(audits.map(a => a.department).filter(Boolean));
    return ['All', ...Array.from(depts)];
  }, [audits]);

  const statuses = ['All', 'Completed', 'Under Review', 'Scheduled', 'Cancelled'];

  // Search & Filter Logic
  const filteredAudits = useMemo(() => {
    return audits.filter(audit => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        audit.title.toLowerCase().includes(term) ||
        (audit.auditor && audit.auditor.toLowerCase().includes(term)) ||
        (audit.findings && audit.findings.toLowerCase().includes(term));

      const matchesDept = selectedDept === 'All' || audit.department === selectedDept;
      const matchesStatus = selectedStatus === 'All' || audit.status === selectedStatus;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [audits, searchTerm, selectedDept, selectedStatus]);

  // Checkbox Selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredAudits.map(a => a.id));
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
    setEditingAudit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (audit) => {
    setEditingAudit(audit);
    setIsModalOpen(true);
  };

  const handleOpenEditSelected = () => {
    if (selectedIds.length !== 1) return;
    const selectedAudit = audits.find(a => a.id === selectedIds[0]);
    if (selectedAudit) handleOpenEditModal(selectedAudit);
  };

  const handleOpenDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    setDeletingAudit({ id: 'BULK', title: `${selectedIds.length} selected audits`, count: selectedIds.length });
  };

  const handleConfirmDelete = async () => {
    if (!deletingAudit) return;

    try {
      if (deletingAudit.id === 'BULK') {
        await Promise.all(
          selectedIds.map(id =>
            fetch(`${BASE_API_URL}/api/governance/audits/${id}/`, { method: 'DELETE' })
          )
        );
        showToast(`Deleted ${deletingAudit.count} audit records`);
        setSelectedIds([]);
      } else {
        await fetch(`${BASE_API_URL}/api/governance/audits/${deletingAudit.id}/`, { method: 'DELETE' });
        showToast(`Deleted audit "${deletingAudit.title}"`);
        setSelectedIds(prev => prev.filter(id => id !== deletingAudit.id));
      }
      if (refresh) refresh();
    } catch (err) {
      console.error(err);
      showToast("Failed to delete audit record(s)");
    }
    setDeletingAudit(null);
  };

  const mapStatusToBackend = (status) => {
    const map = {
      'Completed': 'completed',
      'Under Review': 'in_progress',
      'Scheduled': 'draft',
      'Cancelled': 'cancelled'
    };
    return map[status] || 'draft';
  };

  const handleSaveAudit = async (auditData) => {
    const payload = {
      title: auditData.title,
      scope: auditData.description,
      department: auditData.department,
      auditor: auditData.auditor,
      audit_date: auditData.date,
      score: auditData.score,
      status: mapStatusToBackend(auditData.status),
      findings: auditData.findings
    };

    try {
      if (editingAudit) {
        const res = await fetch(`${BASE_API_URL}/api/governance/audits/${editingAudit.id}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showToast(`Updated audit "${auditData.title}"`);
          if (auditData.status === 'Completed' && editingAudit.status !== 'Completed') {
            addNotification(`Audit completed: ${auditData.title} conducted by ${auditData.auditorName || auditData.auditor}`);
          }
        } else {
          const errData = await res.json();
          showToast(`Failed: ${JSON.stringify(errData)}`);
        }
      } else {
        const res = await fetch(`${BASE_API_URL}/api/governance/audits/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showToast(`Scheduled new audit "${auditData.title}"`);
          addNotification(`New audit scheduled: ${auditData.title}`);
        } else {
          const errData = await res.json();
          showToast(`Failed: ${JSON.stringify(errData)}`);
        }
      }
      if (refresh) refresh();
    } catch (err) {
      console.error(err);
      showToast("Error processing audit save request");
    }
    setIsModalOpen(false);
    setEditingAudit(null);
  };

  const handleExport = (format) => {
    setIsExportOpen(false);
    showToast(`Exporting audit log as ${format}...`);
  };

  // Status Badges (Governance theme)
  const getStatusBadge = (status) => {
    const colors = {
      'Completed': { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' }, // Blue
      'Under Review': { bg: '#f3e8ff', text: '#6b21a8', border: '#e9d5ff' }, // Purple
      'Scheduled': { bg: '#fef9c3', text: '#a16207', border: '#fef08a' }, // Yellow
      'Cancelled': { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' } // Red
    };
    const c = colors[status] || { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };

    return (
      <span style={{
        display: 'inline-block', padding: '4px 10px', fontSize: '12px', fontWeight: 600,
        borderRadius: '9999px', backgroundColor: c.bg, color: c.text, border: `1px solid ${c.border}`
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
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          {/* New Audit (Purple) */}
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
            <span>New Audit</span>
          </button>

          {/* Edit (Orange/Yellow-orange) */}
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

          {/* Delete (Red) */}
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

          {/* Export (Dark Gray) */}
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

        {/* Filters and Search */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          {/* Department Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#fff', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <Filter size={16} style={{ color: '#94a3b8' }} />
            <select 
              value={selectedDept} 
              onChange={e => setSelectedDept(e.target.value)}
              style={{ fontSize: '14px', fontWeight: 600, color: '#475569', backgroundColor: 'transparent', border: 'none', outline: 'none', cursor: 'pointer' }}
            >
              {deptList.map(d => <option key={d} value={d}>{d === 'All' ? 'All Depts' : d}</option>)}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#fff', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <Filter size={16} style={{ color: '#94a3b8' }} />
            <select 
              value={selectedStatus} 
              onChange={e => setSelectedStatus(e.target.value)}
              style={{ fontSize: '14px', fontWeight: 600, color: '#475569', backgroundColor: 'transparent', border: 'none', outline: 'none', cursor: 'pointer' }}
            >
              {statuses.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
            </select>
          </div>

          {/* Search box */}
          <div style={{ position: 'relative', width: '220px', maxWidth: '100%' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
            <input
              type="text"
              placeholder="Search Audits..."
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
                    checked={filteredAudits.length > 0 && selectedIds.length === filteredAudits.length}
                    onChange={handleSelectAll}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#7c3aed' }}
                  />
                </th>
                {['Audit Title', 'Department', 'Auditor', 'Audit Date', 'Findings', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '14px 16px', fontSize: '11px', fontWeight: 700,
                    color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em',
                    textAlign: h === 'Actions' ? 'center' : 'left'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredAudits.length > 0 ? (
                filteredAudits.map((audit) => {
                  const isChecked = selectedIds.includes(audit.id);

                  return (
                    <tr
                      key={audit.id}
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
                          onChange={() => handleSelectOne(audit.id)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#7c3aed' }}
                        />
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          onClick={() => setViewingAudit(audit)}
                          style={{ fontWeight: 600, color: '#1e293b', fontSize: '14px', cursor: 'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#7c3aed'}
                          onMouseLeave={e => e.currentTarget.style.color = '#1e293b'}
                        >
                          {audit.title}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontSize: '14px', fontWeight: 500 }}>
                        {audit.department}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontSize: '14px', fontWeight: 500 }}>
                        {audit.auditor}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontSize: '14px', fontWeight: 500 }}>
                        {audit.date}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#334155', fontSize: '14px', fontWeight: 600 }}>
                        {audit.findings}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {getStatusBadge(audit.status)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <button
                            title="View"
                            onClick={() => setViewingAudit(audit)}
                            style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            title="Edit"
                            onClick={() => handleOpenEditModal(audit)}
                            style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f5f3ff'; e.currentTarget.style.color = '#7c3aed'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            title="Delete"
                            onClick={() => setDeletingAudit(audit)}
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
                    <p style={{ fontWeight: 600, color: '#475569', marginBottom: '4px' }}>No audit records found</p>
                    <p style={{ fontSize: '12px' }}>Schedule an audit to begin logging records.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Modal */}
      <AuditModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingAudit(null); }}
        onSave={handleSaveAudit}
        audit={editingAudit}
        employees={employees}
        departments={departments}
      />

      {/* Details View Modal */}
      {viewingAudit && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setViewingAudit(null)}></div>
          <div style={{
            backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '500px',
            padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0',
            zIndex: 10, margin: '0 16px', position: 'relative'
          }}>
            <button
              onClick={() => setViewingAudit(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
                <Calendar size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{viewingAudit.title}</h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, margin: 0 }}>ID: {viewingAudit.id}</p>
              </div>
            </div>

            <div style={{ padding: '12px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Department</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>{viewingAudit.department}</span>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Status</span>
                  {getStatusBadge(viewingAudit.status)}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Auditor</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>{viewingAudit.auditor}</span>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Audit Date</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>{viewingAudit.date}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Audit Type</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>{viewingAudit.type || 'Internal Audit'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Findings Summary</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>{viewingAudit.findings}</span>
                </div>
              </div>

              {viewingAudit.description && (
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Description / Scope</span>
                  <p style={{
                    fontSize: '14px', color: '#475569', backgroundColor: '#f8fafc',
                    padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9',
                    lineHeight: 1.6, margin: 0, maxHeight: '160px', overflowY: 'auto'
                  }}>
                    {viewingAudit.description}
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px' }}>
              <button
                onClick={() => setViewingAudit(null)}
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
      {deletingAudit && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setDeletingAudit(null)}></div>
          <div style={{
            backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '440px',
            padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0',
            zIndex: 10, margin: '0 16px', position: 'relative'
          }}>
            <button
              onClick={() => setDeletingAudit(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', flexShrink: 0 }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>Delete Audit Record</h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                  Are you sure you want to delete <strong style={{ color: '#334155', fontWeight: 600 }}>{deletingAudit.title}</strong>? This record will be permanently deleted.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', marginTop: '24px' }}>
              <button
                onClick={() => setDeletingAudit(null)}
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

export default AuditTable;
