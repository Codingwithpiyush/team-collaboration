import React, { useState } from 'react';
import { initialRoles } from '../../data/settingsData';
import { Shield, Plus, Edit2, Trash2, X } from 'lucide-react';
import { useToast } from '../reports/ToastNotifications';

const ALL_PERMISSIONS = [
  'Dashboard', 'Environmental', 'Social', 'Governance', 'Gamification', 'Reports', 'Settings'
];

const RoleManagement = () => {
  const [roles, setRoles] = useState(initialRoles);
  const [activeRole, setActiveRole] = useState(initialRoles[0]);
  const { addToast } = useToast();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null); // null = adding, object = editing
  const [modalName, setModalName] = useState('');
  const [modalPermissions, setModalPermissions] = useState([]);

  // ── Modal helpers ──────────────────────────────────────────────
  const openAddModal = () => {
    setEditingRole(null);
    setModalName('');
    setModalPermissions([]);
    setModalOpen(true);
  };

  const openEditModal = (role, e) => {
    e.stopPropagation(); // prevent selecting the role
    setEditingRole(role);
    setModalName(role.name);
    setModalPermissions([...role.permissions]);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingRole(null);
    setModalName('');
    setModalPermissions([]);
  };

  const toggleModalPermission = (perm) => {
    setModalPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleModalSave = () => {
    const trimmed = modalName.trim();
    if (!trimmed) {
      addToast('Role name is required', 'error');
      return;
    }

    if (editingRole) {
      // ── Update existing role ──
      const updated = { ...editingRole, name: trimmed, permissions: modalPermissions };
      const newRoles = roles.map((r) => (r.id === editingRole.id ? updated : r));
      setRoles(newRoles);
      if (activeRole.id === editingRole.id) setActiveRole(updated);
      addToast(`Role "${trimmed}" updated successfully`, 'success');
    } else {
      // ── Create new role ──
      const newRole = {
        id: `ROLE-${String(Date.now()).slice(-4)}`,
        name: trimmed,
        permissions: modalPermissions,
      };
      const newRoles = [...roles, newRole];
      setRoles(newRoles);
      setActiveRole(newRole);
      addToast(`Role "${trimmed}" created successfully`, 'success');
    }
    closeModal();
  };

  // ── Delete ─────────────────────────────────────────────────────
  const handleDelete = (role, e) => {
    e.stopPropagation();
    if (role.name === 'Admin') {
      addToast('Cannot delete Admin role', 'error');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete the "${role.name}" role?`)) return;
    const newRoles = roles.filter((r) => r.id !== role.id);
    setRoles(newRoles);
    if (activeRole.id === role.id) setActiveRole(newRoles[0]);
    addToast(`Role "${role.name}" deleted`, 'success');
  };

  // ── Inline permission toggle (existing behaviour) ─────────────
  const handlePermissionToggle = (permission) => {
    if (activeRole.name === 'Admin') {
      addToast('Cannot modify Admin permissions', 'error');
      return;
    }

    const updatedPermissions = activeRole.permissions.includes(permission)
      ? activeRole.permissions.filter((p) => p !== permission)
      : [...activeRole.permissions, permission];

    const updatedRole = { ...activeRole, permissions: updatedPermissions };
    setActiveRole(updatedRole);
    setRoles(roles.map((r) => (r.id === updatedRole.id ? updatedRole : r)));
    addToast('Permissions updated', 'success');
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-6">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Shield size={20} className="text-slate-500" />
              Role &amp; Permission Management
            </h3>
            <p className="text-sm text-slate-500 mt-1">Configure access control across the platform.</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} /> Add Role
          </button>
        </div>

        <div className="flex flex-col md:flex-row min-h-[300px]">
          {/* Roles List */}
          <div className="w-full md:w-1/3 border-r border-slate-200 bg-slate-50/50 p-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">System Roles</h4>
            {roles.map((role) => (
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
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => openEditModal(role, e)}
                    onKeyDown={(e) => { if (e.key === 'Enter') openEditModal(role, e); }}
                    className="p-1 rounded hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <Edit2 size={14} className="text-slate-400 hover:text-blue-600" />
                  </span>
                  {role.name !== 'Admin' && (
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => handleDelete(role, e)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleDelete(role, e); }}
                      className="p-1 rounded hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} className="text-slate-400 hover:text-red-600" />
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Permissions Checklist */}
          <div className="w-full md:w-2/3 p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-base font-bold text-slate-800">Permissions for &quot;{activeRole.name}&quot;</h4>
              <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200">
                {activeRole.permissions.length} / {ALL_PERMISSIONS.length} Granted
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ALL_PERMISSIONS.map((permission) => {
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

      {/* ── Add / Edit Role Modal ───────────────────────────────── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', backgroundColor: 'rgba(0,0,0,0.35)' }}
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">
                {editingRole ? 'Edit Role' : 'Add New Role'}
              </h3>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-5">
              {/* Role Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Role Name</label>
                <input
                  type="text"
                  value={modalName}
                  onChange={(e) => setModalName(e.target.value)}
                  placeholder="e.g. Viewer, Analyst…"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition"
                  autoFocus
                />
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_PERMISSIONS.map((perm) => (
                    <label
                      key={perm}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-colors ${
                        modalPermissions.includes(perm)
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={modalPermissions.includes(perm)}
                        onChange={() => toggleModalPermission(perm)}
                        className="w-4 h-4 rounded border-slate-300 accent-emerald-600"
                      />
                      {perm}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/50">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSave}
                className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                {editingRole ? 'Save Changes' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RoleManagement;
