export const mockActivities = [
  {
    id: 1,
    type: 'system',
    action: 'Logged in',
    description: 'Successful login from new device (MacBook Pro)',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
  },
  {
    id: 2,
    type: 'profile',
    action: 'Profile Updated',
    description: 'Updated emergency contact information',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: 3,
    type: 'security',
    action: 'Password Changed',
    description: 'Password was successfully changed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
  },
  {
    id: 4,
    type: 'training',
    action: 'Completed Training',
    description: 'Finished "Endurance Basics" session',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week ago
  }
];
