export const initialGoals = [
  {
    id: 'G-101',
    name: 'Reduce Fleet Emissions',
    department: 'Logistics',
    targetCo2: 500,
    currentCo2: 390,
    deadline: '2026-12-31',
    status: 'Active',
    description: 'Optimize transit routes, train drivers in eco-driving techniques, and gradually retire older diesel trucks in favor of hybrid or electric cargo vans.'
  },
  {
    id: 'G-102',
    name: 'Transition to Solar Power',
    department: 'Manufacturing',
    targetCo2: 1000,
    currentCo2: 820,
    deadline: '2025-06-30',
    status: 'On Track',
    description: 'Install a 500kW rooftop photovoltaic solar array at the primary manufacturing site to offset grid energy requirements.'
  },
  {
    id: 'G-103',
    name: 'Zero Waste Initiative',
    department: 'Corporate',
    targetCo2: 150,
    currentCo2: 150,
    deadline: '2024-12-31',
    status: 'Completed',
    description: 'Implement a comprehensive waste segregation policy, set up industrial composting for organic waste, and phase out single-use plastics across office premises.'
  },
  {
    id: 'G-104',
    name: 'Supply Chain Audit',
    department: 'Logistics',
    targetCo2: 300,
    currentCo2: 240,
    deadline: '2025-09-30',
    status: 'Active',
    description: 'Evaluate Scope 3 carbon footprints of our top 20 suppliers and establish joint mitigation plans.'
  },
  {
    id: 'G-105',
    name: 'Eco-friendly Packaging',
    department: 'R&D',
    targetCo2: 400,
    currentCo2: 280,
    deadline: '2024-08-31',
    status: 'Delayed',
    description: 'Reformulate packaging materials for the consumer goods division to use 100% post-consumer recycled cardboard and compostable plant-based liners.'
  }
];

export const initialEmissionFactors = [
  {
    id: 'EF-1',
    name: 'Diesel',
    category: 'Fuel',
    emissionValue: 2.68,
    unit: 'kg CO2e/liter',
    status: 'Active'
  },
  {
    id: 'EF-2',
    name: 'Petrol',
    category: 'Fuel',
    emissionValue: 2.31,
    unit: 'kg CO2e/liter',
    status: 'Active'
  },
  {
    id: 'EF-3',
    name: 'Electricity',
    category: 'Utility',
    emissionValue: 0.38,
    unit: 'kg CO2e/kWh',
    status: 'Active'
  },
  {
    id: 'EF-4',
    name: 'Natural Gas',
    category: 'Utility',
    emissionValue: 1.88,
    unit: 'kg CO2e/m³',
    status: 'Active'
  },
  {
    id: 'EF-5',
    name: 'Aviation Fuel',
    category: 'Travel',
    emissionValue: 3.15,
    unit: 'kg CO2e/kg',
    status: 'Inactive'
  }
];

export const initialProductProfiles = [
  {
    id: 'P-101',
    name: 'Eco-Bottle 500ml',
    category: 'Packaging',
    carbonRating: 'A',
    recyclable: 'Yes',
    compliance: 'Compliant'
  },
  {
    id: 'P-102',
    name: 'Smart Sensor Pro',
    category: 'Electronics',
    carbonRating: 'C',
    recyclable: 'No',
    compliance: 'Under Review'
  },
  {
    id: 'P-103',
    name: 'Biodegradable Wrap',
    category: 'Packaging',
    carbonRating: 'A+',
    recyclable: 'Yes',
    compliance: 'Compliant'
  },
  {
    id: 'P-104',
    name: 'Steel Bracket Eco',
    category: 'Hardware',
    carbonRating: 'B',
    recyclable: 'Yes',
    compliance: 'Compliant'
  },
  {
    id: 'P-105',
    name: 'Power Supply Eco',
    category: 'Electronics',
    carbonRating: 'B-',
    recyclable: 'Yes',
    compliance: 'Compliant'
  }
];

export const initialCarbonTransactions = [
  {
    id: 'TX-1001',
    department: 'Logistics',
    source: 'Fleet',
    emissionFactor: 'Diesel',
    calculatedCo2: 15.4,
    date: '2026-07-01',
    status: 'Approved'
  },
  {
    id: 'TX-1002',
    department: 'Manufacturing',
    source: 'Electricity',
    emissionFactor: 'Electricity',
    calculatedCo2: 42.8,
    date: '2026-07-02',
    status: 'Approved'
  },
  {
    id: 'TX-1003',
    department: 'Corporate',
    source: 'Expenses',
    emissionFactor: 'Natural Gas',
    calculatedCo2: 5.1,
    date: '2026-07-03',
    status: 'Pending'
  },
  {
    id: 'TX-1004',
    department: 'R&D',
    source: 'Fleet',
    emissionFactor: 'Petrol',
    calculatedCo2: 3.2,
    date: '2026-07-04',
    status: 'Approved'
  },
  {
    id: 'TX-1005',
    department: 'Manufacturing',
    source: 'Manufacturing',
    emissionFactor: 'Electricity',
    calculatedCo2: 120.5,
    date: '2026-07-05',
    status: 'Approved'
  }
];
