import React, { useState, useEffect } from 'react';
import { X, Loader2, Download, FileSpreadsheet, AlertTriangle, Info } from 'lucide-react';
import { BASE_API_URL } from '../../config';
import { useToast } from './ToastNotifications';

const ReportModal = ({ reportType, onClose }) => {
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState(null);
  
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [isLoadingExcel, setIsLoadingExcel] = useState(false);

  // Normalize report type for API call
  const moduleParam = reportType === 'summary' ? 'esg-summary' : reportType;

  // Fetch report data on mount
  useEffect(() => {
    const fetchReportPreview = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BASE_API_URL}/api/reports/preview/?module=${moduleParam}`);
        if (!res.ok) {
          throw new Error(`Failed to load report preview data.`);
        }
        const data = await res.json();
        setPreviewData(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Error communicating with server.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchReportPreview();
  }, [moduleParam]);

  const handleDownload = async (format) => {
    const isPdf = format === 'PDF';
    if (isPdf) setIsLoadingPdf(true);
    else setIsLoadingExcel(true);

    try {
      const url = `${BASE_API_URL}/api/reports/${moduleParam}/?export=${format.toLowerCase()}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to export binary file.");
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const ext = format.toLowerCase() === 'excel' ? 'xlsx' : format.toLowerCase();
      link.setAttribute('download', `${moduleParam}_report.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      addToast(`${previewData?.title || 'Report'} exported as ${format} successfully.`, 'success');
      onClose();
    } catch (err) {
      console.error(err);
      addToast(`Export failed: ${err.message}`, 'error');
    } finally {
      if (isPdf) setIsLoadingPdf(false);
      else setIsLoadingExcel(false);
    }
  };

  const title = previewData?.title || 'Report Preview';
  const headers = previewData?.headers || [];
  const rows = previewData?.rows || [];
  const summary = previewData?.summary || {};

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
            <div className="flex gap-4 mt-1 text-xs text-slate-500 font-medium">
              <span>Status: Ready for Export</span>
              <span>Source: Live Database</span>
              <span>Scope: Aggregated Organization</span>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1.5 rounded transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar flex flex-col gap-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <span className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></span>
              <span className="text-sm font-semibold text-slate-500">Querying report preview details...</span>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
              <AlertTriangle size={20} />
              <div className="font-semibold text-sm">{error}</div>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Summary KPIs sidebar */}
              <div className="lg:w-1/3 flex flex-col gap-6">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">Key Metrics</h4>
                  <div className="space-y-3 bg-slate-50 rounded-xl p-4 border border-slate-100 shadow-sm">
                    {Object.entries(summary).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-center py-2 border-b border-slate-200/60 last:border-0 last:pb-0">
                        <span className="text-xs font-semibold text-slate-600">
                          {key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                        <span className="text-xs font-black text-slate-800">
                          {typeof val === 'number' ? val.toLocaleString() : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-blue-700 text-xs font-medium flex gap-2">
                  <Info size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold mb-1">Audit Trail Information</h5>
                    <p className="leading-relaxed">This report is generated dynamically based on active carbon ledgers, employee training files, and certified policy acknowledgements.</p>
                  </div>
                </div>
              </div>

              {/* Data Table Area */}
              <div className="lg:w-2/3 flex flex-col gap-4">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Preview Logs ({rows.length} records)
                </h4>

                <div className="overflow-x-auto border border-slate-100 rounded-xl max-h-[350px]">
                  {rows.length > 0 ? (
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          {headers.map((h) => (
                            <th key={h} className="px-3 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100 text-slate-700 text-xs font-medium">
                        {rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/50">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-3 py-2.5 whitespace-nowrap">
                                {cell === null || cell === undefined ? '-' : String(cell)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-8 text-center text-slate-400">
                      No records exist for the selected scope.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button 
            disabled={isLoading || isLoadingExcel || isLoadingPdf}
            className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            onClick={() => handleDownload('Excel')}
          >
            {isLoadingExcel ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} className="text-emerald-600" />}
            Download Excel
          </button>
          <button 
            disabled={isLoading || isLoadingExcel || isLoadingPdf}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            onClick={() => handleDownload('PDF')}
          >
            {isLoadingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
