export interface ProfileInterface {
    profileId: string;
    authUserId: string;
    firstName: string | null;
    lastName: string | null;
    displayName: string | null;
    userName: string | null;
    bio: string | null;
    profileImageUrl: string | null;
    coverImageUrl: string | null;
    dateOfBirth: string | null;
    phoneNumber: string | null;
    gender: string | null;
    academicRole: string | null;
    socialRoles: string[];
    skills: string[];
    interests: string[];
    socialLinks: Record<string, string>;
    profileVisibility: 'PUBLIC' | 'FRIENDS' | 'COLLEGE' | 'PRIVATE';
    showEmail: boolean;
    showPhone: boolean;
    createdAt: string;
    updatedAt: string;
    anonymousProfiles: any[]; // You may want to define a specific interface for this
    userColleges: any[]; // You may want to define a specific interface for this
}

export interface AnonymousProfileInterface {
    anonymousId: string;
    authUserId: string;
    anonymousName: string;
    anonymousAvatarUrl: string | null;
    anonymousBio: string | null;
    anonymousInterests: string[];
    colorTheme: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}