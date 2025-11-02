// notification data - 100 notifications
// liked, commented, followed, saved, tagged, mentioned, shared, etc.
// event related notifications
// community related notifications

export interface Notification {
  id: string;
  type: NotificationType;
  senderName: string;
  senderAvatar: string;
  university?: string;
  timestamp: string;
  isRead: boolean;
  contentId?: string;
  contentPreview?: string;
  eventId?: string;
  eventName?: string;
  eventDate?: string;
  communityId?: string;
  communityName?: string;
  achievementId?: string;
  achievementName?: string;
  badgeId?: string;
  badgeName?: string;
  badgeIcon?: string;
}

export type NotificationType = 
  // Social interactions
  | 'like' | 'comment' | 'follow' | 'save' | 'tag' | 'mention' | 'share'
  // Event related
  | 'event_invite' | 'event_reminder' | 'event_update' | 'event_nearby' | 'rsvp_confirmation'
  // Community related
  | 'community_invite' | 'community_welcome' | 'community_mention' | 'community_trending'
  // Achievement related
  | 'achievement_unlocked' | 'badge_earned' | 'streak_milestone'
  // System notifications
  | 'verification_success' | 'new_feature' | 'app_update';

// Helper function to generate random timestamps within the last 7 days
const getRandomTimestamp = (): string => {
  const now = new Date();
  const randomMinutes = Math.floor(Math.random() * 10080); // Minutes in 7 days
  now.setMinutes(now.getMinutes() - randomMinutes);
  return now.toISOString();
};

// Sample avatar URLs
const avatars = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=100',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100',
];

// Sample universities
const universities = [
  'Stanford University',
  'MIT',
  'Harvard University',
  'UC Berkeley',
  'UCLA',
  'University of Michigan',
  'NYU',
  'Columbia University',
  'Cornell University',
  'Princeton University',
];

// Sample events
const events = [
  { name: 'Spring Fest 2024', date: '2024-04-15T18:00:00Z' },
  { name: 'Tech Hackathon', date: '2024-04-22T09:00:00Z' },
  { name: 'Campus Movie Night', date: '2024-04-18T20:00:00Z' },
  { name: 'Career Fair', date: '2024-04-25T10:00:00Z' },
  { name: 'End of Semester Party', date: '2024-05-10T21:00:00Z' },
  { name: 'Study Group: Finals', date: '2024-05-05T15:00:00Z' },
  { name: 'Basketball Tournament', date: '2024-04-20T14:00:00Z' },
  { name: 'Art Exhibition', date: '2024-04-28T11:00:00Z' },
];

// Sample communities
const communities = [
  'Motivation Station',
  'Study Buddies',
  'Campus Foodies',
  'Fitness Fanatics',
  'Music Lovers',
  'International Students',
  'Tech Enthusiasts',
  'Creative Corner',
];

// Sample achievements and badges
const achievements = [
  { name: 'Social Butterfly', icon: '🦋' },
  { name: 'Content Creator', icon: '🎬' },
  { name: 'Event Organizer', icon: '📅' },
  { name: 'Community Leader', icon: '👑' },
  { name: 'Trending Post', icon: '🔥' },
  { name: '7-Day Streak', icon: '🔄' },
  { name: 'Verified Student', icon: '✅' },
  { name: 'Campus Explorer', icon: '🧭' },
];

// Sample content previews
const contentPreviews = [
  'Just aced my final exam! #CollegeLife',
  'Looking for study partners for tomorrow\'s session',
  'Check out this amazing event on campus!',
  'New art installation at the student center',
  'Anyone want to grab coffee after class?',
  'Sharing my notes from today\'s lecture',
  'Beach trip this weekend! Who\'s in?',
  'My internship experience at Google',
];

