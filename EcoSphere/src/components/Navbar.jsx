import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, X, Check, Trash2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Navbar = ({ notifications = [], setNotifications }) => {
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  let pageTitle = 'EcoSphere Dashboard';
  if (location.pathname === '/social') {
    pageTitle = 'Social : CSR & Employee Engagement';
  } else if (location.pathname === '/environmental') {
    pageTitle = 'Environmental';
  } else if (location.pathname === '/governance') {
    pageTitle = 'Governance : Compliance & Policies';
  } else if (location.pathname === '/gamification') {
    pageTitle = 'Gamification : Employee Engagement';
  }

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleToggleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: !n.unread } : n));
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-30 w-full">
      <h1 className="text-xl font-semibold text-slate-800">{pageTitle}</h1>
      
      <div className="flex items-center gap-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white focus:border-emerald-500 transition-all w-64"
          />
        </div>
        
        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              padding: '8px',
              borderRadius: '50%',
              backgroundColor: showDropdown ? '#f1f5f9' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={e => { if(!showDropdown) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
            onMouseLeave={e => { if(!showDropdown) e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span 
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '2px',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  fontSize: '9px',
                  fontWeight: 700,
                  borderRadius: '50%',
                  width: '15px',
                  height: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #ffffff'
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div 
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: '12px',
                width: '320px',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 12px 30px rgba(15,23,42,0.12)',
                zIndex: 40,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Dropdown Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Notifications</h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      style={{ fontSize: '11px', fontWeight: 600, color: '#059669', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                    >
                      <Check size={12} /> Read All
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button 
                      onClick={handleClearAll}
                      style={{ fontSize: '11px', fontWeight: 600, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                    >
                      <Trash2 size={12} /> Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Dropdown List */}
              <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div 
                      key={n.id}
                      onClick={() => handleToggleRead(n.id)}
                      style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: n.unread ? '#f0fdf4' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                      onMouseEnter={e => { if(!n.unread) e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                      onMouseLeave={e => { if(!n.unread) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                        <p style={{ fontSize: '13px', color: '#334155', fontWeight: n.unread ? 600 : 500, margin: 0, lineHeight: 1.4 }}>
                          {n.text}
                        </p>
                        {n.unread && (
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', flexShrink: 0, marginTop: '5px' }}></span>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>{n.time}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', margin: '0 0 2px 0' }}>All caught up!</p>
                    <p style={{ fontSize: '12px', margin: 0 }}>You have no notifications.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* User Info */}
        <div className="flex items-center gap-3 border-l border-slate-200 pl-6 cursor-pointer">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-slate-700">Jane Doe</p>
            <p className="text-xs text-slate-500">Admin</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border-2 border-emerald-200">
            JD
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
