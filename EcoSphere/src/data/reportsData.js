export const reportCardsData = [
  {
    id: 1,
    title: 'Environmental Report',
    description: 'Emission trends, CO₂ analysis and environmental KPIs',
    icon: 'Leaf',
    type: 'environmental'
  },
  {
    id: 2,
    title: 'Social Report',
    description: 'CSR activities, participation and diversity metrics',
    icon: 'Users',
    type: 'social'
  },
  {
    id: 3,
    title: 'Governance Report',
    description: 'Policies, audits and compliance overview',
    icon: 'Briefcase',
    type: 'governance'
  },
  {
    id: 4,
    title: 'ESG Summary',
    description: 'Executive ESG overview with combined score',
    icon: 'BarChart2',
    type: 'summary'
  }
];

export const dummyReportPreviewData = {
  environmental: {
    title: 'Environmental Report',
    metrics: [
      { label: 'Carbon Emission', value: '1250 kg' },
      { label: 'Reduction', value: '18%' },
      { label: 'Best Department', value: 'IT' },
      { label: 'Worst Department', value: 'Manufacturing' },
      { label: 'Status', value: 'Improving' }
    ],
    executiveSummary: 'Overall environmental impact has reduced significantly this quarter, primarily driven by IT department optimizations.',
    keyFindings: [
      'Carbon footprint down by 18%.',
      'Water usage stabilized.',
      'Manufacturing dept still lagging in recycling metrics.'
    ],
    recommendations: 'Implement targeted recycling training for Manufacturing. Continue IT remote work policies.'
  },
  social: {
    title: 'Social Report',
    metrics: [
      { label: 'CSR Participation', value: '82%' },
      { label: 'Volunteer Hours', value: '1,840' },
      { label: 'Diversity Score', value: '88/100' },
      { label: 'Top Contributor', value: 'Elena Rostova' },
      { label: 'Status', value: 'Excellent' }
    ],
    executiveSummary: 'Strong engagement in CSR activities with over 80% participation across the company.',
    keyFindings: [
      'Volunteer hours exceeded quarterly goal by 15%.',
      'Diversity score improved in management tiers.',
      'Logistics department showed highest engagement growth.'
    ],
    recommendations: 'Launch a new recognition program for top volunteers to sustain momentum.'
  },
  governance: {
    title: 'Governance Report',
    metrics: [
      { label: 'Policies Active', value: '24' },
      { label: 'Audits Passed', value: '100%' },
      { label: 'Compliance Issues', value: '0' },
      { label: 'Risk Level', value: 'Low' },
      { label: 'Status', value: 'Compliant' }
    ],
    executiveSummary: 'Perfect compliance record maintained across all departments with zero active risk flags.',
    keyFindings: [
      'All 24 mandatory policies acknowledged by staff.',
      'External data audit passed with no infractions.',
      'Vendor risk assessment completed successfully.'
    ],
    recommendations: 'Begin preparations for the upcoming Q4 financial compliance audit.'
  },
  summary: {
    title: 'ESG Summary',
    metrics: [
      { label: 'Overall ESG Score', value: '85/100' },
      { label: 'YTD Progress', value: '+12%' },
      { label: 'Rank in Industry', value: 'Top 10%' },
      { label: 'Goals Met', value: '8/10' },
      { label: 'Status', value: 'On Track' }
    ],
    executiveSummary: 'The company is outperforming industry benchmarks, solidifying our position as an ESG leader.',
    keyFindings: [
      'Overall score increased by 12% YTD.',
      'Currently ranking in the top 10% of our sector.',
      '8 out of 10 sustainability goals met.'
    ],
    recommendations: 'Publish these results in the annual stakeholder report to attract green investment.'
  }
};

export const recentReportsData = [
  { id: 1, name: 'Q1 Environmental Emissions', department: 'Manufacturing', generatedBy: 'Jane Doe', date: '2024-04-01', status: 'Completed' },
  { id: 2, name: 'Annual CSR Participation', department: 'Corporate', generatedBy: 'Sarah Jenkins', date: '2024-03-28', status: 'Completed' },
  { id: 3, name: 'Governance Audit Summary', department: 'Legal', generatedBy: 'Michael Chen', date: '2024-03-15', status: 'Completed' },
  { id: 4, name: 'Logistics Carbon Footprint', department: 'Logistics', generatedBy: 'Jane Doe', date: '2024-02-28', status: 'Completed' },
  { id: 5, name: 'Diversity & Inclusion Metrics', department: 'HR', generatedBy: 'Priya Sharma', date: '2024-02-10', status: 'Completed' }
];

export const aiInsightsData = [
  'Environmental emissions reduced by 14% compared to last quarter.',
  'CSR participation increased by 11% across all departments.',
  'Governance compliance improved significantly with 0 new issues.',
];

export const aiRecommendation = 'Increase recycling initiatives in Manufacturing Department to meet Q3 goals.';

export const reportAnalyticsData = {
  total: 145,
  environmental: 42,
  social: 36,
  governance: 29,
  summary: 38
};

export const dummyChartData = [
  { month: 'Jan', score: 65 },
  { month: 'Feb', score: 68 },
  { month: 'Mar', score: 72 },
  { month: 'Apr', score: 75 },
  { month: 'May', score: 80 },
  { month: 'Jun', score: 85 }
];
