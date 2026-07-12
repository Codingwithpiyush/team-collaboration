import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Search, 
  Eye,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  X
} from 'lucide-react';
import GoalModal from './GoalModal';
import { BASE_API_URL } from '../../config';

const GoalTable = ({ goals, setGoals, refresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGoalIds, setSelectedGoalIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [viewingGoal, setViewingGoal] = useState(null);
  const [deletingGoal, setDeletingGoal] = useState(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const filteredGoals = useMemo(() => {
    return goals.filter(goal => {
      const term = searchTerm.toLowerCase();
      return (
        goal.name.toLowerCase().includes(term) ||
        goal.department.toLowerCase().includes(term) ||
        goal.status.toLowerCase().includes(term)
      );
    });
  }, [goals, searchTerm]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedGoalIds(filteredGoals.map(g => g.id));
    } else {
      setSelectedGoalIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedGoalIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleOpenNewModal = () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (goal) => {
    setEditingGoal(goal);
    setIsModalOpen(true);
  };

  const handleOpenEditSelected = () => {
    if (selectedGoalIds.length !== 1) return;
    const selectedGoal = goals.find(g => g.id === selectedGoalIds[0]);
    if (selectedGoal) handleOpenEditModal(selectedGoal);
  };

  const handleOpenDeleteConfirm = (goal) => {
    setDeletingGoal(goal);
  };

  const handleOpenDeleteSelected = () => {
    if (selectedGoalIds.length === 0) return;
    const goalsToDelete = goals.filter(g => selectedGoalIds.includes(g.id));
    setDeletingGoal({ id: 'BULK', name: `${goalsToDelete.length} selected goals`, count: goalsToDelete.length });
  };

  const mapStatusToBackend = (status) => {
    const s = status.toLowerCase();
    if (s === 'on track') return 'active';
    if (s === 'completed') return 'achieved';
    if (s === 'delayed') return 'active';
    return s;
  };

  const handleConfirmDelete = async () => {
    if (!deletingGoal) return;
    try {
      if (deletingGoal.id === 'BULK') {
        await Promise.all(selectedGoalIds.map(id =>
          fetch(`${BASE_API_URL}/api/environmental/goals/${id}/`, { method: 'DELETE' })
        ));
        showToast(`Deleted ${deletingGoal.count} goals`);
        setSelectedGoalIds([]);
      } else {
        const res = await fetch(`${BASE_API_URL}/api/environmental/goals/${deletingGoal.id}/`, { method: 'DELETE' });
        if (res.ok) {
          showToast(`Deleted "${deletingGoal.name}"`);
          setSelectedGoalIds(prev => prev.filter(id => id !== deletingGoal.id));
        } else {
          showToast("Failed to delete goal", "error");
        }
      }
      if (refresh) await refresh();
    } catch (err) {
      console.error(err);
      showToast("Error connecting to backend", "error");
    }
    setDeletingGoal(null);
  };

  const handleSaveGoal = async (goalData) => {
    const isEdit = !!editingGoal;
    const url = isEdit
      ? `${BASE_API_URL}/api/environmental/goals/${editingGoal.id}/`
      : `${BASE_API_URL}/api/environmental/goals/`;
    const method = isEdit ? 'PUT' : 'POST';

    const payload = {
      name: goalData.name,
      target_type: goalData.targetType || 'carbon_reduction',
      target_value: parseFloat(goalData.targetCo2),
      start_date: new Date().toISOString().split('T')[0],
      target_date: goalData.deadline,
      status: mapStatusToBackend(goalData.status),
      department: goalData.departmentId,
      description: goalData.description
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok || res.status === 201) {
        showToast(isEdit ? `Updated "${goalData.name}"` : `Added "${goalData.name}"`);
        setIsModalOpen(false);
        setEditingGoal(null);
        if (refresh) await refresh();
      } else {
        const errorData = await res.json();
        showToast(errorData?.detail || errorData?.non_field_errors?.[0] || "Error saving goal", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error connecting to backend", "error");
    }
  };

  const handleExport = (format) => {
    setIsExportOpen(false);
    const fmt = format.toLowerCase() === 'excel' ? 'excel' : format.toLowerCase();
    const downloadUrl = `${BASE_API_URL}/api/environmental/goals/export/?export=${fmt}`;
    window.open(downloadUrl, '_blank');
    showToast(`Exporting as ${format}...`);
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Active': { background: '#dcfce7', color: '#15803d', border: '#bbf7d0' },
      'On Track': { background: '#d1fae5', color: '#047857', border: '#a7f3d0' },
      'Completed': { background: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' },
      'Delayed': { background: '#fee2e2', color: '#b91c1c', border: '#fecaca' },
    };
    const s = styles[status] || { background: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '4px 10px',
          fontSize: '12px',
          fontWeight: 600,
          borderRadius: '9999px',
          backgroundColor: s.background,
          color: s.color,
          border: `1px solid ${s.border}`,
        }}
      >
        {status}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: '16px', right: '16px', zIndex: 50,
          backgroundColor: '#0f172a', color: '#fff', padding: '12px 20px',
          borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: 500
        }}>
          <span style={{
            width: '8px', height: '8px', borderRadius: '50%',
            backgroundColor: '#10b981', display: 'inline-block'
          }}></span>
          {toastMessage}
        </div>
      )}

      {/* Action Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        {/* Left Side Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          {/* New Goal - Green */}
          <button
            onClick={handleOpenNewModal}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', borderRadius: '12px',
              backgroundColor: '#059669', color: '#ffffff',
              fontSize: '14px', fontWeight: 600, border: 'none',
              cursor: 'pointer', boxShadow: '0 1px 3px rgba(5,150,105,0.3)',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#047857'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#059669'}
          >
            <Plus size={16} />
            <span>New Goal</span>
          </button>

          {/* Edit - Orange */}
          <button
            onClick={handleOpenEditSelected}
            disabled={selectedGoalIds.length !== 1}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', borderRadius: '12px',
              backgroundColor: selectedGoalIds.length === 1 ? '#f59e0b' : '#f1f5f9',
              color: selectedGoalIds.length === 1 ? '#ffffff' : '#94a3b8',
              fontSize: '14px', fontWeight: 600,
              border: selectedGoalIds.length === 1 ? '1px solid #f59e0b' : '1px solid #e2e8f0',
              cursor: selectedGoalIds.length === 1 ? 'pointer' : 'not-allowed',
              opacity: selectedGoalIds.length === 1 ? 1 : 0.6,
              transition: 'all 0.2s'
            }}
          >
            <Edit size={16} />
            <span>Edit</span>
          </button>

          {/* Delete - Red */}
          <button
            onClick={handleOpenDeleteSelected}
            disabled={selectedGoalIds.length === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px', borderRadius: '12px',
              backgroundColor: selectedGoalIds.length > 0 ? '#ef4444' : '#f1f5f9',
              color: selectedGoalIds.length > 0 ? '#ffffff' : '#94a3b8',
              fontSize: '14px', fontWeight: 600,
              border: selectedGoalIds.length > 0 ? '1px solid #ef4444' : '1px solid #e2e8f0',
              cursor: selectedGoalIds.length > 0 ? 'pointer' : 'not-allowed',
              opacity: selectedGoalIds.length > 0 ? 1 : 0.6,
              transition: 'all 0.2s'
            }}
          >
            <Trash2 size={16} />
            <span>Delete</span>
          </button>

          {/* Export - Dark Gray */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 18px', borderRadius: '12px',
                backgroundColor: '#334155', color: '#ffffff',
                fontSize: '14px', fontWeight: 600, border: 'none',
                cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                transition: 'background-color 0.2s'
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

        {/* Right Side Search */}
        <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
          <input
            type="text"
            placeholder="Search Goals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', paddingLeft: '40px', paddingRight: searchTerm ? '36px' : '16px',
              paddingTop: '10px', paddingBottom: '10px',
              backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px',
              fontSize: '14px', outline: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'border-color 0.2s, box-shadow 0.2s'
            }}
            onFocus={e => { e.target.style.borderColor = '#10b981'; e.target.style.boxShadow = '0 0 0 3px rgba(16,185,129,0.1)'; }}
            onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)'; }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '2px' }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Goals Table Card */}
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
                    checked={filteredGoals.length > 0 && selectedGoalIds.length === filteredGoals.length}
                    onChange={handleSelectAll}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#10b981' }}
                  />
                </th>
                {['Goal Name', 'Department', 'Target CO₂', 'Current CO₂', 'Progress', 'Deadline', 'Status', 'Actions'].map((h, i) => (
                  <th key={h} style={{
                    padding: '14px 16px', fontSize: '11px', fontWeight: 700,
                    color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em',
                    textAlign: ['Target CO₂', 'Current CO₂'].includes(h) ? 'right' : h === 'Actions' ? 'center' : 'left',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredGoals.length > 0 ? (
                filteredGoals.map((goal) => {
                  const rawProgress = goal.targetCo2 > 0 ? Math.round((goal.currentCo2 / goal.targetCo2) * 100) : 0;
                  const progressVal = Math.min(rawProgress, 100);
                  const isChecked = selectedGoalIds.includes(goal.id);

                  return (
                    <tr
                      key={goal.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: isChecked ? '#f0fdf4' : 'transparent',
                        transition: 'background-color 0.15s'
                      }}
                      onMouseEnter={e => { if (!isChecked) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                      onMouseLeave={e => { if (!isChecked) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectOne(goal.id)}
                          style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#10b981' }}
                        />
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          onClick={() => setViewingGoal(goal)}
                          style={{ fontWeight: 600, color: '#1e293b', fontSize: '14px', cursor: 'pointer', transition: 'color 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.color = '#059669'}
                          onMouseLeave={e => e.currentTarget.style.color = '#1e293b'}
                        >
                          {goal.name}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#475569', fontSize: '14px', fontWeight: 500 }}>
                        {goal.department}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', color: '#334155', fontSize: '14px', fontWeight: 600 }}>
                        {goal.targetCo2.toLocaleString()} t
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', color: '#334155', fontSize: '14px', fontWeight: 600 }}>
                        {goal.currentCo2.toLocaleString()} t
                      </td>
                      <td style={{ padding: '14px 16px', width: '170px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '96px', height: '8px', backgroundColor: '#e2e8f0',
                            borderRadius: '9999px', overflow: 'hidden', flexShrink: 0
                          }}>
                            <div style={{
                              width: `${progressVal}%`, height: '100%',
                              background: 'linear-gradient(to right, #34d399, #10b981)',
                              borderRadius: '9999px',
                              transition: 'width 1s ease-out'
                            }}></div>
                          </div>
                          <span style={{ color: '#334155', fontSize: '12px', fontWeight: 700, width: '32px' }}>
                            {progressVal}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
                        {goal.deadline}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {getStatusBadge(goal.status)}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <button
                            title="View"
                            onClick={() => setViewingGoal(goal)}
                            style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            title="Edit"
                            onClick={() => handleOpenEditModal(goal)}
                            style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8', transition: 'all 0.15s' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fffbeb'; e.currentTarget.style.color = '#d97706'; }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            title="Delete"
                            onClick={() => handleOpenDeleteConfirm(goal)}
                            style={{ padding: '6px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8', transition: 'all 0.15s' }}
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
                  <td colSpan="9" style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                    <p style={{ fontWeight: 600, color: '#475569', marginBottom: '4px' }}>No goals found</p>
                    <p style={{ fontSize: '12px' }}>Try adjusting your search or add a new goal.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Goal Add/Edit Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingGoal(null); }}
        onSave={handleSaveGoal}
        goal={editingGoal}
      />

      {/* View Goal Details Modal */}
      {viewingGoal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setViewingGoal(null)}></div>
          <div style={{
            backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '500px',
            padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0',
            zIndex: 10, margin: '0 16px', position: 'relative', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <button
              onClick={() => setViewingGoal(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>{viewingGoal.name}</h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, margin: 0 }}>ID: {viewingGoal.id}</p>
              </div>
            </div>

            <div style={{ padding: '12px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Department</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>{viewingGoal.department}</span>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Status</span>
                  {getStatusBadge(viewingGoal.status)}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Target Emissions</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{viewingGoal.targetCo2.toLocaleString()} t CO₂</span>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Current Emissions</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{viewingGoal.currentCo2.toLocaleString()} t CO₂</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Progress</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, backgroundColor: '#e2e8f0', borderRadius: '9999px', height: '12px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(Math.round((viewingGoal.currentCo2 / viewingGoal.targetCo2) * 100), 100)}%`,
                      height: '100%', background: 'linear-gradient(to right, #34d399, #10b981)',
                      borderRadius: '9999px'
                    }}></div>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                    {Math.min(Math.round((viewingGoal.currentCo2 / viewingGoal.targetCo2) * 100), 100)}%
                  </span>
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px', color: '#475569',
                backgroundColor: '#f8fafc', padding: '10px', borderRadius: '12px', fontSize: '14px', border: '1px solid #f1f5f9'
              }}>
                <Calendar size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
                <span>Deadline: <strong style={{ color: '#334155', fontWeight: 600 }}>{viewingGoal.deadline}</strong></span>
              </div>

              {viewingGoal.description && (
                <div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Description</span>
                  <p style={{
                    fontSize: '14px', color: '#475569', backgroundColor: '#f8fafc',
                    padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9',
                    lineHeight: 1.6, margin: 0, maxHeight: '160px', overflowY: 'auto'
                  }}>
                    {viewingGoal.description}
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px' }}>
              <button
                onClick={() => setViewingGoal(null)}
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

      {/* Delete Confirmation Modal */}
      {deletingGoal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setDeletingGoal(null)}></div>
          <div style={{
            backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '440px',
            padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0',
            zIndex: 10, margin: '0 16px', position: 'relative'
          }}>
            <button
              onClick={() => setDeletingGoal(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '16px' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#fef2f2',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', flexShrink: 0
              }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>Delete Environmental Goal</h3>
                <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                  Are you sure you want to delete <strong style={{ color: '#334155', fontWeight: 600 }}>{deletingGoal.name}</strong>? This action cannot be undone.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', marginTop: '24px' }}>
              <button
                onClick={() => setDeletingGoal(null)}
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

export default GoalTable;
