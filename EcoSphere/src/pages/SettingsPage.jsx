import React, { useState, useEffect } from 'react';
import DepartmentTable from '../components/settings/DepartmentTable';
import CategoriesTable from '../components/settings/CategoriesTable';
import ESGConfiguration from '../components/settings/ESGConfiguration';
import NotificationSettings from '../components/settings/NotificationSettings';
import SystemHealth from '../components/settings/SystemHealth';
import ActivityTimeline from '../components/settings/ActivityTimeline';
import CompanyProfile from '../components/settings/CompanyProfile';
import RoleManagement from '../components/settings/RoleManagement';
import BackupManager from '../components/settings/BackupManager';
import ThemeSettings from '../components/settings/ThemeSettings';
import ScoreWeightSettings from '../components/settings/ScoreWeightSettings';
import { ToastProvider } from '../components/reports/ToastNotifications'; // Reusing ToastProvider from reports!

const SettingsPageContent = ({ activeTab, setActiveTab }) => {
  const tabs = ['Departments', 'Categories', 'ESG Configuration', 'Notification Settings'];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Settings : Configuration & Administration</h2>
          <p className="text-slate-500 mt-1">Manage departments, ESG configuration and platform settings.</p>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Main Content) - Takes up 2/3 space */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors flex-1 text-center min-w-[120px] ${
                  activeTab === tab 
                    ? 'bg-slate-800 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Dynamic Tab Content */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {activeTab === 'Departments' && <DepartmentTable />}
            {activeTab === 'Categories' && <CategoriesTable />}
            {activeTab === 'ESG Configuration' && <ESGConfiguration />}
            {activeTab === 'Notification Settings' && <NotificationSettings />}
          </div>

          {/* Role Management Component (always visible or part of a tab? Let's put it below the main content if on Departments or just at bottom of main column) */}
          <RoleManagement />
          
          <BackupManager />

        </div>

        {/* Right Column (Widgets) - Takes up 1/3 space */}
        <div className="space-y-6">
          <CompanyProfile />
          <SystemHealth />
          <ScoreWeightSettings />
          <ThemeSettings />
          <ActivityTimeline />
        </div>

      </div>
    </div>
  );
};

const SettingsPage = ({ activeTab: initialActiveTab }) => {
  const [activeTab, setActiveTab] = useState(initialActiveTab || 'Departments');

  useEffect(() => {
    if (initialActiveTab && ['Departments', 'Categories', 'ESG Configuration', 'Notification Settings'].includes(initialActiveTab)) {
      setActiveTab(initialActiveTab);
    }
  }, [initialActiveTab]);

  return (
    <ToastProvider>
      <SettingsPageContent activeTab={activeTab} setActiveTab={setActiveTab} />
    </ToastProvider>
  );
};

export default SettingsPage;
