import React, { useState, useMemo } from 'react';
import { Search, Trophy, Medal, Star, ArrowUpDown } from 'lucide-react';

const Leaderboard = ({ leaderboard }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All'); // All, Employee, Department
  const [sortBy, setSortBy] = useState('xp'); // xp, rank
  const [sortOrder, setSortOrder] = useState('desc');

  const filteredLeaderboard = useMemo(() => {
    let list = leaderboard.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'All' || item.type === selectedType;
      return matchesSearch && matchesType;
    });

    // Apply Sorting
    return [...list].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      
      if (sortOrder === 'asc') {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });
  }, [leaderboard, searchTerm, selectedType, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getRankMedal = (rank) => {
    if (rank === 1) return <Trophy size={20} style={{ color: '#fbbf24' }} />; // Gold
    if (rank === 2) return <Medal size={20} style={{ color: '#94a3b8' }} />; // Silver
    if (rank === 3) return <Medal size={20} style={{ color: '#b45309' }} />; // Bronze
    return <span style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', width: '20px', display: 'inline-block', textAlign: 'center' }}>{rank}</span>;
  };

  const getRowBackground = (rank) => {
    if (rank === 1) return '#fef3c7'; // Gold tint
    if (rank === 2) return '#f1f5f9'; // Silver tint
    if (rank === 3) return '#fff7ed'; // Bronze tint
    return 'transparent';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top 3 Podiums */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '8px' }}>
        {leaderboard.slice(0, 3).map((podium, index) => {
          const medalIcons = ['🏆', '🥈', '🥉'];
          const colors = ['#f59e0b', '#64748b', '#b45309'];
          const bgColors = ['#fffbeb', '#f8fafc', '#fffaf8'];
          return (
            <div 
              key={podium.id}
              style={{
                backgroundColor: bgColors[index],
                borderRadius: '20px',
                border: `2px solid ${colors[index]}`,
                padding: '24px',
                textAlign: 'center',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <div style={{ fontSize: '48px', lineHeight: 1 }}>{medalIcons[index]}</div>
              <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: colors[index], letterSpacing: '0.05em' }}>
                Rank {index + 1}
              </span>
              <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: '4px 0 0 0' }}>
                {podium.name}
              </h4>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                {podium.type === 'Employee' ? `${podium.department} Department` : 'Group Standings'}
              </span>
              <div style={{ fontSize: '20px', fontWeight: 800, color: colors[index], display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                <Star size={20} fill={colors[index]} style={{ stroke: 'none' }} />
                <span>{podium.xp.toLocaleString()} XP</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toolbar Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Type Selector */}
          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            {['All', 'Employee', 'Department'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                style={{
                  padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                  backgroundColor: selectedType === type ? '#ffffff' : 'transparent',
                  color: selectedType === type ? '#ea580c' : '#64748b',
                  boxShadow: selectedType === type ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                {type === 'All' ? 'All Standings' : type === 'Employee' ? 'Employees' : 'Departments'}
              </button>
            ))}
          </div>
        </div>

        {/* Search stands */}
        <div style={{ position: 'relative', width: '280px', maxWidth: '100%' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
          <input
            type="text"
            placeholder="Search employee or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', paddingLeft: '40px', paddingRight: '16px', paddingTop: '10px', paddingBottom: '10px',
              backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', outline: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }}
          />
        </div>
      </div>

      {/* Leaderboard Table */}
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '16px',
        border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '14px 16px', width: '80px', textAlign: 'center', color: '#64748b', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer' }} onClick={() => handleSort('rank')}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>Rank <ArrowUpDown size={12} /></div>
                </th>
                {['Name / Department', 'Standing Type', 'Department Detail'].map(h => (
                  <th key={h} style={{ padding: '14px 16px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' }}>{h}</th>
                ))}
                <th style={{ padding: '14px 16px', width: '150px', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', cursor: 'pointer', textAlign: 'right' }} onClick={() => handleSort('xp')}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', width: '100%' }}>XP Points <ArrowUpDown size={12} /></div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaderboard.length > 0 ? (
                filteredLeaderboard.map((item) => {
                  const medal = getRankMedal(item.rank);
                  const isPodium = item.rank <= 3;
                  const rowBg = getRowBackground(item.rank);

                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: rowBg,
                        transition: 'background-color 0.15s'
                      }}
                      onMouseEnter={e => { if (!isPodium) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                      onMouseLeave={e => { if (!isPodium) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <td style={{ padding: '14px 16px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {medal}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontWeight: isPodium ? 700 : 600, color: '#1e293b', fontSize: '14px' }}>
                          {item.name}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-block', padding: '3px 8px', fontSize: '11px', fontWeight: 700, borderRadius: '6px',
                          backgroundColor: item.type === 'Employee' ? '#eff6ff' : '#f5f3ff',
                          color: item.type === 'Employee' ? '#1d4ed8' : '#7c3aed',
                          border: `1px solid ${item.type === 'Employee' ? '#bfdbfe' : '#e9d5ff'}`
                        }}>
                          {item.type}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '14px', fontWeight: 500 }}>
                        {item.type === 'Employee' ? item.department : '-'}
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 800, color: '#ea580c', fontSize: '14px' }}>
                        {item.xp.toLocaleString()} XP
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
                    <p style={{ fontWeight: 600, color: '#475569', marginBottom: '4px' }}>No rankings found</p>
                    <p style={{ fontSize: '12px' }}>Try adjusting your search criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
