import React, { useState } from 'react';
import { Palette, Sun, Moon, Monitor } from 'lucide-react';
import { useToast } from '../reports/ToastNotifications';

const ThemeSettings = () => {
  const [theme, setTheme] = useState('light');
  const [primaryColor, setPrimaryColor] = useState('blue');
  const { addToast } = useToast();

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    addToast(`Theme set to ${newTheme} mode`, 'success');
  };

  const handleColorChange = (newColor) => {
    setPrimaryColor(newColor);
    addToast(`Primary color updated to ${newColor}`, 'success');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Palette size={20} className="text-slate-500" />
        Theme Settings
      </h3>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Appearance</label>
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => handleThemeChange('light')}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-colors ${
                theme === 'light' ? 'border-slate-800 bg-slate-50' : 'border-slate-100 hover:border-slate-300 bg-white'
              }`}
            >
              <Sun size={20} className={theme === 'light' ? 'text-slate-800' : 'text-slate-400'} />
              <span className={`text-xs font-semibold ${theme === 'light' ? 'text-slate-800' : 'text-slate-500'}`}>Light</span>
            </button>
            <button 
              onClick={() => handleThemeChange('dark')}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-colors ${
                theme === 'dark' ? 'border-slate-800 bg-slate-50' : 'border-slate-100 hover:border-slate-300 bg-white'
              }`}
            >
              <Moon size={20} className={theme === 'dark' ? 'text-slate-800' : 'text-slate-400'} />
              <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-slate-800' : 'text-slate-500'}`}>Dark</span>
            </button>
            <button 
              onClick={() => handleThemeChange('system')}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-colors ${
                theme === 'system' ? 'border-slate-800 bg-slate-50' : 'border-slate-100 hover:border-slate-300 bg-white'
              }`}
            >
              <Monitor size={20} className={theme === 'system' ? 'text-slate-800' : 'text-slate-400'} />
              <span className={`text-xs font-semibold ${theme === 'system' ? 'text-slate-800' : 'text-slate-500'}`}>System</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Primary Color</label>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => handleColorChange('blue')}
              className={`w-10 h-10 rounded-full bg-blue-600 shadow-sm border-4 transition-transform hover:scale-110 ${primaryColor === 'blue' ? 'border-blue-200' : 'border-white'}`}
            ></button>
            <button 
              onClick={() => handleColorChange('green')}
              className={`w-10 h-10 rounded-full bg-emerald-600 shadow-sm border-4 transition-transform hover:scale-110 ${primaryColor === 'green' ? 'border-emerald-200' : 'border-white'}`}
            ></button>
            <button 
              onClick={() => handleColorChange('purple')}
              className={`w-10 h-10 rounded-full bg-purple-600 shadow-sm border-4 transition-transform hover:scale-110 ${primaryColor === 'purple' ? 'border-purple-200' : 'border-white'}`}
            ></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
