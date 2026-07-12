import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { departmentParticipation } from '../../data/socialData';

const SocialDepartmentChart = () => {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-800">Department Participation</h3>
        <p className="text-sm text-slate-500">Engagement percentage by department</p>
      </div>
      
      <div className="flex-1 w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={departmentParticipation} margin={{ top: 5, right: 20, left: -20, bottom: 5 }} layout="vertical">
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
              formatter={(value) => [`${value}%`, 'Participation']}
            />
            <Bar dataKey="participation" radius={[0, 4, 4, 0]} barSize={24}>
              {departmentParticipation.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.participation > 70 ? '#3b82f6' : entry.participation > 50 ? '#6366f1' : '#818cf8'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SocialDepartmentChart;
