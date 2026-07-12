import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';
import { Users, Heart } from 'lucide-react';
import { BASE_API_URL } from '../../config';

const DiversityDashboard = () => {
  const [data, setData] = useState(null);
  const GENDER_COLORS = ['#3b82f6', '#ec4899', '#8b5cf6'];
  const AGE_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  useEffect(() => {
    const fetchDiversity = async () => {
      try {
        const res = await fetch(`${BASE_API_URL}/api/social/dashboard/diversity-distribution/`);
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error("Failed to load diversity distribution", err);
      }
    };
    fetchDiversity();
  }, []);

  const genderChartData = data?.gender_distribution ? [
    { name: 'Male', value: data.gender_distribution.male || 0 },
    { name: 'Female', value: data.gender_distribution.female || 0 }
  ] : [
    { name: 'Female', value: 48 },
    { name: 'Male', value: 52 }
  ];

  const ageChartData = data?.age_distribution ? [
    { name: '20-30', value: data.age_distribution['20-30'] || 0 },
    { name: '30-40', value: data.age_distribution['30-40'] || 0 },
    { name: '40+', value: data.age_distribution['40+'] || 0 }
  ] : [
    { name: '20-30', value: 30 },
    { name: '30-40', value: 45 },
    { name: '40+', value: 12 }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Diversity Dashboard</h3>
          <p className="text-sm text-slate-500">Workforce representation & inclusion indicators</p>
        </div>
        <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-100 flex items-center gap-1.5">
          <Heart size={14} fill="currentColor" />
          <span>{data ? data.disability_count : 3} Disability Accommodations</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* Gender Chart */}
        <div className="flex flex-col items-center">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Gender Distribution</h4>
          <div className="w-full h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {genderChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Age Distribution Chart */}
        <div className="flex flex-col items-center">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Age Groups</h4>
          <div className="w-full h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {ageChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={AGE_COLORS[index % AGE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiversityDashboard;
