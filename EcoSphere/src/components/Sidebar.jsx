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

const Sidebar = ({ activePage = 'Dashboard', setActivePage, activeTab = 'Environmental Goals', setActiveTab }) => {
  const [expandedMenu, setExpandedMenu] = useState('Environmental');

  const toggleMenu = (name) => {
    if (expandedMenu === name) {
      setExpandedMenu(null);
    } else {
      setExpandedMenu(name);
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, active: activePage === 'Dashboard' },
    { name: 'Environmental', icon: Leaf, active: activePage === 'Environmental', subItems: ['Emission Factors', 'Product ESG Profiles', 'Carbon Transactions', 'Environmental Goals'] },
    { name: 'Social', icon: Users, active: activePage === 'Social', subItems: ['CSR Activities', 'Employee Participation', 'Diversity Dashboard'] },
    { name: 'Governance', icon: Briefcase, active: activePage === 'Governance', subItems: ['Policies', 'Policy Acknowledgements', 'Audits', 'Compliance Issues'] },
    { name: 'Gamification', icon: Gamepad2, active: activePage === 'Gamification', subItems: ['Challenges', 'Challenge Participation', 'Badges', 'Rewards', 'Leaderboard'] },
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
            const isClickable = item.name === 'Dashboard' || item.name === 'Environmental' || item.name === 'Social' || item.name === 'Governance' || item.name === 'Gamification' || item.subItems;

            return (
              <div key={item.name} className="flex flex-col">
                <button
                  onClick={() => {
                    if (item.name === 'Dashboard') {
                      setActivePage('Dashboard');
                    } else if (item.name === 'Environmental') {
                      setActivePage('Environmental');
                      setActiveTab('Environmental Goals');
                      toggleMenu('Environmental');
                    } else if (item.name === 'Social') {
                      setActivePage('Social');
                      setActiveTab('CSR Activities');
                      toggleMenu('Social');
                    } else if (item.name === 'Governance') {
                      setActivePage('Governance');
                      setActiveTab('Audits');
                      toggleMenu('Governance');
                    } else if (item.name === 'Gamification') {
                      setActivePage('Gamification');
                      setActiveTab('Challenges');
                      toggleMenu('Gamification');
                    } else if (item.subItems) {
                      toggleMenu(item.name);
                    }
                  }}
                  disabled={!isClickable}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    item.active 
                      ? 'bg-emerald-50 text-emerald-600 font-semibold' 
                      : 'text-slate-500 hover:bg-slate-50'
                  } ${!isClickable ? 'cursor-not-allowed opacity-60' : 'opacity-90'}`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className={item.active ? 'text-emerald-600' : 'text-slate-400'} />
                    {item.name}
                  </div>
                  {item.subItems && (
                    isExpanded ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />
                  )}
                </button>
                
                {/* Submenu */}
                {item.subItems && isExpanded && (
                  <div className="mt-1 mb-2 ml-4 pl-6 border-l border-slate-100 space-y-1">
                    {item.subItems.map(sub => {
                      const isSubActive = activePage === item.name && activeTab === sub;
                      const isSubDisabled = item.name !== 'Environmental' && item.name !== 'Social' && item.name !== 'Governance' && item.name !== 'Gamification';
                      return (
                        <button 
                          key={sub}
                          disabled={isSubDisabled}
                          onClick={() => {
                            if (item.name === 'Environmental' || item.name === 'Social' || item.name === 'Governance' || item.name === 'Gamification') {
                              setActivePage(item.name);
                              setActiveTab(sub);
                            }
                          }}
                          className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            isSubActive 
                              ? 'text-emerald-600 bg-emerald-50/50 font-semibold' 
                              : isSubDisabled 
                                ? 'text-slate-400 cursor-not-allowed' 
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 cursor-pointer'
                          }`}
                        >
                          {sub}
                        </button>
                      );
                    })}
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
