import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { emissionData } from '../data/dashboardData';
import { TrendingDown } from 'lucide-react';

const EmissionChart = ({ data }) => {
  const chartData = data && data.length > 0 ? data : emissionData;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Emission Trend</h3>
          <p className="text-sm text-slate-500">Monthly carbon emissions (tCO2e)</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-medium">
          <TrendingDown size={16} />
          <span>-4.2% from last year</span>
        </div>
      </div>
      
      <div className="flex-1 w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12 }} 
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, fill: '#10b981', strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EmissionChart;
