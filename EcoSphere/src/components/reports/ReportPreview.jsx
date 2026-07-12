import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dummyChartData } from '../../data/reportsData';
import { TrendingUp, Calendar, Building2, CheckCircle2 } from 'lucide-react';

const ReportPreview = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Report Preview</h3>
          <p className="text-xs text-slate-500 mt-0.5">Custom ESG Analysis</p>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={12} /> Generated
        </span>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-slate-400 mb-1"><Calendar size={18} /></div>
            <div className="text-xs text-slate-500 font-medium mb-1">Generated Date</div>
            <div className="text-sm font-bold text-slate-800">Today, 10:42 AM</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-slate-400 mb-1"><Building2 size={18} /></div>
            <div className="text-xs text-slate-500 font-medium mb-1">Department</div>
            <div className="text-sm font-bold text-slate-800">All Departments</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-slate-400 mb-1"><TrendingUp size={18} /></div>
            <div className="text-xs text-slate-500 font-medium mb-1">Overall ESG Score</div>
            <div className="text-sm font-bold text-slate-800 text-emerald-600">82/100</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-slate-400 mb-1"><CheckCircle2 size={18} /></div>
            <div className="text-xs text-slate-500 font-medium mb-1">Data Points</div>
            <div className="text-sm font-bold text-slate-800">1,450 analyzed</div>
          </div>
        </div>

        <div className="flex-1 min-h-[250px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dummyChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ stroke: '#e2e8f0', strokeWidth: 2, strokeDasharray: '4 4' }}
              />
              <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ReportPreview;
