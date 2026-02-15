
export type Role = 'student' | 'admin' | 'staff';
export type AccountStatus = 'Active' | 'Disabled';

// --- Database Master Tables ---

export interface StudentMaster {
  id: string; // Primary Key
  email: string;
  enrollment: string;
  fullName: string;
  department: string;
  role: Role;
  status: AccountStatus;
  createdAt: number;
}

export interface User extends StudentMaster {
  preferredName?: string;
  profilePhoto?: string;
  lastLogin: number;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
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
  createdBy: string; // Admin or Staff ID
}

export interface CanteenConfig {
  isOrderingOpen: Record<MealType, boolean>;
  menu: MenuItem[];
}

export interface Order {
  id: string; 
  studentId: string; // Foreign Key
  studentEmail: string;
  studentName: string;
  items: { name: string; quantity: number }[];
  total: number;
  status: OrderStatus;
  timestamp: number;
  servedTimestamp?: number;
  cancelReason?: string;
  type: MealType;
  feedbackSubmitted: boolean;
}

export interface Feedback {
  orderId: string;
  taste: number;
  quantity: number;
  hygiene: number;
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
  reporterId: string; // FK
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
  posterId: string; // FK
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
  examType?: ExamType; // Only for Papers
  subject: string;
  branch: string;
  pdfUrl: string;
  uploaderId: string;
  uploaderEmail: string;
  uploaderName: string; // Displayed contributor name
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
