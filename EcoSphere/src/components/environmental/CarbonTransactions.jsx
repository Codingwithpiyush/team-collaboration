import React, { useState, useMemo } from 'react';
import { Plus, Search, X, Filter, Coins, CheckCircle2, AlertCircle, Calculator } from 'lucide-react';

const CarbonTransactions = ({ carbonTransactions, setCarbonTransactions, emissionFactors }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [formData, setFormData] = useState({ department: 'Logistics', source: 'Fleet', emissionFactorId: '', quantity: '', calculatedCo2: '', date: new Date().toISOString().split('T')[0], status: 'Approved' });
  const [errors, setErrors] = useState({});

  const showToast = (msg) => { setToastMessage(msg); setTimeout(() => setToastMessage(''), 3000); };

  const filteredTransactions = useMemo(() => {
    return carbonTransactions.filter(tx => {
      const t = searchTerm.toLowerCase();
      const matchSearch = tx.id.toLowerCase().includes(t) || tx.department.toLowerCase().includes(t) || tx.source.toLowerCase().includes(t) || tx.emissionFactor.toLowerCase().includes(t);
      const matchStatus = statusFilter === 'All' || tx.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [carbonTransactions, searchTerm, statusFilter]);

  const handleOpenModal = () => {
    const df = emissionFactors && emissionFactors.length > 0 ? emissionFactors[0] : null;
    setFormData({ department: 'Logistics', source: 'Fleet', emissionFactorId: df ? df.id : '', quantity: '', calculatedCo2: '', date: new Date().toISOString().split('T')[0], status: 'Approved' });
    setErrors({}); setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if ((name === 'emissionFactorId' || name === 'quantity') && updated.emissionFactorId && updated.quantity) {
        const factor = emissionFactors.find(f => f.id === updated.emissionFactorId);
        const qty = parseFloat(updated.quantity);
        if (factor && !isNaN(qty) && qty > 0) { updated.calculatedCo2 = Number(((qty * factor.emissionValue) / 1000).toFixed(2)); }
        else { updated.calculatedCo2 = ''; }
      }
      return updated;
    });
  };

  const validate = () => {
    const e = {};
    if (!formData.emissionFactorId) e.emissionFactorId = 'Required';
    if (isNaN(parseFloat(formData.quantity)) || parseFloat(formData.quantity) <= 0) e.quantity = 'Must be positive';
    if (isNaN(parseFloat(formData.calculatedCo2)) || parseFloat(formData.calculatedCo2) <= 0) e.calculatedCo2 = 'Must be positive';
    if (!formData.date) e.date = 'Required';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault(); if (!validate()) return;
    const selectedFactor = emissionFactors.find(f => f.id === formData.emissionFactorId);
    const rec = { id: 'TX-' + (1000 + carbonTransactions.length + 1), department: formData.department, source: formData.source, emissionFactor: selectedFactor ? selectedFactor.name : 'Unknown', calculatedCo2: parseFloat(formData.calculatedCo2), date: formData.date, status: formData.status };
    setCarbonTransactions(p => [rec, ...p]);
    showToast(`Logged ${rec.id} successfully`);
    setIsModalOpen(false);
  };

  const getStatusBadge = (status) => {
    if (status === 'Approved') return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', fontSize: '12px', fontWeight: 600, borderRadius: '9999px', backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }}>
        <CheckCircle2 size={12} />Approved
      </span>
    );
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', fontSize: '12px', fontWeight: 600, borderRadius: '9999px', backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}>
        <AlertCircle size={12} />Pending
      </span>
    );
  };

  const departments = ['Logistics', 'Manufacturing', 'Corporate', 'R&D', 'Sales'];
  const sources = ['Fleet', 'Electricity', 'Expenses', 'Travel', 'Manufacturing', 'Office Supply'];
  const inputStyle = (hasErr) => ({ width: '100%', padding: '10px 16px', borderRadius: '12px', border: `1px solid ${hasErr ? '#fca5a5' : '#e2e8f0'}`, backgroundColor: '#f8fafc', fontSize: '14px', outline: 'none', boxSizing: 'border-box' });
  const labelStyle = { display: 'block', fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '6px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '16px', right: '16px', zIndex: 50, backgroundColor: '#0f172a', color: '#fff', padding: '12px 20px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: 500 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>{toastMessage}
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={handleOpenModal} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px', backgroundColor: '#059669', color: '#fff', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 1px 3px rgba(5,150,105,0.3)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#047857'} onMouseLeave={e => e.currentTarget.style.backgroundColor = '#059669'}>
            <Plus size={16} /><span>Log Transaction</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fff', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
            <Filter size={16} style={{ color: '#94a3b8' }} />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ fontSize: '14px', fontWeight: 600, color: '#475569', backgroundColor: 'transparent', border: 'none', outline: 'none', cursor: 'pointer' }}>
              <option value="All">All Statuses</option><option value="Approved">Approved</option><option value="Pending">Pending</option>
            </select>
          </div>
        </div>
        <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
          <input type="text" placeholder="Search transactions..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '40px', paddingRight: '16px', paddingTop: '10px', paddingBottom: '10px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', outline: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Transaction ID', 'Department', 'Source', 'Emission Factor', 'Calculated CO₂', 'Date', 'Status'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: h === 'Calculated CO₂' ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? filteredTransactions.map(tx => (
                <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#64748b', flexShrink: 0 }}><Coins size={16} /></div>
                      <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '14px' }}>{tx.id}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#334155', fontSize: '14px', fontWeight: 600 }}>{tx.department}</td>
                  <td style={{ padding: '14px 16px', color: '#475569', fontSize: '14px', fontWeight: 500 }}>{tx.source}</td>
                  <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '14px', fontWeight: 500 }}>{tx.emissionFactor}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: '#1e293b', fontSize: '14px' }}>{tx.calculatedCo2.toLocaleString()} t</td>
                  <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '14px', fontWeight: 500 }}>{tx.date}</td>
                  <td style={{ padding: '14px 16px' }}>{getStatusBadge(tx.status)}</td>
                </tr>
              )) : (
                <tr><td colSpan="7" style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}><p style={{ fontWeight: 600, color: '#475569', marginBottom: '4px' }}>No transactions found</p><p style={{ fontSize: '12px' }}>Log a transaction to start tracking.</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Transaction Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }} onClick={() => setIsModalOpen(false)}></div>
          <div style={{ backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '480px', padding: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0', zIndex: 10, margin: '0 16px', position: 'relative' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: '#94a3b8' }}><X size={20} /></button>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '24px', marginTop: 0 }}>Log Carbon Transaction</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div><label style={labelStyle}>Department</label><select name="department" value={formData.department} onChange={handleFormChange} style={inputStyle(false)}>{departments.map(d => <option key={d} value={d}>{d}</option>)}</select></div>
                <div><label style={labelStyle}>Source Type</label><select name="source" value={formData.source} onChange={handleFormChange} style={inputStyle(false)}>{sources.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              </div>
              <div>
                <label style={labelStyle}>Emission Factor Reference</label>
                <select name="emissionFactorId" value={formData.emissionFactorId} onChange={handleFormChange} style={inputStyle(errors.emissionFactorId)}>
                  <option value="" disabled>Select factor...</option>
                  {emissionFactors.map(f => <option key={f.id} value={f.id}>{f.name} ({f.emissionValue} {f.unit})</option>)}
                </select>
                {errors.emissionFactorId && <p style={{ fontSize: '12px', color: '#ef4444', margin: '4px 0 0' }}>{errors.emissionFactorId}</p>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div><label style={labelStyle}>Quantity</label><input type="number" name="quantity" value={formData.quantity} onChange={handleFormChange} placeholder="e.g. 500" style={inputStyle(errors.quantity)} />{errors.quantity && <p style={{ fontSize: '12px', color: '#ef4444', margin: '4px 0 0' }}>{errors.quantity}</p>}</div>
                <div>
                  <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '4px' }}><Calculator size={14} style={{ color: '#94a3b8' }} /><span>Calculated CO₂ (t)</span></label>
                  <input type="number" name="calculatedCo2" value={formData.calculatedCo2} onChange={handleFormChange} placeholder="Auto-calculated" style={{ ...inputStyle(errors.calculatedCo2), backgroundColor: '#f1f5f9', fontWeight: 600 }} />
                  {errors.calculatedCo2 && <p style={{ fontSize: '12px', color: '#ef4444', margin: '4px 0 0' }}>{errors.calculatedCo2}</p>}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div><label style={labelStyle}>Transaction Date</label><input type="date" name="date" value={formData.date} onChange={handleFormChange} style={inputStyle(errors.date)} />{errors.date && <p style={{ fontSize: '12px', color: '#ef4444', margin: '4px 0 0' }}>{errors.date}</p>}</div>
                <div><label style={labelStyle}>Status</label><select name="status" value={formData.status} onChange={handleFormChange} style={inputStyle(false)}><option value="Approved">Approved</option><option value="Pending">Pending</option></select></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', marginTop: '8px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '14px', fontWeight: 600, color: '#475569', backgroundColor: '#fff', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: 600, color: '#fff', backgroundColor: '#059669', cursor: 'pointer', boxShadow: '0 1px 3px rgba(5,150,105,0.3)' }}>Log Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarbonTransactions;
