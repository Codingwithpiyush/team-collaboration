import React, { useState, useEffect } from 'react';
import ReportCard from '../components/reports/ReportCard';
import CustomReportBuilder from '../components/reports/CustomReportBuilder';
import ReportPreview from '../components/reports/ReportPreview';
import RecentReports from '../components/reports/RecentReports';
import AIInsights from '../components/reports/AIInsights';
import ReportAnalytics from '../components/reports/ReportAnalytics';
import ScheduleReportCard from '../components/reports/ScheduleReportCard';
import ExecutiveSummaryCard from '../components/reports/ExecutiveSummaryCard';
import ReportHistory from '../components/reports/ReportHistory';
import { ToastProvider } from '../components/reports/ToastNotifications';
import { reportCardsData } from '../data/reportsData';

const ReportsPageContent = ({ activeTab, setActiveTab }) => {
  const tabs = ['Environmental', 'Social', 'Governance', 'ESG Summary', 'Custom Builder'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Reports : Analytics & Custom Report Builder</h2>
          <p className="text-sm text-slate-500 mt-1">Generate ESG reports, analyze sustainability performance and export insights.</p>
        </div>
        
        {/* Horizontal Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab || (tab === 'Environmental' && activeTab === 'Environmental Report') || (tab === 'Social' && activeTab === 'Social Report') || (tab === 'Governance' && activeTab === 'Governance Report') 
                  ? 'bg-blue-600 text-white border border-blue-600 shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-800 shadow-sm'
              }`}
            >
              {tab === 'Environmental Report' ? 'Environmental' : 
               tab === 'Social Report' ? 'Social' : 
               tab === 'Governance Report' ? 'Governance' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Analytics KPI Row */}
      <ReportAnalytics />

      {/* Main Content Area based on Tab */}
      {activeTab !== 'Custom Builder' && activeTab !== 'Custom Report Builder' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 md:col-span-3">
              <ExecutiveSummaryCard />
            </div>
            <div className="lg:col-span-3 md:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportCardsData
                .filter(report => {
                  if (activeTab === 'Environmental') return report.type === 'environmental';
                  if (activeTab === 'Social') return report.type === 'social';
                  if (activeTab === 'Governance') return report.type === 'governance';
                  if (activeTab === 'ESG Summary') return report.type === 'summary';
                  return true; // Fallback
                })
                .map(report => (
                  <ReportCard key={report.id} report={report} />
                ))}
                
              {/* Add the report preview to fill the remaining 2 columns of space on these specific tabs */}
              <div className="lg:col-span-2 md:col-span-2">
                <ReportPreview />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-4">
              <CustomReportBuilder />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 xl:col-span-7">
              <ReportPreview />
            </div>
            <div className="lg:col-span-3 xl:col-span-3">
              <AIInsights />
            </div>
            <div className="lg:col-span-3 xl:col-span-2">
              <ScheduleReportCard />
            </div>
          </div>

          <div>
            <RecentReports />
          </div>
          
          <div>
            <ReportHistory />
          </div>
        </>
      )}
    </div>
  );
};

const ReportsPage = ({ activeTab: initialActiveTab }) => {
  const [activeTab, setActiveTab] = useState(initialActiveTab || 'Custom Builder');

  useEffect(() => {
    if (initialActiveTab) {
      setActiveTab(initialActiveTab);
    }
  }, [initialActiveTab]);

  return (
    <ToastProvider>
      <ReportsPageContent activeTab={activeTab} setActiveTab={setActiveTab} />
    </ToastProvider>
  );
};

export default ReportsPage;
