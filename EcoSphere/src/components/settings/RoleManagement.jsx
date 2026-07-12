import React, { useState } from 'react';
import { initialRoles } from '../../data/settingsData';
import { Shield, Plus, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '../reports/ToastNotifications';

const RoleManagement = () => {
  const [roles, setRoles] = useState(initialRoles);
  const [activeRole, setActiveRole] = useState(initialRoles[0]);
  const { addToast } = useToast();

  const allPermissions = [
    'Dashboard', 'Environmental', 'Social', 'Governance', 'Gamification', 'Reports', 'Settings'
  ];

  const handlePermissionToggle = (permission) => {
    if (activeRole.name === 'Admin') {
      addToast('Cannot modify Admin permissions', 'error');
      return;
    }
    
    const updatedPermissions = activeRole.permissions.includes(permission)
      ? activeRole.permissions.filter(p => p !== permission)
      : [...activeRole.permissions, permission];
      
    const updatedRole = { ...activeRole, permissions: updatedPermissions };
    setActiveRole(updatedRole);
    setRoles(roles.map(r => r.id === updatedRole.id ? updatedRole : r));
    addToast('Permissions updated', 'success');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-6">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Shield size={20} className="text-slate-500" />
            Role & Permission Management
          </h3>
          <p className="text-sm text-slate-500 mt-1">Configure access control across the platform.</p>
        </div>
        <button className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
          <Plus size={16} /> Add Role
        </button>
      </div>

      <div className="flex flex-col md:flex-row min-h-[300px]">
        {/* Roles List */}
        <div className="w-full md:w-1/3 border-r border-slate-200 bg-slate-50/50 p-4 space-y-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">System Roles</h4>
          {roles.map(role => (
            <button
              key={role.id}
              onClick={() => setActiveRole(role)}
              className={`w-full text-left px-4 py-3 rounded-xl flex items-center justify-between group transition-colors ${
                activeRole.id === role.id 
                  ? 'bg-white shadow-sm border border-slate-200' 
                  : 'hover:bg-slate-100 border border-transparent'
              }`}
            >
              <span className={`font-medium text-sm ${activeRole.id === role.id ? 'text-slate-800' : 'text-slate-600'}`}>
                {role.name}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit2 size={14} className="text-slate-400 hover:text-blue-600" />
                {role.name !== 'Admin' && <Trash2 size={14} className="text-slate-400 hover:text-red-600" />}
              </div>
            </button>
          ))}
        </div>

        {/* Permissions Checklist */}
        <div className="w-full md:w-2/3 p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-base font-bold text-slate-800">Permissions for "{activeRole.name}"</h4>
            <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200">
              {activeRole.permissions.length} / {allPermissions.length} Granted
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {allPermissions.map(permission => {
              const isGranted = activeRole.permissions.includes(permission);
              const isAdmin = activeRole.name === 'Admin';
              
              return (
                <div 
                  key={permission}
                  onClick={() => handlePermissionToggle(permission)}
                  className={`flex items-center p-3 rounded-lg border transition-colors cursor-pointer ${
                    isGranted ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                  } ${isAdmin ? 'opacity-70 cursor-not-allowed' : 'hover:border-slate-300'}`}
                >
                  <div className="flex-shrink-0 mr-3">
                    <input 
                      type="checkbox"
                      checked={isGranted}
                      readOnly
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-600 accent-emerald-600 cursor-pointer pointer-events-none"
                    />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${isGranted ? 'text-emerald-800' : 'text-slate-600'}`}>
                      {permission} Access
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isGranted ? 'Can view and modify' : 'No access granted'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;
