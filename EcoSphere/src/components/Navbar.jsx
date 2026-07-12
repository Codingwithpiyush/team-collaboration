import React from 'react';
import { Bell, Search } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-10 w-full">
      <h1 className="text-xl font-semibold text-slate-800">EcoSphere Dashboard</h1>
      
      <div className="flex items-center gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white focus:border-emerald-500 transition-all w-64"
          />
        </div>
        
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
        </button>
        
        <div className="flex items-center gap-3 border-l border-slate-200 pl-6 cursor-pointer">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-slate-700">Jane Doe</p>
            <p className="text-xs text-slate-500">Admin</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border-2 border-emerald-200">
            JD
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
