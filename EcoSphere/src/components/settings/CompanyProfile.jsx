import React from 'react';
import { Building2, MapPin, Globe, Mail, Clock, Edit2 } from 'lucide-react';
import { companyProfileData } from '../../data/settingsData';

const CompanyProfile = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800 opacity-5 rounded-bl-[100px] -z-0"></div>
      
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Company Profile</h3>
          <p className="text-xs text-slate-500 mt-1">Platform workspace details</p>
        </div>
        <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-1">
          <Edit2 size={14} /> Edit
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center text-white shadow-sm border border-slate-700">
          <Building2 size={32} />
        </div>
        <div>
          <h4 className="text-xl font-bold text-slate-800">{companyProfileData.name}</h4>
          <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md mt-1 border border-slate-200">
            {companyProfileData.industry}
          </span>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
            <MapPin size={14} />
          </div>
          <span className="text-slate-600 font-medium">{companyProfileData.location}</span>
        </div>
        
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
            <Globe size={14} />
          </div>
          <a href="#" className="text-blue-600 hover:underline font-medium">{companyProfileData.website}</a>
        </div>
        
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
            <Mail size={14} />
          </div>
          <span className="text-slate-600 font-medium">{companyProfileData.email}</span>
        </div>
        
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
            <Clock size={14} />
          </div>
          <span className="text-slate-600 font-medium">{companyProfileData.timezone}</span>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
