export interface BacklinkSite {
  id: string;
  name: string;
  url: string;
  description?: string;
  categories: string[];  // Changed to support multiple categories
  tags?: string[];
  submissionInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BacklinkSubmission {
  id: string;
  siteId: string;
  productId: string;
  submissionUrl: string;
  status: 'pending' | 'submitted' | 'approved' | 'rejected' | 'removed';
  submittedAt?: Date;      // Date when marked as submitted
  approvedAt?: Date;       // Date when approved/accepted
  rejectedAt?: Date;       // Date when rejected
  removedAt?: Date;        // Date when removed/deleted
  reviewedAt?: Date;       // Date when first reviewed (approved or rejected)
  lastStatusChange?: Date; // Date of last status change
  notes?: string;
  responseUrl?: string;
  reviewNotes?: string;    // Notes from the review process
  submissionMethod?: string; // How it was submitted (email, form, etc.)
  priority?: 'low' | 'medium' | 'high'; // Submission priority
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBacklinkSiteInput {
  name: string;
  url: string;
  description?: string;
  categories: string[];
  tags?: string[];
  submissionInstructions?: string;
}

export interface UpdateBacklinkSiteInput {
  name?: string;
  url?: string;
  description?: string;
  categories?: string[];
  tags?: string[];
  submissionInstructions?: string;
}

export interface CreateBacklinkSubmissionInput {
  siteId: string;
  productId: string;
  submissionUrl: string;
  notes?: string;
}

export interface UpdateBacklinkSubmissionInput {
  status?: 'pending' | 'submitted' | 'approved' | 'rejected' | 'removed';
  submissionUrl?: string;
  submittedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  removedAt?: Date;
  reviewedAt?: Date;
  lastStatusChange?: Date;
  notes?: string;
  responseUrl?: string;
  reviewNotes?: string;
  submissionMethod?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface BacklinkStats {
  totalSites: number;
  totalSubmissions: number;
  pendingSubmissions: number;
  approvedSubmissions: number;
  rejectedSubmissions: number;
  approvalRate: number;
}

export interface BacklinkAppState {
  sites: BacklinkSite[];
  submissions: BacklinkSubmission[];
  selectedSiteId: string | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

export type BacklinkAction =
  | { type: 'SET_SITES'; payload: BacklinkSite[] }
  | { type: 'ADD_SITE'; payload: BacklinkSite }
  | { type: 'UPDATE_SITE'; payload: { id: string; updates: UpdateBacklinkSiteInput } }
  | { type: 'DELETE_SITE'; payload: string }
  | { type: 'SET_SUBMISSIONS'; payload: BacklinkSubmission[] }
  | { type: 'ADD_SUBMISSION'; payload: BacklinkSubmission }
  | { type: 'UPDATE_SUBMISSION'; payload: { id: string; updates: UpdateBacklinkSubmissionInput } }
  | { type: 'DELETE_SUBMISSION'; payload: string }
  | { type: 'SET_SELECTED_SITE'; payload: string | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ALL_DATA' };