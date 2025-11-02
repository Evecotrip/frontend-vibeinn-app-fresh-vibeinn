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
  type?: 'text' | 'image' | 'video';  // videos for vertical video posts (always)
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

// Sample thumbnails for videos
const thumbnails = [
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

// Generate mock vertical video data
export const generateMockVerticalVideoData = (count: number = 15): Post[] => {
  const posts: Post[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate random number of tags (0-3)
    const tagCount = Math.floor(Math.random() * 4);
    const postTags: string[] = [];
    for (let j = 0; j < tagCount; j++) {
      const randomTag = tags[Math.floor(Math.random() * tags.length)];
      if (!postTags.includes(randomTag)) {
        postTags.push(randomTag);
      }
    }
    
    // Generate random video post
    const post: Post = {
      id: `video-${i}`,
      username: `videouser${i + 1}`,
      userAvatar: avatars[i % avatars.length],
      university: universities[i % universities.length],
      content: getRandomVideoContent(),
      likes: Math.floor(Math.random() * 5000) + 100, // Higher likes for videos
      comments: Math.floor(Math.random() * 500) + 10, // More comments for videos
      timestamp: getRandomTimestamp(),
      isLiked: Math.random() > 0.6,
      isSaved: Math.random() > 0.7,
      isFollowing: Math.random() > 0.8,
      tags: tagCount > 0 ? postTags : undefined,
      type: 'video', // Always video for vertical videos
      videoUrl: videos[i % videos.length],
      media: [thumbnails[i % thumbnails.length]], // Thumbnail as first media item
    };
    
    posts.push(post);
  }
  
  return posts;
};

// Helper function to generate random video content
function getRandomVideoContent(): string {
  const videoContents = [
    "Day in the life at college! 🎓 #CollegeLife",
    "Finals week survival guide 📚 #StudyTips",
    "Dorm room tour! Rate my setup 🏠",
    "Campus food taste test! 🍕 #CampusFood",
    "Study session with friends 👥 #StudyGroup",
    "Late night library vibes 🌙 #LibraryLife",
    "Game day preparation! 🏈 #GameDay",
    "Professor's reaction compilation 😂 #ProfLife",
    "Semester abroad adventures! ✈️ #StudyAbroad",
    "Campus workout routine 💪 #FitnessMotivation",
    "Chemistry lab experiments 🧪 #ScienceLife",
    "Art project showcase 🎨 #CreativeProcess",
    "Music practice session 🎵 #MusicStudent",
    "Engineering project demo 🔧 #Engineering",
    "Graduation preparation! 🎓 #AlmostThere",
    "First day jitters 😅 #NewStudent",
    "Club meeting highlights 🤝 #StudentOrgs",
    "Career fair prep tips 💼 #CareerGoals",
    "Weekend campus adventures 🌟 #WeekendVibes",
    "Exam stress relief methods 🧘 #MentalHealth",
    "Cooking in the dorm kitchen 👨‍🍳 #DormLife",
    "Sports practice highlights ⚽ #StudentAthlete",
    "Research project update 🔬 #ResearchLife",
    "Campus tour for new students 🚶 #CampusTour",
    "Graduation ceremony prep 🎉 #GraduationDay",
  ];
  
  return videoContents[Math.floor(Math.random() * videoContents.length)];
}

// Helper function to generate random timestamp
function getRandomTimestamp(): string {
  const units = ['m', 'h', 'd'];
  const unit = units[Math.floor(Math.random() * units.length)];
  const value = Math.floor(Math.random() * 24) + 1;
  
  return `${value}${unit} ago`;
}

// Export mock vertical video data
export const mockVerticalVideoData = generateMockVerticalVideoData(20);