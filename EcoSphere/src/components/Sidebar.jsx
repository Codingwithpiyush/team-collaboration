import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Leaf, 
  Users, 
  Briefcase, 
  Gamepad2, 
  FileText, 
  Settings,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

const Sidebar = () => {
  const [expandedMenu, setExpandedMenu] = useState('Environmental');

  const toggleMenu = (name) => {
    if (expandedMenu === name) {
      setExpandedMenu(null);
    } else {
      setExpandedMenu(name);
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, active: true },
    { name: 'Environmental', icon: Leaf, active: false, subItems: ['Emission Factors', 'Product ESG Profiles', 'Carbon Transactions', 'Environmental Goals'] },
    { name: 'Social', icon: Users, active: false, subItems: ['CSR Activities', 'Employee Participation', 'Diversity Dashboard'] },
    { name: 'Governance', icon: Briefcase, active: false, subItems: ['Policies', 'Policy Acknowledgements', 'Audits', 'Compliance Issues'] },
    { name: 'Gamification', icon: Gamepad2, active: false, subItems: ['Challenges', 'Challenge Participation', 'Badges', 'Rewards', 'Leaderboard'] },
    { name: 'Reports', icon: FileText, active: false, subItems: ['Environmental Report', 'Social Report', 'Governance Report', 'ESG Summary', 'Custom Report Builder'] },
    { name: 'Settings', icon: Settings, active: false, subItems: ['Departments', 'Categories', 'ESG Configuration', 'Notification Settings'] },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col fixed left-0 top-0 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-white z-10 shrink-0">
        <div className="bg-emerald-500 p-2 rounded-lg text-white">
          <Leaf size={24} />
        </div>
        <span className="text-xl font-bold text-slate-800">EcoSphere</span>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => {
            const isExpanded = expandedMenu === item.name;
            return (
              <div key={item.name} className="flex flex-col">
                <button
                  onClick={() => {
                    if (item.subItems) toggleMenu(item.name);
                  }}
                  disabled={!item.active && !item.subItems}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    item.active 
                      ? 'bg-emerald-50 text-emerald-600' 
                      : 'text-slate-500 hover:bg-slate-50'
                  } ${!item.active && !item.subItems ? 'cursor-not-allowed opacity-60' : 'opacity-90'}`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className={item.active ? 'text-emerald-500' : 'text-slate-400'} />
                    {item.name}
                  </div>
                  {item.subItems && (
                    isExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />
                  )}
                </button>
                
                {/* Submenu */}
                {item.subItems && isExpanded && (
                  <div className="mt-1 mb-2 ml-4 pl-6 border-l border-slate-100 space-y-1">
                    {item.subItems.map(sub => (
                      <button 
                        key={sub}
                        disabled
                        className="w-full text-left px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-500 rounded-md hover:bg-slate-50 cursor-not-allowed transition-colors"
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
