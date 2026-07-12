export const socialKPIs = {
  treesPlanted: 1250,
  activeVolunteers: 342,
  volunteerHours: 1840,
  socialScore: 74,
};

export const csrActivities = [
  {
    id: 1,
    title: 'Tree Plantation Drive',
    category: 'Environment',
    date: '2024-03-15',
    location: 'City Park',
    organizer: 'Green Team',
    participants: 45,
    maxParticipants: 50,
    progress: 90,
    image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&q=80',
  },
  {
    id: 2,
    title: 'Blood Donation Camp',
    category: 'Health',
    date: '2024-04-02',
    location: 'Main Office, Hall B',
    organizer: 'HR Dept',
    participants: 120,
    maxParticipants: 200,
    progress: 60,
    image: 'https://images.unsplash.com/photo-1536856136534-bb679c52a9aa?w=400&q=80',
  },
  {
    id: 3,
    title: 'Beach Cleanup',
    category: 'Community',
    date: '2024-04-18',
    location: 'Sunny Beach',
    organizer: 'Logistics Team',
    participants: 28,
    maxParticipants: 40,
    progress: 70,
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
  },
  {
    id: 4,
    title: 'ESG Awareness Workshop',
    category: 'Education',
    date: '2024-05-10',
    location: 'Virtual',
    organizer: 'Corporate',
    participants: 150,
    maxParticipants: 500,
    progress: 30,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&q=80',
  },
];

export const employeeParticipation = [
  { id: 1, employee: 'Sarah Jenkins', department: 'Sales', activity: 'Tree Plantation', proof: 'photo_1.jpg', points: 50, status: 'Approved' },
  { id: 2, employee: 'Michael Chen', department: 'R&D', activity: 'Blood Donation', proof: 'cert_84.pdf', points: 100, status: 'Pending' },
  { id: 3, employee: 'Priya Sharma', department: 'Logistics', activity: 'Beach Cleanup', proof: 'img_092.png', points: 75, status: 'Approved' },
  { id: 4, employee: 'David Miller', department: 'Manufacturing', activity: 'ESG Workshop', proof: 'attendance.pdf', points: 20, status: 'Rejected' },
  { id: 5, employee: 'Emma Watson', department: 'Corporate', activity: 'Tree Plantation', proof: 'selfie.jpg', points: 50, status: 'Approved' },
];

export const diversityData = {
  gender: [
    { name: 'Female', value: 48 },
    { name: 'Male', value: 50 },
    { name: 'Other', value: 2 },
  ],
  department: [
    { name: 'Sales', value: 30 },
    { name: 'Engineering', value: 45 },
    { name: 'HR', value: 10 },
    { name: 'Marketing', value: 15 },
  ],
  engagement: 78, 
};

export const departmentParticipation = [
  { department: 'Sales', participation: 65 },
  { department: 'Manufacturing', participation: 42 },
  { department: 'Logistics', participation: 55 },
  { department: 'Corporate', participation: 85 },
  { department: 'R&D', participation: 72 },
];

export const leaderboardData = [
  { rank: 1, employee: 'Elena Rostova', department: 'Corporate', xp: 4500, activities: 18 },
  { rank: 2, employee: 'Marcus Johnson', department: 'Sales', xp: 3850, activities: 15 },
  { rank: 3, employee: 'Priya Sharma', department: 'Logistics', xp: 3200, activities: 12 },
  { rank: 4, employee: 'John Doe', department: 'R&D', xp: 2900, activities: 10 },
  { rank: 5, employee: 'Sarah Jenkins', department: 'Sales', xp: 2750, activities: 9 },
];
