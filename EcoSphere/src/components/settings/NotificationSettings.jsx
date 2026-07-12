import React, { useState, useEffect } from 'react';
import { useToast } from '../reports/ToastNotifications';
import { BASE_API_URL } from '../../config';
import { Loader2, Search, ChevronLeft, ChevronRight, BellRing } from 'lucide-react';

const NotificationSettings = () => {
  const { addToast } = useToast();
  const [preferences, setPreferences] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotificationSettings = async () => {
    setIsLoading(true);
    try {
      // Endpoint is GET /api/users/notification-settings/
      let url = `${BASE_API_URL}/api/users/notification-settings/?page=${currentPage}`;
      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPreferences(data.results || []);
        setTotalCount(data.count || 0);
        setTotalPages(Math.ceil((data.count || 0) / 10)); // standard limit is 10
      }
    } catch (e) {
      console.error(e);
      addToast('Failed to load employee notification settings.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationSettings();
  }, [currentPage, searchTerm]);

  const handleTogglePreference = async (prefId, field, currentValue) => {
    const newValue = !currentValue;

    // Optimistically update UI
    setPreferences(prev => 
      prev.map(p => p.id === prefId ? { ...p, [field]: newValue } : p)
    );

    try {
      const res = await fetch(`${BASE_API_URL}/api/users/notification-settings/${prefId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [field]: newValue
        })
      });

      if (res.ok) {
        addToast('Notification preferences updated successfully', 'success');
      } else {
        // Revert
        setPreferences(prev => 
          prev.map(p => p.id === prefId ? { ...p, [field]: currentValue } : p)
        );
        addToast('Failed to save settings changes on server.', 'error');
      }
    } catch (e) {
      // Revert
      setPreferences(prev => 
        prev.map(p => p.id === prefId ? { ...p, [field]: currentValue } : p)
      );
      addToast('Connection failure to update settings.', 'error');
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BellRing size={20} className="text-slate-500" />
            Notification Preferences
          </h3>
          <p className="text-sm text-slate-500 mt-1">Configure notification delivery channels by employee profiles.</p>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search employee..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800/20 w-full sm:w-56"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center gap-2">
            <Loader2 className="animate-spin text-slate-500" size={28} />
            <span className="text-sm font-semibold text-slate-500">Querying preferences...</span>
          </div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Employee Name</th>
                <th className="px-4 py-4 text-center">Global Email</th>
                <th className="px-4 py-4 text-center">Badges</th>
                <th className="px-4 py-4 text-center">CSR Activity</th>
                <th className="px-4 py-4 text-center">Challenges</th>
                <th className="px-4 py-4 text-center">Policy Reminders</th>
                <th className="px-4 py-4 text-center">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {preferences.map((pref) => (
                <tr key={pref.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{pref.employee_name}</td>
                  
                  {/* Email Toggle */}
                  <td className="px-4 py-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={pref.email_notifications}
                      onChange={() => handleTogglePreference(pref.id, 'email_notifications', pref.email_notifications)}
                      className="w-4 h-4 text-slate-800 rounded border-slate-300 focus:ring-slate-800 cursor-pointer accent-slate-800"
                    />
                  </td>

                  {/* Badge Toggle */}
                  <td className="px-4 py-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={pref.badge_notifications}
                      onChange={() => handleTogglePreference(pref.id, 'badge_notifications', pref.badge_notifications)}
                      className="w-4 h-4 text-slate-800 rounded border-slate-300 focus:ring-slate-800 cursor-pointer accent-slate-800"
                    />
                  </td>

                  {/* CSR Toggle */}
                  <td className="px-4 py-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={pref.csr_notifications}
                      onChange={() => handleTogglePreference(pref.id, 'csr_notifications', pref.csr_notifications)}
                      className="w-4 h-4 text-slate-800 rounded border-slate-300 focus:ring-slate-800 cursor-pointer accent-slate-800"
                    />
                  </td>

                  {/* Challenge Toggle */}
                  <td className="px-4 py-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={pref.challenge_notifications}
                      onChange={() => handleTogglePreference(pref.id, 'challenge_notifications', pref.challenge_notifications)}
                      className="w-4 h-4 text-slate-800 rounded border-slate-300 focus:ring-slate-800 cursor-pointer accent-slate-800"
                    />
                  </td>

                  {/* Policy Toggle */}
                  <td className="px-4 py-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={pref.policy_notifications}
                      onChange={() => handleTogglePreference(pref.id, 'policy_notifications', pref.policy_notifications)}
                      className="w-4 h-4 text-slate-800 rounded border-slate-300 focus:ring-slate-800 cursor-pointer accent-slate-800"
                    />
                  </td>

                  {/* Compliance Toggle */}
                  <td className="px-4 py-4 text-center">
                    <input 
                      type="checkbox" 
                      checked={pref.compliance_notifications}
                      onChange={() => handleTogglePreference(pref.id, 'compliance_notifications', pref.compliance_notifications)}
                      className="w-4 h-4 text-slate-800 rounded border-slate-300 focus:ring-slate-800 cursor-pointer accent-slate-800"
                    />
                  </td>
                </tr>
              ))}

              {preferences.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    No settings records returned for employee query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {!isLoading && preferences.length > 0 && (
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50 mt-auto">
          <span>Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} entries</span>
          <div className="flex items-center gap-1">
            <button 
              className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-50 cursor-pointer" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-7 h-7 rounded text-xs font-semibold ${
                  currentPage === page ? 'bg-slate-800 text-white' : 'hover:bg-slate-200 text-slate-600 cursor-pointer'
                }`}
              >
                {page}
              </button>
            ))}
            <button 
              className="p-1.5 rounded hover:bg-slate-200 disabled:opacity-50 cursor-pointer" 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
