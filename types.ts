export type Role = 'student' | 'admin' | 'faculty' | 'canteen';
export type AccountStatus = 'Active' | 'Disabled';

// --- Whitelist Entry ---

export interface WhitelistEntry {
  email: string;
  role: Role;
  id: number;
  fullName: string;
  department: string;
}

// --- Administrative ---

export interface AdminLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetId: string;
  targetName: string;
  timestamp: number;
  details?: string;
}

// --- Auth User ---

export interface User {
  id: string;
  numericId: number;
  email: string;
  fullName: string;
  department: string;
  role: Role;
  status: AccountStatus;
  createdAt: number;
  preferredName?: string;
  profilePhoto?: string;
  lastLogin: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// --- Device Trust ---

export interface TrustedDevice {
  deviceId: string;
  email: string;
  role: Role;
  trustedAt: number;
  expiresAt: number;
}

// --- Campus Directory ---

export type OrgType = 'club' | 'library' | 'committee' | 'cell' | 'service';
export type OrgStatus = 'active' | 'inactive';

export interface SocialLinks {
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
}

export interface CampusOrg {
  id: string;
  name: string;
  type?: OrgType;
  description?: string;
  website?: string;
  email?: string;
  logo?: string;
  socialLinks?: SocialLinks;
  status?: OrgStatus;
  facultyAdvisor?: string;
}

// --- Canteen Module ---

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner';
export type OrderStatus = 'Pending' | 'Served' | 'Expired' | 'Cancelled';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: MealType;
  available: boolean;
  createdBy: string;
}

export interface CanteenConfig {
  isOrderingOpen: Record<MealType, boolean>;
  menu: MenuItem[];
}

export interface Order {
  id: string;
  studentId: string;
  studentEmail: string;
  studentName: string;
  items: { name: string; quantity: number }[];
  total: number;
  status: OrderStatus;
  timestamp: number;
  servedTimestamp?: number;
  cancelReason?: string;
  declineReason?: string;
  type: MealType;
  feedbackSubmitted: boolean;
}

export interface Feedback {
  orderId: string;
  taste: number;
  quantity: number;
  hygiene: number;
}

export type GeneralFeedbackCategory = 'Service Speed' | 'Staff Behavior' | 'Pricing' | 'Hygiene' | 'Other';

export interface GeneralFeedback {
  id: string;
  category: GeneralFeedbackCategory;
  comment: string;
  timestamp: number;
  isAnonymous: boolean;
  reporterEmail?: string;
}

// --- Lost & Found ---

export type LFCategory = 'ID Card' | 'Wallet' | 'Electronics' | 'Documents' | 'Keys' | 'Other';
export type LFStatus = 'Lost' | 'Found' | 'PendingHandover' | 'Collected';
export type LFPostType = 'LostReport' | 'FoundReport';

export interface LFComment {
  id: string;
  userEmail: string;
  text: string;
  timestamp: number;
}

export interface LFItem {
  id: string;
  type: LFPostType;
  category: LFCategory;
  title: string;
  description: string;
  location: string;
  dateTime: string;
  status: LFStatus;
  reporterId: string;
  reporterEmail: string;
  finderId?: string;
  finderEmail?: string;
  claimantId?: string;
  claimantEmail?: string;
  itemImage?: string;
  handoverImage?: string;
  createdAt: number;
  isSensitive: boolean;
  comments: LFComment[];
}

// --- Opportunities ---

export type OpportunityStatus = 'Pending' | 'Active' | 'Expired' | 'Rejected';
export type OpportunityMode = 'Online' | 'Offline' | 'Hybrid';

export interface OpportunityPost {
  id: string;
  title: string;
  mode: OpportunityMode;
  deadline: string;
  description?: string;
  documentUrl?: string;
  externalUrl?: string;
  status: OpportunityStatus;
  posterId: string;
  posterEmail: string;
  posterRole: Role;
  createdAt: number;
}

// --- Resources ---

export type ExamType = 'End-Sem' | 'Mid-Sem' | 'CA1' | 'CA2';
export type ResourceCategory = 'Paper' | 'Notes';

export interface QuestionPaper {
  id: string;
  year: string;
  semester: string;
  examType?: ExamType;
  subject: string;
  branch: string;
  pdfUrl: string;
  uploaderId: string;
  uploaderEmail: string;
  uploaderName: string;
  resourceType: ResourceCategory;
  fileHash: string;
  createdAt: number;
  isArchived: boolean;
}

export type HelpCategory = 'Academic' | 'Skill-based';
export type SessionType = 'Individual' | 'Group';
export type HelpRequestStatus = 'Open' | 'Matched' | 'Scheduled' | 'Completed' | 'Archived';

export interface HelpRequest {
  id: string;
  requesterEmail: string;
  topic: string;
  category: HelpCategory;
  sessionType: SessionType;
  description?: string;
  preferredTime?: string;
  preferredPlace?: string;
  status: HelpRequestStatus;
  helperEmail?: string;
  helperSessionType?: SessionType;
  createdAt: number;
}

export interface SkillOffer {
  id: string;
  expertEmail: string;
  subject: string;
  category: HelpCategory;
  description: string;
  proficiencyPdfUrl: string;
  createdAt: number;
}

// --- Notice Board ---

export type NoticeAudience = 'all' | 'student' | 'faculty';
export type NoticePriority = 'Normal' | 'Important' | 'Urgent';

export interface Notice {
  id: string;
  title: string;
  body: string;
  publishedBy: string;
  publisherEmail: string;
  publisherRole: Role;
  audience: NoticeAudience;
  priority: NoticePriority;
  attachmentUrl?: string;
  createdAt: number;
  isArchived: boolean;
}

// --- Notifications ---

export type NotificationCategory =
  | 'food_served'
  | 'new_notice'
  | 'event_declared'
  | 'lostfound_action'
  | 'skill_help_request';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  recipientEmail: string;
  isRead: boolean;
  createdAt: number;
  refId?: string;
}

// --- Faculty Verification ---

export type VerificationStatus = 'Pending' | 'Approved' | 'Rejected';

export interface VerificationRequest {
  id: string;
  type: 'event' | 'coordinator' | 'notice' | 'org_detail' | 'flagged_content';
  targetId: string;
  targetName: string;
  requestedBy: string;
  requestedAt: number;
  facultyId?: string;
  status: VerificationStatus;
  comment?: string;
  reviewedAt?: number;
}
