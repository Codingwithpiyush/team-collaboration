import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { diversityData } from '../../data/socialData';
import { Users, Heart } from 'lucide-react';

const DiversityDashboard = () => {
  const GENDER_COLORS = ['#3b82f6', '#10b981', '#8b5cf6'];
  const DEPT_COLORS = ['#f59e0b', '#f97316', '#ef4444', '#ec4899'];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-800">Diversity Dashboard</h3>
        <p className="text-sm text-slate-500">Workforce representation & engagement</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        
        {/* Gender Chart */}
        <div className="flex flex-col items-center">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Gender Distribution</h4>
          <div className="w-full h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={diversityData.gender}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {diversityData.gender.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement Stat */}
        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div className="p-3 bg-red-100 text-red-600 rounded-full mb-3">
            <Heart size={24} fill="currentColor" />
          </div>
          <p className="text-3xl font-bold text-slate-800">{diversityData.engagement}%</p>
          <p className="text-sm text-slate-600 font-medium text-center">Employee Engagement Score</p>
          <div className="mt-4 w-full flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-1"><Users size={12}/> Overall sentiment</div>
            <span className="text-emerald-600 font-medium">+2.5%</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DiversityDashboard;
