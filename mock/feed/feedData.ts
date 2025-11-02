// Define Post interface
export interface Post {
  id: string;
  username: string;
  userAvatar: string;
  university: string;
  content: string;
  media?: string[];
  videoUrl?: string;
  likes: number;
  comments: number;
  timestamp: string;
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowing?: boolean;
  tags?: string[];
  type?: 'text' | 'image' | 'video';
}

// Sample user avatars
const avatars = [
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/women/68.jpg',
  'https://randomuser.me/api/portraits/men/75.jpg',
  'https://randomuser.me/api/portraits/women/90.jpg',
  'https://randomuser.me/api/portraits/men/18.jpg',
  'https://randomuser.me/api/portraits/women/44.jpg',
  'https://randomuser.me/api/portraits/men/32.jpg',
  'https://randomuser.me/api/portraits/women/68.jpg',
  'https://randomuser.me/api/portraits/men/75.jpg',
  'https://randomuser.me/api/portraits/women/90.jpg',
  'https://randomuser.me/api/portraits/men/18.jpg',
];

// Sample images
const images = [
  'https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1496449903678-68ddcb189a24?ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1496449903678-68ddcb189a24?ixlib=rb-4.0.3',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3',
];

// Sample videos (using Pexels sample videos)
const videos = [
  'https://res.cloudinary.com/dzleurp1h/video/upload/v1757828471/cb15b9f248ce46849a1ca9454cb3f450_vc6gfa.mp4',
  'https://res.cloudinary.com/dzleurp1h/video/upload/v1757768953/56c8af278b9641f3b48e97c626b60e8e_jsx0le.mp4',
  'https://res.cloudinary.com/dzleurp1h/video/upload/v1757828474/655383fe4e0c48b4b19652b91f93ad97_mxmjzc.mp4',
  'https://res.cloudinary.com/dzleurp1h/video/upload/v1757768953/56c8af278b9641f3b48e97c626b60e8e_jsx0le.mp4',
  'https://res.cloudinary.com/dzleurp1h/video/upload/v1757828471/cb15b9f248ce46849a1ca9454cb3f450_vc6gfa.mp4',
  'https://res.cloudinary.com/dzleurp1h/video/upload/v1757768953/5d5302e28336411ab31579a2e9da6783_xlpneg.mp4',
  'https://res.cloudinary.com/dzleurp1h/video/upload/v1757768940/IMG_1430_cchcjh.mov',
  'https://res.cloudinary.com/dzleurp1h/video/upload/v1757828471/5fc34aa10487451caf5d10fc050f9bac_rflu8s.mp4',
  'https://res.cloudinary.com/dzleurp1h/video/upload/v1757768940/IMG_1430_cchcjh.mov',
  'https://res.cloudinary.com/dzleurp1h/video/upload/v1757768953/5d5302e28336411ab31579a2e9da6783_xlpneg.mp4',
  'https://res.cloudinary.com/dzleurp1h/video/upload/v1757828471/5fc34aa10487451caf5d10fc050f9bac_rflu8s.mp4',
  'https://res.cloudinary.com/dzleurp1h/video/upload/v1757768953/5d5302e28336411ab31579a2e9da6783_xlpneg.mp4',
];

// Sample universities
const universities = [
  'Stanford University',
  'MIT',
  'Harvard University',
  'UC Berkeley',
  'UCLA',
  'NYU',
  'University of California, Los Angeles',
  'University of California, Berkeley',
  'University of California, San Diego',
  'University of California, Santa Barbara',
  'University of California, Irvine',
  'University of California, Davis',
  'University of California, Riverside',
];

// Sample tags
const tags = [
  'college', 'study', 'finals', 'campus', 'dorm', 'party',
  'freshman', 'senior', 'gradschool', 'lecture', 'professor',
  'internship', 'research', 'scholarship', 'abroad', 'sports',
  'university', 'campus', 'dorm', 'party',
  'freshman', 'senior', 'gradschool', 'lecture', 'professor',
  'internship', 'research', 'scholarship', 'abroad', 'sports',
  'university', 'campus', 'dorm', 'party',
  'freshman', 'senior', 'gradschool', 'lecture', 'professor',
  'internship', 'research', 'scholarship', 'abroad', 'sports',
];

// Generate mock feed data
export const generateMockFeedData = (count: number = 10): Post[] => {
  const posts: Post[] = [];
  
  for (let i = 0; i < count; i++) {
    // Determine post type
    const typeIndex = Math.floor(Math.random() * 3);
    const type = ['text', 'image', 'video'][typeIndex] as 'text' | 'image' | 'video';
    
    // Generate random number of tags (0-3)
    const tagCount = Math.floor(Math.random() * 4);
    const postTags: string[] = [];
    for (let j = 0; j < tagCount; j++) {
      const randomTag = tags[Math.floor(Math.random() * tags.length)];
      if (!postTags.includes(randomTag)) {
        postTags.push(randomTag);
      }
    }
    
    // Generate random post
    const post: Post = {
      id: `post-${i}`,
      username: `user${i + 1}`,
      userAvatar: avatars[i % avatars.length],
      university: universities[i % universities.length],
      content: getRandomContent(),
      likes: Math.floor(Math.random() * 1000),
      comments: Math.floor(Math.random() * 100),
      timestamp: getRandomTimestamp(),
      isLiked: Math.random() > 0.7,
      isSaved: Math.random() > 0.8,
      isFollowing: Math.random() > 0.9, // Added isFollowing
      tags: tagCount > 0 ? postTags : undefined,
      type,
    };
    
    // Add media based on type
    if (type === 'image') {
      const imageCount = Math.floor(Math.random() * 3) + 1; // 1-3 images
      post.media = [];
      for (let j = 0; j < imageCount; j++) {
        post.media.push(images[(i + j) % images.length]);
      }
    } else if (type === 'video') {
      post.videoUrl = videos[i % videos.length];
      // Add thumbnail as first media item
      post.media = [images[i % images.length]];
    }
    
    posts.push(post);
  }
  
  return posts;
};

// Helper function to generate random content
function getRandomContent(): string {
  const contents = [
    "Just aced my final exam! 🎉 #StudyingPaysOff",
    "Campus looking beautiful today. Love spring semester!",
    "Anyone else struggling with Professor Johnson's assignments? 😩",
    "Dorm room makeover complete! What do you think?",
    "Coffee + Library = Perfect study session",
    "Looking for study group partners for Organic Chemistry. DM me!",
    "Internship application season is stressful but worth it!",
    "Game day! Let's go team! 🏈",
    "New research paper published! So proud of our team's work.",
    "Semester abroad applications are due next week. Don't forget!",
    "Pulled an all-nighter for this project. Need sleep!",
    "Campus food review: dining hall pasta 6/10, could be better",
    "Just registered for next semester's classes. Heavy course load incoming!",
    "Friday night vibes with the roommates 🎵",
    "Study break at the quad. Beautiful day!",
    "Just finished my first semester of college! 🎉",
    "New semester, new me! 💪",
    "First day of classes! 🎒",
    "Just finished my first semester of college! 🎉",
    "New semester, new me! 💪",
    "First day of classes! 🎒",
    "First day of classes! 🎒",
    "First day of classes! 🎒",
  ];
  
  return contents[Math.floor(Math.random() * contents.length)];
}

// Helper function to generate random timestamp
function getRandomTimestamp(): string {
  const units = ['m', 'h', 'd'];
  const unit = units[Math.floor(Math.random() * units.length)];
  const value = Math.floor(Math.random() * 24) + 1;
  
  return `${value}${unit} ago`;
}

// Export mock data
export const mockFeedData = generateMockFeedData(20);








