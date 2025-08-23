// Keyword root management types for ProductBaker

export interface KeywordRoot {
  id: string;
  name: string;
  keywords: string[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KeywordRootState {
  keywordRoots: KeywordRoot[];
  selectedKeywordRootId?: string;
  isLoading: boolean;
  error?: string;
}

export interface KeywordRootFormData {
  name: string;
  keywords: string[];
  description?: string;
}

// Google Trends related types
export interface GoogleTrendsUrlConfig {
  keywords: string[];
  geo?: string; // Geographic location (e.g., 'US', 'CN')
  timeframe?: string; // Time range (e.g., 'now 7-d', 'today 12-m')
  category?: string; // Category ID
}