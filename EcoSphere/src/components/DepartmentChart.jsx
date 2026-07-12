import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { departmentRankingData } from '../data/dashboardData';

const DepartmentChart = () => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-800">Department ESG Ranking</h3>
        <p className="text-sm text-slate-500">Overall score by department</p>
      </div>
      
      <div className="flex-1 w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={departmentRankingData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis 
              type="number"
              domain={[0, 100]}
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12 }} 
            />
            <YAxis 
              dataKey="department" 
              type="category"
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
              width={100}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24}>
              {departmentRankingData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.score > 80 ? '#10b981' : entry.score > 65 ? '#3b82f6' : '#f59e0b'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DepartmentChart;