// Generate 100 random notifications
export const notifications: Notification[] = Array.from({ length: 100 }, (_, i) => {
  const randomType = (): NotificationType => {
    const types: NotificationType[] = [
      'like', 'comment', 'follow', 'save', 'tag', 'mention', 'share',
      'event_invite', 'event_reminder', 'event_update', 'event_nearby', 'rsvp_confirmation',
      'community_invite', 'community_welcome', 'community_mention', 'community_trending',
      'achievement_unlocked', 'badge_earned', 'streak_milestone',
      'verification_success', 'new_feature', 'app_update'
    ];
    
    // Weight social interactions higher as they're more common
    if (i < 50) {
      return types[Math.floor(Math.random() * 7)]; // Social interactions
    } else if (i < 70) {
      return types[7 + Math.floor(Math.random() * 5)]; // Event related
    } else if (i < 85) {
      return types[12 + Math.floor(Math.random() * 4)]; // Community related
    } else if (i < 95) {
      return types[16 + Math.floor(Math.random() * 3)]; // Achievement related
    } else {
      return types[19 + Math.floor(Math.random() * 3)]; // System notifications
    }
  };

  const type = randomType();
  const senderIndex = Math.floor(Math.random() * avatars.length);
  const senderName = `user${senderIndex + 1}`;
  const senderAvatar = avatars[senderIndex];
  const university = universities[Math.floor(Math.random() * universities.length)];
  const timestamp = getRandomTimestamp();
  const isRead = Math.random() > 0.3; // 30% unread notifications
  
  const notification: Notification = {
    id: `notification-${i + 1}`,
    type,
    senderName,
    senderAvatar,
    university,
    timestamp,
    isRead,
  };

  // Add type-specific data
  if (['like', 'comment', 'save', 'tag', 'mention', 'share'].includes(type)) {
    notification.contentId = `post-${Math.floor(Math.random() * 50)}`;
    notification.contentPreview = contentPreviews[Math.floor(Math.random() * contentPreviews.length)];
  } else if (type.startsWith('event_')) {
    const event = events[Math.floor(Math.random() * events.length)];
    notification.eventId = `event-${Math.floor(Math.random() * 20)}`;
    notification.eventName = event.name;
    notification.eventDate = event.date;
  } else if (type.startsWith('community_')) {
    notification.communityId = `community-${Math.floor(Math.random() * 15)}`;
    notification.communityName = communities[Math.floor(Math.random() * communities.length)];
  } else if (type.includes('achievement') || type.includes('badge') || type.includes('streak')) {
    const achievement = achievements[Math.floor(Math.random() * achievements.length)];
    notification.achievementId = `achievement-${Math.floor(Math.random() * 10)}`;
    notification.achievementName = achievement.name;
    notification.badgeIcon = achievement.icon;
  }

  return notification;
});

// Group notifications by date (today, yesterday, this week, earlier)
export const getGroupedNotifications = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000; // 24 hours in milliseconds
  const thisWeek = today - 6 * 86400000; // 7 days ago
  
  return {
    today: notifications.filter(n => new Date(n.timestamp).getTime() >= today),
    yesterday: notifications.filter(n => {
      const time = new Date(n.timestamp).getTime();
      return time >= yesterday && time < today;
    }),
    thisWeek: notifications.filter(n => {
      const time = new Date(n.timestamp).getTime();
      return time >= thisWeek && time < yesterday;
    }),
    earlier: notifications.filter(n => new Date(n.timestamp).getTime() < thisWeek),
  };
};

// Get unread notification count
export const getUnreadCount = () => {
  return notifications.filter(n => !n.isRead).length;
};

// Helper function to get notification message based on type
export const getNotificationMessage = (notification: Notification): string => {
  const { type, senderName, contentPreview, eventName, communityName, achievementName } = notification;
  
  switch (type) {
    case 'like':
      return `${senderName} liked your post: "${contentPreview?.substring(0, 30)}${contentPreview && contentPreview.length > 30 ? '...' : ''}"`;
    case 'comment':
      return `${senderName} commented on your post: "${contentPreview?.substring(0, 30)}${contentPreview && contentPreview.length > 30 ? '...' : ''}"`;
    case 'follow':
      return `${senderName} started following you`;
    case 'save':
      return `${senderName} saved your post`;
    case 'tag':
      return `${senderName} tagged you in a post`;
    case 'mention':
      return `${senderName} mentioned you in a comment`;
    case 'share':
      return `${senderName} shared your post`;
    case 'event_invite':
      return `${senderName} invited you to ${eventName}`;
    case 'event_reminder':
      return `Reminder: ${eventName} is happening soon`;
    case 'event_update':
      return `${eventName} has been updated`;
    case 'event_nearby':
      return `${eventName} is happening near you`;
    case 'rsvp_confirmation':
      return `Your RSVP for ${eventName} is confirmed`;
    case 'community_invite':
      return `${senderName} invited you to join ${communityName}`;
    case 'community_welcome':
      return `Welcome to ${communityName}!`;
    case 'community_mention':
      return `${senderName} mentioned you in ${communityName}`;
    case 'community_trending':
      return `${communityName} is trending right now`;
    case 'achievement_unlocked':
      return `You've unlocked the ${achievementName} achievement!`;
    case 'badge_earned':
      return `You've earned the ${achievementName} badge!`;
    case 'streak_milestone':
      return `You've reached a ${achievementName} milestone!`;
    case 'verification_success':
      return `Your university account has been successfully verified`;
    case 'new_feature':
      return `Check out Vibeinn's new features!`;
    case 'app_update':
      return `Vibeinn has been updated to the latest version`;
    default:
      return `New notification from ${senderName}`;
  }
};
