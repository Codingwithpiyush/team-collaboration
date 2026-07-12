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
import { ToastProvider, useToast } from '../components/reports/ToastNotifications';
import { reportCardsData } from '../data/reportsData';
import { BASE_API_URL } from '../config';

const initialFilters = {
  department: '',
  employee: '',
  module: 'environmental',
  challenge: '',
  category: '',
  startDate: '',
  endDate: '',
  status: ''
};

const ReportsPageContent = ({ activeTab, setActiveTab }) => {
  const { addToast } = useToast();
  const tabs = ['Environmental', 'Social', 'Governance', 'ESG Summary', 'Custom Builder'];

  // API State
  const [filterOptions, setFilterOptions] = useState({
    departments: [],
    employees: [],
    challenges: [],
    categories: [],
    modules: []
  });
  const [filters, setFilters] = useState(initialFilters);
  const [previewData, setPreviewData] = useState(null);
  const [esgSummaryData, setEsgSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(null);

  // Fetch filter dropdown options on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const res = await fetch(`${BASE_API_URL}/api/reports/filter-options/`);
        if (res.ok) {
          const data = await res.json();
          setFilterOptions(data);
        }
      } catch (err) {
        console.error("Error fetching report filter options:", err);
      }
    };
    fetchFilterOptions();
  }, []);

  // Fetch global ESG Index for ExecutiveSummaryCard
  const fetchEsgSummary = async () => {
    try {
      const res = await fetch(`${BASE_API_URL}/api/reports/preview/?module=esg-summary`);
      if (res.ok) {
        const data = await res.json();
        setEsgSummaryData(data);
      }
    } catch (err) {
      console.error("Error fetching ESG summary:", err);
    }
  };

  useEffect(() => {
    fetchEsgSummary();
  }, []);

  // Fetch dynamic preview whenever active tab or filters change
  const fetchActivePreview = async (tabName, filterObj) => {
    setIsLoading(true);
    let moduleParam = 'custom';
    if (tabName === 'Environmental') moduleParam = 'environmental';
    else if (tabName === 'Social') moduleParam = 'social';
    else if (tabName === 'Governance') moduleParam = 'governance';
    else if (tabName === 'ESG Summary') moduleParam = 'esg-summary';
    else if (tabName === 'Custom Builder') moduleParam = filterObj.module || 'custom';

    let url = `${BASE_API_URL}/api/reports/preview/?module=${moduleParam}`;

    // Append filter query params if present
    if (filterObj.department) url += `&department=${filterObj.department}`;
    if (filterObj.employee) url += `&employee=${filterObj.employee}`;
    if (filterObj.status) url += `&status=${filterObj.status}`;
    if (filterObj.startDate) url += `&start_date=${filterObj.startDate}`;
    if (filterObj.endDate) url += `&end_date=${filterObj.endDate}`;
    if (filterObj.challenge) url += `&challenge=${filterObj.challenge}`;
    if (filterObj.category) url += `&category=${filterObj.category}`;

    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPreviewData(data);
      } else {
        setPreviewData(null);
      }
    } catch (err) {
      console.error("Error fetching preview data:", err);
      setPreviewData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivePreview(activeTab, filters);
  }, [activeTab]);

  const handleRun = async () => {
    setLoadingAction('Run');
    await fetchActivePreview(activeTab, filters);
    setLoadingAction(null);
    addToast('Report generated successfully based on filters.', 'success');
  };

  const handleReset = () => {
    setFilters(initialFilters);
    fetchActivePreview(activeTab, initialFilters);
    addToast('Filters reset to default.', 'success');
  };

  const handleExport = async (format) => {
    setLoadingAction(format);
    let modulePath = 'custom';
    if (activeTab === 'Environmental') modulePath = 'environmental';
    else if (activeTab === 'Social') modulePath = 'social';
    else if (activeTab === 'Governance') modulePath = 'governance';
    else if (activeTab === 'ESG Summary') modulePath = 'esg-summary';
    else if (activeTab === 'Custom Builder') modulePath = filters.module || 'custom';

    let url = `${BASE_API_URL}/api/reports/${modulePath}/?export=${format.toLowerCase()}`;

    // Append filter query params if present
    if (filters.department) url += `&department=${filters.department}`;
    if (filters.employee) url += `&employee=${filters.employee}`;
    if (filters.status) url += `&status=${filters.status}`;
    if (filters.startDate) url += `&start_date=${filters.startDate}`;
    if (filters.endDate) url += `&end_date=${filters.endDate}`;
    if (filters.challenge) url += `&challenge=${filters.challenge}`;
    if (filters.category) url += `&category=${filters.category}`;

    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Export request returned an error code.");
      }
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const ext = format.toLowerCase() === 'excel' ? 'xlsx' : format.toLowerCase();
      link.setAttribute('download', `${modulePath}_report.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      addToast(`${modulePath.toUpperCase()} report exported as ${format} successfully.`, 'success');
    } catch (err) {
      console.error(err);
      addToast(`Export failed: ${err.message}`, 'error');
    } finally {
      setLoadingAction(null);
    }
  };

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
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
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
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-4 2xl:col-span-3">
              <ExecutiveSummaryCard esgSummary={esgSummaryData} />
            </div>
            <div className="xl:col-span-8 2xl:col-span-9 grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
              {reportCardsData
                .filter(report => {
                  if (activeTab === 'Environmental') return report.type === 'environmental';
                  if (activeTab === 'Social') return report.type === 'social';
                  if (activeTab === 'Governance') return report.type === 'governance';
                  if (activeTab === 'ESG Summary') return report.type === 'summary';
                  return true;
                })
                .map(report => (
                  <ReportCard key={report.id} report={report} />
                ))}
                
              {/* Report Preview */}
              <div className="lg:col-span-2 md:col-span-2">
                <ReportPreview previewData={previewData} isLoading={isLoading} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-4">
              <CustomReportBuilder 
                filters={filters}
                setFilters={setFilters}
                filterOptions={filterOptions}
                onRun={handleRun}
                onExport={handleExport}
                onReset={handleReset}
                loadingAction={loadingAction}
              />
            </div>
          </div>
          
          <div className="flex flex-col xl:flex-row gap-6">
            <div className="w-full xl:w-7/12 2xl:w-8/12">
              <ReportPreview previewData={previewData} isLoading={isLoading} />
            </div>
            <div className="w-full xl:w-5/12 2xl:w-4/12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-6">
              <AIInsights />
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
