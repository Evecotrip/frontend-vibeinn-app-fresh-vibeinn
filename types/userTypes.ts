// Centralized user-related types inferred from api/user and api/interfaces
// Reuse core shapes defined in api/interfaces
import type { ProfileInterface, AnonymousProfileInterface } from "@/api/interfaces";

// Common enums/unions used by requests
export type Gender =
  | "MALE"
  | "FEMALE"
  | "NON_BINARY"
  | "PREFER_NOT_TO_SAY"
  | "OTHER";

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

// Align with backend Prisma enum: PUBLIC | FRIENDS | COLLEGE | PRIVATE
export type ProfileVisibilityResponse = "PUBLIC" | "FRIENDS" | "COLLEGE" | "PRIVATE";
export type ProfileVisibilityRequest = "PUBLIC" | "FRIENDS" | "COLLEGE" | "PRIVATE";

// /users/profile GET and PUT response wrapper
export interface CurrentProfileResponse {
  success: boolean;
  message: string;
  data: {
    profile: ProfileInterface;
  };
}

// /users/profile PUT request body
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  phoneNumber?: string;
  dateOfBirth?: string; // ISO string; backend converts to Date
  gender?: Gender;
  profileImageUrl?: string;
  coverImageUrl?: string;
  academicRole?: AcademicRole;
  socialRoles?: string[];
  skills?: string[];
  interests?: string[];
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    [key: string]: string | undefined;
  };
  profileVisibility?: ProfileVisibilityRequest;
  showEmail?: boolean;
  showPhone?: boolean;
}

// Narrow request used when only updating profile image
export interface UpdateProfileImageRequest {
  profileImageUrl: string;
}

// Username flows
export interface GenerateUsernameResponse {
  success?: boolean;
  message?: string;
  data: { username: string };
}

export interface CheckUsernameAvailabilityResponse {
  success?: boolean;
  message?: string;
  data: { isAvailable: boolean };
}

export interface UpdateUsernameRequest {
  username: string;
}

export interface UpdateUsernameResponse {
  success?: boolean;
  message?: string;
  data: { username: string };
}

export interface UsernameSuggestionsRequest {
  displayName: string;
}

export interface UsernameSuggestionsResponse {
  success?: boolean;
  message?: string;
  data: { suggestions: string[] };
}

export interface ValidateUsernameRequest {
  username: string;
}

export interface ValidateUsernameResponse {
  success?: boolean;
  message?: string;
  data: { isValid: boolean; error?: string };
}

// Anonymous profile flows
export interface CreateAnonymousProfileRequest {
  anonymousName: string;
  anonymousAvatarUrl?: string; // nullable in DB
  anonymousBio?: string; // nullable in DB
  anonymousInterests?: string[];
  colorTheme?: string; // nullable in DB
}

export interface CreateAnonymousProfileResponse {
  success: boolean;
  message: string;
  data: {
    anonymousProfile: AnonymousProfileInterface;
  };
}

export interface FetchAnonymousProfileResponse {
  success?: boolean;
  message?: string;
  data: {
    anonymousProfile: AnonymousProfileInterface;
  };
}

export interface UpdateAnonymousProfileRequest
  extends Partial<CreateAnonymousProfileRequest> {}

// /user/anony/ids/:authUserId response shape used to pick first anonymousId
export interface AnonymousIdsResponse {
  success?: boolean;
  message?: string;
  data?: {
    anonymousProfiles: Array<{
      anonymousId: string;
    }>;
  };
}

// Convenience re-exports for external modules
export type { ProfileInterface, AnonymousProfileInterface };

