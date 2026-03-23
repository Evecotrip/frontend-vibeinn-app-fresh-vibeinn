// Centralized user-related types aligned with user-service-schema.prisma
// Reuse core shapes defined in api/interfaces
import type { 
  ProfileInterface, 
  AnonymousProfileInterface,
  UserCollegeInterface,
  PrivacySettingsInterface,
  SocialLinkInterface,
  UserInterestInterface,
  UserSkillInterface,
  UserBadgeInterface,
  UserMetadataInterface
} from "@/api/interfaces";

// ==========================================
// ENUMS (matching Prisma schema)
// ==========================================

export type Gender =
  | "MALE"
  | "FEMALE"
  | "NON_BINARY"
  | "OTHER"
  | "PREFER_NOT_TO_SAY";

export type AcademicRole =
  | "HIGH_SCHOOL_STUDENT"
  | "UNDERGRADUATE"
  | "GRADUATE"
  | "POSTGRADUATE"
  | "PHD_STUDENT"
  | "RESEARCHER"
  | "FACULTY"
  | "ALUMNI"
  | "OTHER";

export type VerificationStatus =
  | "UNVERIFIED"
  | "PENDING"
  | "VERIFIED_CURRENT"
  | "VERIFIED_ALUMNI"
  | "VERIFIED_PROSPECTIVE"
  | "REJECTED"
  | "EXPIRED";

export type StudentStatus =
  | "CURRENT"
  | "ALUMNI"
  | "PROSPECTIVE"
  | "TRANSFERRED"
  | "DROPPED"
  | "SUSPENDED";

export type ProfileVisibility = "PUBLIC" | "FRIENDS" | "PRIVATE";

export type MessagePrivacy = "EVERYONE" | "FOLLOWERS" | "NONE";

export type TagPrivacy = "EVERYONE" | "FOLLOWERS" | "NONE";

export type SocialPlatform =
  | "LINKEDIN"
  | "GITHUB"
  | "TWITTER"
  | "INSTAGRAM"
  | "FACEBOOK"
  | "YOUTUBE"
  | "PORTFOLIO"
  | "WEBSITE"
  | "OTHER";

export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";

export type BadgeType =
  | "ACHIEVEMENT"
  | "VERIFICATION"
  | "SPECIAL"
  | "EVENT"
  | "CONTRIBUTOR"
  | "EARLY_ADOPTER";

// Legacy aliases for backward compatibility
export type ProfileVisibilityResponse = ProfileVisibility;
export type ProfileVisibilityRequest = ProfileVisibility;

// ==========================================
// API RESPONSE/REQUEST TYPES
// ==========================================

// GET /users/profile response
export interface CurrentProfileResponse {
  success: boolean;
  message: string;
  data: {
    profile: ProfileInterface;
  };
}

// PUT /users/profile request body (updated to match new schema)
export interface UpdateProfileRequest {
  // Core profile
  username?: string;
  fullName?: string;
  bio?: string;
  location?: string;
  website?: string;
  
  // Media
  avatarUrl?: string;
  coverImageUrl?: string;
  
  // Personal info
  dateOfBirth?: string; // ISO string
  gender?: Gender;
  academicRole?: AcademicRole;
  
  // Status
  isPublic?: boolean;
}

// Update profile image (narrow request)
export interface UpdateProfileImageRequest {
  avatarUrl: string;
}

// Update privacy settings
export interface UpdatePrivacySettingsRequest {
  profileVisibility?: ProfileVisibility;
  showEmail?: boolean;
  showPhone?: boolean;
  showFollowers?: boolean;
  showFollowing?: boolean;
  allowMessages?: MessagePrivacy;
  allowTags?: TagPrivacy;
  showOnlineStatus?: boolean;
}

// Add social link
export interface AddSocialLinkRequest {
  platform: SocialPlatform;
  url: string;
  displayOrder?: number;
}

// Add interest
export interface AddInterestRequest {
  interest: string;
  category?: string;
}

// Add skill
export interface AddSkillRequest {
  skillName: string;
  proficiency?: SkillLevel;
}

// ==========================================
// USERNAME FLOWS
// ==========================================

export interface GenerateUsernameResponse {
  success: boolean;
  message: string;
  data: { username: string };
}

export interface CheckUsernameAvailabilityResponse {
  success: boolean;
  message: string;
  data: { isAvailable: boolean };
}

export interface UpdateUsernameRequest {
  username: string;
}

export interface UpdateUsernameResponse {
  success: boolean;
  message: string;
  data: { username: string };
}

export interface UsernameSuggestionsRequest {
  fullName: string; // Changed from displayName to match schema
}

export interface UsernameSuggestionsResponse {
  success: boolean;
  message: string;
  data: { suggestions: string[] };
}

export interface ValidateUsernameRequest {
  username: string;
}

export interface ValidateUsernameResponse {
  success: boolean;
  message: string;
  data: { isValid: boolean; error?: string };
}

// ==========================================
// ANONYMOUS PROFILE FLOWS
// ==========================================

export interface CreateAnonymousProfileRequest {
  anonymousName: string;
  anonymousAvatar?: string; // Default avatar
  anonymousAvatarUrl?: string; // Custom avatar
  anonymousBio?: string;
}

export interface CreateAnonymousProfileResponse {
  success: boolean;
  message: string;
  data: {
    anonymousProfile: AnonymousProfileInterface;
  };
}

export interface FetchAnonymousProfileResponse {
  success: boolean;
  message: string;
  data: {
    anonymousProfile: AnonymousProfileInterface;
  };
}

export interface UpdateAnonymousProfileRequest {
  anonymousName?: string;
  anonymousAvatarUrl?: string;
  anonymousBio?: string;
  isActive?: boolean;
}

export interface UpdateAnonymousProfileResponse {
  success: boolean;
  message: string;
  data: {
    anonymousProfile: AnonymousProfileInterface;
  };
}

// Toggle anonymous profile activation
export interface ToggleAnonymousProfileRequest {
  isActive: boolean;
}

// ==========================================
// USER COLLEGE FLOWS
// ==========================================

export interface AddCollegeAffiliationRequest {
  collegeId: string;
  studentId?: string;
  startDate?: string;
  endDate?: string;
  degree?: string;
  major?: string;
  status?: StudentStatus;
}

export interface AddCollegeAffiliationResponse {
  success: boolean;
  message: string;
  data: {
    userCollege: UserCollegeInterface;
  };
}

export interface UpdateCollegeAffiliationRequest {
  studentId?: string;
  startDate?: string;
  endDate?: string;
  degree?: string;
  major?: string;
  status?: StudentStatus;
}

export interface VerifyCollegeRequest {
  userCollegeId: string;
  verificationDocuments: Record<string, any>;
}

// ==========================================
// RE-EXPORTS FOR CONVENIENCE
// ==========================================

export type {
  ProfileInterface,
  AnonymousProfileInterface,
  UserCollegeInterface,
  PrivacySettingsInterface,
  SocialLinkInterface,
  UserInterestInterface,
  UserSkillInterface,
  UserBadgeInterface,
  UserMetadataInterface,
};

