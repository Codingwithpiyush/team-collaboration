export const initialDepartments = [
  { id: 'DEP-001', name: 'Manufacturing', code: 'MFG', head: 'S. Nair', parent: '—', employees: 134, status: 'Active' },
  { id: 'DEP-002', name: 'Logistics', code: 'LOG', head: 'R. Iyer', parent: 'Manufacturing', employees: 58, status: 'Active' },
  { id: 'DEP-003', name: 'Corporate', code: 'COR', head: 'A. Mehta', parent: '—', employees: 41, status: 'Active' },
  { id: 'DEP-004', name: 'HR', code: 'HRD', head: 'K. Patel', parent: 'Corporate', employees: 12, status: 'Active' },
  { id: 'DEP-005', name: 'IT', code: 'ITD', head: 'M. Singh', parent: 'Corporate', employees: 25, status: 'Active' },
  { id: 'DEP-006', name: 'Finance', code: 'FIN', head: 'P. Desai', parent: 'Corporate', employees: 18, status: 'Inactive' }
];

export const initialCategories = [
  { id: 'CAT-001', name: 'Environmental', description: 'Carbon footprint, energy, waste, and emissions tracking.', status: 'Active' },
  { id: 'CAT-002', name: 'Social', description: 'CSR activities, diversity metrics, and community engagement.', status: 'Active' },
  { id: 'CAT-003', name: 'Governance', description: 'Policies, compliance audits, and corporate ethics.', status: 'Active' },
  { id: 'CAT-004', name: 'Gamification', description: 'Employee challenges, badges, and rewards system.', status: 'Active' },
  { id: 'CAT-005', name: 'Reports', description: 'Analytics, custom report building, and data exports.', status: 'Active' }
];

export const initialRoles = [
  { 
    id: 'ROLE-001', 
    name: 'Admin', 
    permissions: ['Dashboard', 'Environmental', 'Social', 'Governance', 'Gamification', 'Reports', 'Settings'] 
  },
  { 
    id: 'ROLE-002', 
    name: 'ESG Manager', 
    permissions: ['Dashboard', 'Environmental', 'Social', 'Governance', 'Reports'] 
  },
  { 
    id: 'ROLE-003', 
    name: 'Department Head', 
    permissions: ['Dashboard', 'Social', 'Gamification', 'Reports'] 
  },
  { 
    id: 'ROLE-004', 
    name: 'Employee', 
    permissions: ['Dashboard', 'Gamification'] 
  }
];

export const initialActivityLog = [
  { id: 1, action: 'Admin updated Theme Settings', time: '10 mins ago', type: 'system' },
  { id: 2, action: 'S. Nair created Department "R&D"', time: '2 hours ago', type: 'department' },
  { id: 3, action: 'Reward Redemption enabled globally', time: 'Yesterday', type: 'config' },
  { id: 4, action: 'Weekly ESG Report notification updated', time: '2 days ago', type: 'notification' },
  { id: 5, action: 'System Backup created successfully', time: '3 days ago', type: 'backup' }
];

export const initialBackups = [
  { id: 'BK-101', date: '2026-07-12', createdBy: 'System Auto', size: '1.2 GB', status: 'Completed' },
  { id: 'BK-100', date: '2026-07-05', createdBy: 'Admin', size: '1.1 GB', status: 'Completed' },
  { id: 'BK-099', date: '2026-06-28', createdBy: 'System Auto', size: '1.0 GB', status: 'Completed' }
];

export const companyProfileData = {
  name: 'EcoSphere Corp',
  industry: 'Sustainable Technology',
  location: 'San Francisco, CA, USA',
  website: 'www.ecosphere-platform.com',
  email: 'admin@ecosphere-platform.com',
  timezone: 'Pacific Time (PT)'
};
