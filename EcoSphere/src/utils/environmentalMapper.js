export const mapBackendGoalToFrontend = (bg) => ({
  id: bg.id,
  name: bg.name,
  department: bg.department_name || (bg.department ? bg.department.toString() : 'Unknown'),
  departmentId: bg.department,
  targetCo2: parseFloat(bg.target_value) || 0,
  currentCo2: parseFloat(bg.current_value) || 0,
  deadline: bg.target_date || bg.deadline || '',
  startDate: bg.start_date || '',
  status: bg.status ? (bg.status.charAt(0).toUpperCase() + bg.status.slice(1)) : 'Active',
  description: bg.description || '',
  targetType: bg.target_type || 'carbon_reduction'
});

export const mapBackendFactorToFrontend = (bf) => ({
  id: bf.id,
  name: bf.name,
  category: bf.category ? (bf.category.charAt(0).toUpperCase() + bf.category.slice(1)) : 'Fuel',
  emissionValue: parseFloat(bf.factor) || 0,
  unit: bf.unit || '',
  status: bf.status ? (bf.status.charAt(0).toUpperCase() + bf.status.slice(1)) : 'Active'
});

export const mapBackendProductToFrontend = (bp) => ({
  id: bp.id,
  name: bp.product_name,
  sku: bp.sku || '',
  carbonFootprint: parseFloat(bp.carbon_footprint) || 0,
  waterFootprint: parseFloat(bp.water_footprint) || 0,
  recyclabilityRate: parseFloat(bp.recyclability_rate) || 0,
  status: bp.status ? (bp.status.charAt(0).toUpperCase() + bp.status.slice(1)) : 'Active'
});

export const mapBackendTransactionToFrontend = (bt) => ({
  id: bt.id ? `TX-${bt.id}` : 'TX-Unknown',
  rawId: bt.id,
  department: bt.department_name || (bt.department ? bt.department.toString() : 'Unknown'),
  departmentId: bt.department,
  source: bt.activity_type || '',
  emissionFactor: bt.emission_factor_name || '',
  emissionFactorId: bt.emission_factor,
  calculatedCo2: parseFloat(bt.calculated_co2) || 0,
  date: bt.transaction_date || '',
  status: 'Approved',
  notes: bt.notes || '',
  quantity: parseFloat(bt.quantity) || 0,
  unit: bt.unit || ''
});
