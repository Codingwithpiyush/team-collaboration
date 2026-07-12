import React, { useState, useEffect } from 'react';
import { Trophy, Medal } from 'lucide-react';
import { BASE_API_URL } from '../../config';

const Leaderboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopDepts = async () => {
      try {
        const res = await fetch(`${BASE_API_URL}/api/social/dashboard/top-performing/`);
        if (res.ok) {
          const items = await res.json();
          const mapped = items.map((item, idx) => ({
            rank: idx + 1,
            name: item.department_name,
            code: item.department_code,
            score: parseFloat(item.score)
          }));
          setData(mapped);
        }
      } catch (err) {
        console.error("Failed to load top performing departments", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopDepts();
  }, []);

  const getBadgeColor = (rank) => {
    switch(rank) {
      case 1: return 'text-yellow-500 bg-yellow-50 border-yellow-200'; // Gold
      case 2: return 'text-slate-400 bg-slate-50 border-slate-200'; // Silver
      case 3: return 'text-amber-700 bg-amber-50 border-amber-200'; // Bronze
      default: return 'text-slate-500 bg-white border-transparent';
    }
  };

  const renderList = data.length > 0 ? data : [
    { rank: 1, name: 'Corporate Services', code: 'CORP', score: 98.5 },
    { rank: 2, name: 'Sustainability & Innovation', code: 'SUST', score: 95.2 },
    { rank: 3, name: 'Logistics', code: 'LOGI', score: 88.0 },
    { rank: 4, name: 'R&D Division', code: 'RDIV', score: 82.3 },
    { rank: 5, name: 'Sales & Marketing', code: 'SALE', score: 79.1 }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
          <Trophy size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Top Departments</h3>
          <p className="text-sm text-slate-500">Ranked by Social Score</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {renderList.map((item) => (
          <div key={item.rank} className="flex items-center p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
            <div className={`w-8 h-8 shrink-0 flex items-center justify-center font-bold text-sm rounded-full border ${getBadgeColor(item.rank)}`}>
              {item.rank <= 3 ? <Medal size={16} /> : item.rank}
            </div>
            
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
              <p className="text-xs text-slate-500 truncate">Code: {item.code}</p>
            </div>
            
            <div className="text-right ml-4">
              <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">{item.score.toFixed(1)}</p>
              <p className="text-xs text-slate-500">Score</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
