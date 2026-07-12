export const initialBadges = [
  {
    id: 'BDG-601',
    icon: '🌱',
    name: 'Green Beginner',
    description: 'Awarded to employees upon joining their very first ESG sustainability challenge.',
    unlockRule: 'Participate in 1 Challenge',
    criteria: 'Join any active challenge and upload initial progress.',
    xpRequired: 50,
    status: 'Unlocked',
    earnedBy: ['Rahul', 'Sneha', 'Aditi Rao', 'Priya', 'Amit']
  },
  {
    id: 'BDG-602',
    icon: '♻️',
    name: 'Carbon Saver',
    description: 'Unlocked by successfully completing waste management or carbon footprint challenges.',
    unlockRule: 'Complete 1 Waste or Carbon Challenge',
    criteria: 'Achieve 100% completion on a waste reduction or transportation challenge.',
    xpRequired: 100,
    status: 'Unlocked',
    earnedBy: ['Sneha', 'Aditi Rao']
  },
  {
    id: 'BDG-603',
    icon: '🌍',
    name: 'Sustainability Champion',
    description: 'Recognizes members who have achieved a cumulative milestone of 300 XP in Gamification.',
    unlockRule: 'Earn 300 total XP from Challenges',
    criteria: 'Acquire at least 300 approved XP from the gamification challenges catalog.',
    xpRequired: 300,
    status: 'Unlocked',
    earnedBy: ['Aditi Rao']
  },
  {
    id: 'BDG-604',
    icon: '⭐',
    name: 'Team Player',
    description: 'Awarded when a department achieves 80% overall participation in sustainability sprints.',
    unlockRule: 'Department achieves 80% participation',
    criteria: 'Collaborate with your department to log group completions on ESG targets.',
    xpRequired: 150,
    status: 'Locked',
    earnedBy: []
  },
  {
    id: 'BDG-605',
    icon: '🏆',
    name: 'ESG Hero',
    description: 'The highest honor, awarded for achieving a cumulative 1,000 XP in ESG activities.',
    unlockRule: 'Earn 1000 total XP',
    criteria: 'Become a beacon of sustainability by scoring 1,000 XP through approved initiatives.',
    xpRequired: 1000,
    status: 'Locked',
    earnedBy: []
  }
];
