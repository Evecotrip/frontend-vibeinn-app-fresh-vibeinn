// Shared College-related types inferred from college-service Prisma schema
// Dates are represented as ISO strings in the frontend types

// Enums (mirror Prisma)
export enum CollegeType {
  UNIVERSITY = "UNIVERSITY",
  COMMUNITY_COLLEGE = "COMMUNITY_COLLEGE",
  TRADE_SCHOOL = "TRADE_SCHOOL",
  TECHNICAL_INSTITUTE = "TECHNICAL_INSTITUTE",
  ART_SCHOOL = "ART_SCHOOL",
  BUSINESS_SCHOOL = "BUSINESS_SCHOOL",
  MEDICAL_SCHOOL = "MEDICAL_SCHOOL",
  LAW_SCHOOL = "LAW_SCHOOL",
  ONLINE_UNIVERSITY = "ONLINE_UNIVERSITY",
  OTHER = "OTHER",
}

export enum VerificationStatus {
  UNVERIFIED = "UNVERIFIED",
  PENDING = "PENDING",
  UNDER_REVIEW = "UNDER_REVIEW",
  VERIFIED_CURRENT = "VERIFIED_CURRENT",
  VERIFIED_ALUMNI = "VERIFIED_ALUMNI",
  VERIFIED_FACULTY = "VERIFIED_FACULTY",
  VERIFIED_PROSPECTIVE = "VERIFIED_PROSPECTIVE",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
  SUSPENDED = "SUSPENDED",
}

export enum StudentStatus {
  CURRENT = "CURRENT",
  ALUMNI = "ALUMNI",
  PROSPECTIVE = "PROSPECTIVE",
  TRANSFERRED = "TRANSFERRED",
  DROPPED = "DROPPED",
  SUSPENDED = "SUSPENDED",
  ON_LEAVE = "ON_LEAVE",
  FACULTY = "FACULTY",
  STAFF = "STAFF",
}

export enum CommunityType {
  GENERAL = "GENERAL",
  ALUMNI = "ALUMNI",
  DEPARTMENT = "DEPARTMENT",
  YEAR = "YEAR",
  CLUB = "CLUB",
  ACADEMIC = "ACADEMIC",
  SOCIAL = "SOCIAL",
  CAREER = "CAREER",
}

export enum PrivacyLevel {
  PUBLIC = "PUBLIC",
  COLLEGE_ONLY = "COLLEGE_ONLY",
  INVITE_ONLY = "INVITE_ONLY",
  ADMIN_APPROVAL = "ADMIN_APPROVAL",
  PRIVATE = "PRIVATE",
}

export enum MemberRole {
  MEMBER = "MEMBER",
  MODERATOR = "MODERATOR",
  ADMIN = "ADMIN",
  CREATOR = "CREATOR",
}

export enum MemberStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BANNED = "BANNED",
  PENDING = "PENDING",
}

export enum DocumentType {
  STUDENT_ID = "STUDENT_ID",
  ENROLLMENT_LETTER = "ENROLLMENT_LETTER",
  TRANSCRIPT = "TRANSCRIPT",
  DIPLOMA = "DIPLOMA",
  SCHEDULE = "SCHEDULE",
  TUITION_RECEIPT = "TUITION_RECEIPT",
  ALUMNI_CARD = "ALUMNI_CARD",
  FACULTY_ID = "FACULTY_ID",
  ACCEPTANCE_LETTER = "ACCEPTANCE_LETTER",
  OTHER = "OTHER",
}

export enum UploadStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CORRUPTED = "CORRUPTED",
}

export enum ReviewStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  FLAGGED = "FLAGGED",
}

// Interfaces (flat shapes used by API responses/UI)

export interface CollegeInterface {
  collegeId: string;
  name: string;
  shortName: string | null;
  description: string | null;
  location: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  zipCode: string | null;
  website: string | null;
  email: string | null;
  phoneNumber: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  colors: Record<string, string>; // brand colors map
  collegeType: CollegeType;
  isPublic: boolean;
  foundedYear: number | null;
  studentCount: number | null;
  emailDomains: string[]; // verification email domains
  verificationRequirements: Record<string, any>;
  requiresManualReview: boolean;
  autoVerifyDomains: boolean;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  // Relations (optional in API payloads)
  userColleges?: UserCollegeInterface[];
  communities?: CollegeCommunityInterface[];
  verificationDocs?: VerificationDocumentInterface[];
}

export interface UserCollegeInterface {
  userCollegeId: string;
  authUserId: string;
  collegeId: string;
  studentId: string | null;
  institutionalEmail: string | null;
  degree: string | null;
  major: string | null;
  minor: string | null;
  graduationYear: number | null;
  gpa: number | null;
  startDate: string | null; // ISO date
  endDate: string | null; // ISO date
  expectedGraduation: string | null; // ISO date
  verificationStatus: VerificationStatus;
  studentStatus: StudentStatus;
  verifiedAt: string | null;
  verifiedBy: string | null; // admin authUserId
  rejectionReason: string | null;
  verificationNotes: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  // Relations
  verificationDocuments?: VerificationDocumentInterface[];
  communityMemberships?: CommunityMemberInterface[];
}

export interface CollegeCommunityInterface {
  communityId: string;
  name: string;
  description: string;
  collegeId: string;
  communityType: CommunityType;
  privacyLevel: PrivacyLevel;
  accessRequirements: Record<string, any>;
  requiresApproval: boolean;
  isActive: boolean;
  imageUrl: string | null;
  memberCount: number;
  createdBy: string; // authUserId
  createdAt: string;
  updatedAt: string;
  // Relations
  members?: CommunityMemberInterface[];
}

export interface CommunityMemberInterface {
  memberId: string;
  communityId: string;
  userCollegeId: string;
  role: MemberRole;
  status: MemberStatus;
  canPost: boolean;
  canComment: boolean;
  canModerate: boolean;
  joinedAt: string;
  lastActiveAt: string | null;
}

export interface VerificationDocumentInterface {
  documentId: string;
  collegeId: string;
  userCollegeId: string;
  documentType: DocumentType;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadStatus: UploadStatus;
  reviewStatus: ReviewStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  rejectionReason: string | null;
  isEncrypted: boolean;
  checksumHash: string | null;
  scheduledDeleteAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Convenience compound shapes
export interface CollegeWithRelations extends CollegeInterface {
  userColleges: UserCollegeInterface[];
  communities: CollegeCommunityInterface[];
  verificationDocs: VerificationDocumentInterface[];
}

