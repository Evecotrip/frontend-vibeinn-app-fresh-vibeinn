// Updated to match user-service-schema.prisma
export interface ProfileInterface {
    id: string; // UserProfile.id (UUID)
    tenantId: string;
    authUserId: string;
    
    // Core profile data
    username: string;
    slug: string;
    fullName: string | null;
    bio: string | null;
    location: string | null;
    website: string | null;
    
    // Media
    avatarUrl: string | null;
    coverImageUrl: string | null;
    
    // Personal info
    dateOfBirth: string | null; // ISO date string
    gender: 'MALE' | 'FEMALE' | 'NON_BINARY' | 'OTHER' | 'PREFER_NOT_TO_SAY' | null;
    academicRole: 'HIGH_SCHOOL_STUDENT' | 'UNDERGRADUATE' | 'GRADUATE' | 'POSTGRADUATE' | 'PHD_STUDENT' | 'RESEARCHER' | 'FACULTY' | 'ALUMNI' | 'OTHER' | null;
    
    // Status
    isPublic: boolean;
    isVerified: boolean;
    verificationBadge: string | null;
    
    // Counters
    followerCount: number;
    followingCount: number;
    postCount: number;
    
    // Timestamps
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    
    // Related data (optional, populated on demand)
    collegeAffiliations?: UserCollegeInterface[];
    anonymousProfile?: AnonymousProfileInterface;
    privacySettings?: PrivacySettingsInterface;
    socialLinks?: SocialLinkInterface[];
    interests?: UserInterestInterface[];
    skills?: UserSkillInterface[];
    badges?: UserBadgeInterface[];
    metadata?: UserMetadataInterface;
}

// Updated to match user-service-schema.prisma
export interface AnonymousProfileInterface {
    id: string; // AnonymousProfile.id (UUID)
    tenantId: string;
    userProfileId: string;
    
    // Anonymous identity
    anonymousName: string;
    anonymousAvatar: string; // Default avatar
    anonymousAvatarUrl: string | null; // Custom avatar
    anonymousBio: string | null;
    
    // Status
    isActive: boolean;
    activatedAt: string | null;
    deactivatedAt: string | null;
    
    // Timestamps
    createdAt: string;
    updatedAt: string;
}

// User-College relationship
export interface UserCollegeInterface {
    userCollegeId: string;
    tenantId: string;
    authUserId: string;
    collegeId: string;
    studentId: string | null;
    verificationStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED_CURRENT' | 'VERIFIED_ALUMNI' | 'VERIFIED_PROSPECTIVE' | 'REJECTED' | 'EXPIRED';
    status: 'CURRENT' | 'ALUMNI' | 'PROSPECTIVE' | 'TRANSFERRED' | 'DROPPED' | 'SUSPENDED';
    startDate: string | null;
    endDate: string | null;
    degree: string | null;
    major: string | null;
    verificationDocuments: Record<string, any>;
    verifiedAt: string | null;
    verifiedBy: string | null;
    createdAt: string;
    updatedAt: string;
}

// Privacy Settings
export interface PrivacySettingsInterface {
    id: string;
    tenantId: string;
    userProfileId: string;
    profileVisibility: 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
    showEmail: boolean;
    showPhone: boolean;
    showFollowers: boolean;
    showFollowing: boolean;
    allowMessages: 'EVERYONE' | 'FOLLOWERS' | 'NONE';
    allowTags: 'EVERYONE' | 'FOLLOWERS' | 'NONE';
    showOnlineStatus: boolean;
    createdAt: string;
    updatedAt: string;
}

// Social Link
export interface SocialLinkInterface {
    id: string;
    tenantId: string;
    userProfileId: string;
    platform: 'LINKEDIN' | 'GITHUB' | 'TWITTER' | 'INSTAGRAM' | 'FACEBOOK' | 'YOUTUBE' | 'PORTFOLIO' | 'WEBSITE' | 'OTHER';
    url: string;
    displayOrder: number;
    createdAt: string;
}

// User Interest
export interface UserInterestInterface {
    id: string;
    tenantId: string;
    userProfileId: string;
    interest: string;
    category: string | null;
    createdAt: string;
}

// User Skill
export interface UserSkillInterface {
    id: string;
    tenantId: string;
    userProfileId: string;
    skillName: string;
    proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    verified: boolean;
    createdAt: string;
}

// User Badge
export interface UserBadgeInterface {
    id: string;
    tenantId: string;
    userProfileId: string;
    badgeType: 'ACHIEVEMENT' | 'VERIFICATION' | 'SPECIAL' | 'EVENT' | 'CONTRIBUTOR' | 'EARLY_ADOPTER';
    badgeName: string;
    badgeIcon: string;
    badgeColor: string | null;
    description: string | null;
    awardedAt: string;
    expiresAt: string | null;
}

// User Metadata
export interface UserMetadataInterface {
    id: string;
    tenantId: string;
    userProfileId: string;
    onboardingCompleted: boolean;
    profileCompletion: number;
    lastActiveAt: string | null;
    timezone: string | null;
    language: string | null;
    customFields: Record<string, any> | null;
    createdAt: string;
    updatedAt: string;
}