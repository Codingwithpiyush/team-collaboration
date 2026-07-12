import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BASE_API_URL } from '../../config';

const SocialDepartmentChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchDeptPoints = async () => {
      try {
        const res = await fetch(`${BASE_API_URL}/api/social/dashboard/department-points/`);
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error("Failed to load department points", err);
      }
    };
    fetchDeptPoints();
  }, []);

  const chartData = data.length > 0 ? data.map(item => ({
    department: item.department_code || item.department_name.substring(0, 4).toUpperCase(),
    'CSR Points': item.total_csr_points,
    'Training Hours': item.training_hours_per_employee
  })) : [
    { department: 'SUST', 'CSR Points': 450, 'Training Hours': 12.5 },
    { department: 'CORP', 'CSR Points': 300, 'Training Hours': 8.2 },
    { department: 'LOGI', 'CSR Points': 280, 'Training Hours': 6.4 },
    { department: 'RDIV', 'CSR Points': 350, 'Training Hours': 10.0 },
    { department: 'SALE', 'CSR Points': 200, 'Training Hours': 5.5 }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-slate-800">Department Performance</h3>
        <p className="text-sm text-slate-500">CSR Points vs. Training hours average by department code</p>
      </div>
      
      <div className="flex-1 w-full h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="department"
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 11 }} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 11 }} 
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', pt: 10 }} />
            <Bar dataKey="CSR Points" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Training Hours" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SocialDepartmentChart;
