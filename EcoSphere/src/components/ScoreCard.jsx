import React from 'react';

const ScoreCard = ({ title, score, total, subtitle, icon: Icon, theme }) => {
  
  const getThemeClasses = () => {
    switch(theme) {
      case 'green':
        return {
          iconBg: 'bg-emerald-100',
          iconColor: 'text-emerald-600',
          scoreColor: 'text-emerald-600',
          borderColor: 'border-emerald-100'
        };
      case 'blue':
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          scoreColor: 'text-blue-600',
          borderColor: 'border-blue-100'
        };
      case 'purple':
        return {
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600',
          scoreColor: 'text-purple-600',
          borderColor: 'border-purple-100'
        };
      case 'darkblue':
        return {
          iconBg: 'bg-indigo-100',
          iconColor: 'text-indigo-600',
          scoreColor: 'text-indigo-600',
          borderColor: 'border-indigo-100'
        };
      default:
        return {
          iconBg: 'bg-slate-100',
          iconColor: 'text-slate-600',
          scoreColor: 'text-slate-600',
          borderColor: 'border-slate-100'
        };
    }
  };

  const classes = getThemeClasses();

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-sm border ${classes.borderColor} hover:shadow-md transition-shadow duration-300 flex flex-col`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-slate-600 font-medium text-sm">{title}</h3>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${classes.iconBg}`}>
          <Icon className={classes.iconColor} size={20} />
        </div>
      </div>
      
      <div className="mt-auto">
        <div className="flex items-baseline gap-2 mb-1">
          <span className={`text-4xl font-bold tracking-tight ${classes.scoreColor}`}>{score}</span>
          <span className="text-slate-400 font-medium text-lg">/ {total}</span>
        </div>
        <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
      </div>
    </div>
  );
};

export default ScoreCard;
