import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dummyChartData } from '../../data/reportsData';
import { TrendingUp, Table as TableIcon, BarChart2, CheckCircle2, AlertCircle } from 'lucide-react';

const ReportPreview = ({ previewData, isLoading }) => {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'chart'

  const title = previewData?.title || 'Report Preview';
  const headers = previewData?.headers || [];
  const rows = previewData?.rows || [];
  const summary = previewData?.summary || {};

  // Dynamically map preview logs to chart points
  const chartData = useMemo(() => {
    if (!previewData?.details || !Array.isArray(previewData.details) || previewData.details.length === 0) {
      return dummyChartData;
    }
    try {
      const list = previewData.details.map((item) => {
        const dateKey = item.date || item.joined_date || item.due_date || 'Date';
        const numVal = 
          item.co2_emitted_kg !== undefined ? item.co2_emitted_kg :
          item.points_awarded !== undefined ? item.points_awarded :
          item.quantity !== undefined ? item.quantity : 0;
        return {
          month: dateKey,
          score: Number(numVal)
        };
      });
      return list;
    } catch (e) {
      return dummyChartData;
    }
  }, [previewData]);

  // Clean metric key formatter
  const formatMetricKey = (key) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col min-h-[500px]">
      {/* Top Header Panel */}
      <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">Live Database Logs</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <TableIcon size={14} />
              Table
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'chart' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart2 size={14} />
              Trend
            </button>
          </div>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} /> Live API
          </span>
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        {/* Loading Indicator */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3">
            <span className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-slate-800 animate-spin"></span>
            <span className="text-sm font-semibold text-slate-500">Querying report logs...</span>
          </div>
        ) : (
          <>
            {/* Dynamic Summary Cards */}
            {Object.keys(summary).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {Object.entries(summary).slice(0, 4).map(([key, val]) => (
                  <div key={key} className="p-4 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
                    <span className="text-slate-400 mb-1"><TrendingUp size={16} /></span>
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 leading-none">
                      {formatMetricKey(key)}
                    </div>
                    <div className="text-base font-black text-slate-800">
                      {typeof val === 'number' ? val.toLocaleString() : String(val)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold mb-6">
                <AlertCircle size={14} />
                <span>No summary aggregations returned for this query.</span>
              </div>
            )}

            {/* Display Area based on Toggle */}
            {viewMode === 'table' ? (
              <div className="flex-1 overflow-x-auto border border-slate-100 rounded-xl">
                {rows.length > 0 ? (
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        {headers.map((header) => (
                          <th
                            key={header}
                            className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100 text-slate-700 text-xs font-medium">
                      {rows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50/50 transition-colors">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="px-4 py-3.5 whitespace-nowrap">
                              {cell === null || cell === undefined ? '-' : String(cell)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center">
                    <TableIcon size={32} className="mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">No records matched filters</p>
                    <p className="text-xs mt-1">Try running the report without date constraints.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 min-h-[280px] w-full mt-4 bg-white border border-slate-100 rounded-xl p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} dx={-10} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)' }}
                      cursor={{ stroke: '#e2e8f0', strokeWidth: 2, strokeDasharray: '4 4' }}
                    />
                    <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} dot={{r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReportPreview;
