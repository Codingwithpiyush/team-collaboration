import React from 'react';
import { Trophy, Medal } from 'lucide-react';
import { leaderboardData } from '../../data/socialData';

const Leaderboard = () => {
  const getBadgeColor = (rank) => {
    switch(rank) {
      case 1: return 'text-yellow-500 bg-yellow-50 border-yellow-200'; // Gold
      case 2: return 'text-slate-400 bg-slate-50 border-slate-200'; // Silver
      case 3: return 'text-amber-700 bg-amber-50 border-amber-200'; // Bronze
      default: return 'text-slate-500 bg-white border-transparent';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
          <Trophy size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Volunteer Leaderboard</h3>
          <p className="text-sm text-slate-500">Top 5 Employees by XP</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {leaderboardData.map((user) => (
          <div key={user.rank} className="flex items-center p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
            <div className={`w-8 h-8 shrink-0 flex items-center justify-center font-bold text-sm rounded-full border ${getBadgeColor(user.rank)}`}>
              {user.rank <= 3 ? <Medal size={16} /> : user.rank}
            </div>
            
            <div className="ml-4 flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user.employee}</p>
              <p className="text-xs text-slate-500 truncate">{user.department} • {user.activities} Activities</p>
            </div>
            
            <div className="text-right ml-4">
              <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">{user.xp}</p>
              <p className="text-xs text-slate-500">XP</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
