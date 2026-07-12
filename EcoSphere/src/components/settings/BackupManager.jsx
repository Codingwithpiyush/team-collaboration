import React, { useState } from 'react';
import { initialBackups } from '../../data/settingsData';
import { HardDriveDownload, DownloadCloud, History, Loader2 } from 'lucide-react';
import { useToast } from '../reports/ToastNotifications';

const BackupManager = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [backups, setBackups] = useState(initialBackups);
  const { addToast } = useToast();

  const handleCreateBackup = () => {
    setIsCreating(true);
    addToast('Starting system backup...', 'info');
    
    // Simulate API call
    setTimeout(() => {
      const newBackup = {
        id: `BK-${102 + backups.length}`,
        date: new Date().toISOString().split('T')[0],
        createdBy: 'Admin',
        size: '1.2 GB',
        status: 'Completed'
      };
      setBackups([newBackup, ...backups]);
      setIsCreating(false);
      addToast('System Backup created successfully!', 'success');
    }, 2000);
  };

  const handleDownload = (id) => {
    addToast(`Downloading backup ${id}...`, 'info');
  };

  const handleRestore = (id) => {
    if(window.confirm(`Are you sure you want to restore backup ${id}? This will overwrite current data.`)) {
      addToast(`System restoration from ${id} started...`, 'info');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mt-6 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <History size={20} className="text-slate-500" />
            Backup & Restore
          </h3>
          <p className="text-sm text-slate-500 mt-1">Manage platform data backups and restoration points.</p>
        </div>
        <button 
          onClick={handleCreateBackup}
          disabled={isCreating}
          className="bg-slate-800 hover:bg-slate-900 disabled:opacity-70 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
        >
          {isCreating ? <Loader2 size={16} className="animate-spin" /> : <HardDriveDownload size={16} />}
          {isCreating ? 'Creating Backup...' : 'Create Backup'}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Backup ID</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Created By</th>
              <th className="px-6 py-4">Size</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {backups.map((backup) => (
              <tr key={backup.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-700">{backup.id}</td>
                <td className="px-6 py-4">{backup.date}</td>
                <td className="px-6 py-4">{backup.createdBy}</td>
                <td className="px-6 py-4 font-medium">{backup.size}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {backup.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button onClick={() => handleRestore(backup.id)} className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">
                      Restore
                    </button>
                    <button onClick={() => handleDownload(backup.id)} className="text-slate-500 hover:text-slate-800 transition-colors" title="Download">
                      <DownloadCloud size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BackupManager;
