import React from 'react';
import { PlusCircle, Trophy, BarChart3, ChevronRight } from 'lucide-react';

const QuickActions = ({ onActionClick }) => {
  const actions = [
    {
      title: 'Log Carbon Data',
      description: 'Record new emissions data',
      icon: PlusCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      hover: 'hover:border-emerald-200'
    },
    {
      title: 'Start Challenge',
      description: 'Join the new sustainability sprint',
      icon: Trophy,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      hover: 'hover:border-purple-200'
    },
    {
      title: 'View Reports',
      description: 'Access Q3 ESG summary',
      icon: BarChart3,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      hover: 'hover:border-blue-200'
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full">
      <h3 className="text-lg font-semibold text-slate-800 mb-6">Quick Actions</h3>
      
      <div className="space-y-4">
        {actions.map((action, index) => (
          <button 
            key={index} 
            onClick={() => onActionClick && onActionClick(action.title)}
            className={`w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white transition-all duration-200 ${action.hover} group hover:shadow-sm`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${action.bg} ${action.color}`}>
                <action.icon size={20} />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-semibold text-slate-800">{action.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{action.description}</p>
              </div>
            </div>
            <div className="text-slate-400 group-hover:text-slate-800 transition-colors group-hover:translate-x-1 duration-200">
              <ChevronRight size={18} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
