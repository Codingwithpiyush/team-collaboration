import React, { useState } from 'react';
import { Building2, MapPin, Globe, Mail, Clock, Edit2, Save, X } from 'lucide-react';
import { companyProfileData } from '../../data/settingsData';
import { useToast } from '../reports/ToastNotifications';

const fieldConfig = [
  { key: 'location', label: 'Location', icon: MapPin, type: 'text' },
  { key: 'website', label: 'Website', icon: Globe, type: 'url', isLink: true },
  { key: 'email', label: 'Email', icon: Mail, type: 'email' },
  { key: 'timezone', label: 'Timezone', icon: Clock, type: 'text' },
];

const CompanyProfile = () => {
  const { addToast } = useToast();
  const [profileData, setProfileData] = useState({ ...companyProfileData });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...companyProfileData });

  const handleEdit = () => {
    setFormData({ ...profileData });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({ ...profileData });
    setIsEditing(false);
  };

  const handleSave = () => {
    setProfileData({ ...formData });
    setIsEditing(false);
    addToast('Company profile updated successfully!', 'success');
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800 opacity-5 rounded-bl-[100px] -z-0"></div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 relative z-10">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Company Profile</h3>
          <p className="text-xs text-slate-500 mt-1">Platform workspace details</p>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-1"
          >
            <Edit2 size={14} /> Edit
          </button>
        )}
      </div>

      {/* Company identity */}
      <div className="flex items-center gap-4 mb-6 relative z-10">
        <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center text-white shadow-sm border border-slate-700 shrink-0">
          <Building2 size={32} />
        </div>
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-500">Company Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <label className="block text-xs font-semibold text-slate-500">Industry</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => handleChange('industry', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          ) : (
            <>
              <h4 className="text-xl font-bold text-slate-800 truncate">{profileData.name}</h4>
              <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md mt-1 border border-slate-200 truncate max-w-full">
                {profileData.industry}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Detail rows */}
      <div className="space-y-4 relative z-10">
        {fieldConfig.map(({ key, label, icon: Icon, type, isLink }) => (
          <div key={key} className="flex items-center gap-3 text-sm min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
              <Icon size={14} />
            </div>
            {isEditing ? (
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
                <input
                  type={type}
                  value={formData[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            ) : isLink ? (
              <a href="#" className="text-blue-600 hover:underline font-medium truncate break-all min-w-0">
                {profileData[key]}
              </a>
            ) : (
              <span className="text-slate-600 font-medium truncate break-all min-w-0">
                {profileData[key]}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Save / Cancel buttons */}
      {isEditing && (
        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-200 relative z-10">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            <Save size={14} /> Save
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors"
          >
            <X size={14} /> Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default CompanyProfile;
