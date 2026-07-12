const inferCategoryAndDept = (code, title) => {
  const codeStr = (code || '').toUpperCase();
  const titleStr = (title || '').toUpperCase();
  
  if (codeStr.includes('ENV') || titleStr.includes('ENVIRONMENT') || titleStr.includes('CARBON') || titleStr.includes('WASTE')) {
    return { category: 'Sustainability', department: 'Logistics' };
  }
  if (codeStr.includes('ETH') || titleStr.includes('ETHIC') || titleStr.includes('CONDUCT') || titleStr.includes('VALUES')) {
    return { category: 'Ethics', department: 'Corporate' };
  }
  if (codeStr.includes('SAF') || titleStr.includes('SAFETY') || titleStr.includes('HEALTH') || titleStr.includes('OCCUPATIONAL')) {
    return { category: 'Health & Safety', department: 'Manufacturing' };
  }
  if (codeStr.includes('PRIV') || codeStr.includes('DAT') || titleStr.includes('PRIVACY') || titleStr.includes('DATA') || titleStr.includes('SECURITY')) {
    return { category: 'Compliance', department: 'IT' };
  }
  if (codeStr.includes('SUP') || titleStr.includes('SUPPLIER') || titleStr.includes('VENDOR') || titleStr.includes('PROCURE')) {
    return { category: 'Supply Chain', department: 'Procurement' };
  }
  if (codeStr.includes('HR') || titleStr.includes('HUMAN') || titleStr.includes('LABOR') || titleStr.includes('EMPLOYEE')) {
    return { category: 'Human Rights', department: 'HR' };
  }
  return { category: 'Compliance', department: 'Corporate' };
};

export const mapBackendPolicyToFrontend = (bp) => {
  const { category, department } = inferCategoryAndDept(bp.code, bp.title);
  return {
    id: bp.id,
    name: bp.title,
    code: bp.code || `POL-${bp.id}`,
    category: category,
    department: department,
    effectiveDate: bp.created_at ? bp.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
    version: bp.version || '1.0',
    status: bp.status ? (bp.status.charAt(0).toUpperCase() + bp.status.slice(1)) : 'Draft',
    description: bp.description || '',
    owner: bp.owner,
    ownerName: bp.owner_name || '',
    createdBy: bp.created_by,
    createdByName: bp.created_by_name || ''
  };
};

export const mapBackendAckToFrontend = (ba) => ({
  id: ba.id,
  employee: ba.employee_name || `Employee #${ba.employee}`,
  employeeId: ba.employee,
  policy: ba.policy_title || ba.policy_code || `Policy #${ba.policy}`,
  policyId: ba.policy,
  acknowledgedDate: ba.acknowledged_at ? ba.acknowledged_at.split('T')[0] : '-',
  status: 'Completed',
  reminderSent: 'No'
});

export const mapBackendAuditToFrontend = (ba) => ({
  id: ba.id,
  title: ba.title || 'Audit',
  department: ba.department_name || `Dept #${ba.department}`,
  departmentId: ba.department,
  auditor: ba.auditor_name || `Auditor #${ba.auditor}`,
  auditorId: ba.auditor,
  date: ba.audit_date || '',
  findings: ba.findings || 'No Issues',
  status: ba.status === 'published' ? 'Completed' : 'Scheduled',
  score: parseFloat(ba.score) || 0,
  description: ba.scope || ''
});

export const mapBackendIssueToFrontend = (bi) => {
  let severity = 'Medium';
  if (bi.severity) {
    if (bi.severity.toLowerCase() === 'high' || bi.severity.toLowerCase() === 'critical') {
      severity = 'High';
    } else if (bi.severity.toLowerCase() === 'low') {
      severity = 'Low';
    }
  }

  let status = 'Open';
  if (bi.status) {
    if (bi.status.toLowerCase() === 'in_progress') {
      status = 'In Progress';
    } else if (bi.status.toLowerCase() === 'resolved') {
      status = 'Resolved';
    } else if (bi.status.toLowerCase() === 'overdue') {
      status = 'Overdue';
    }
  }

  return {
    id: bi.id,
    issue: bi.title || '',
    description: bi.description || '',
    severity: severity,
    department: bi.department_name || `Dept #${bi.department}`,
    departmentId: bi.department,
    owner: bi.assigned_to_name || `Employee #${bi.assigned_to}`,
    ownerId: bi.assigned_to,
    dueDate: bi.due_date || '',
    status: status,
    resolutionNotes: bi.resolution_notes || '',
    resolvedAt: bi.resolved_at || null
  };
};
