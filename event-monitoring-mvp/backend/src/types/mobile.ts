import { Request } from 'express';

// Company info attached to request after API key validation
export interface MobileAuthenticatedRequest extends Request {
  company?: {
    id: string;
    name: string;
    settings?: Record<string, any>;
  };
  frUser?: {
    frId: string;
    phone: string;
    name: string;
    role: string;
  };
}

// API 1: Company Validate
export interface CompanyValidateResponse {
  valid: boolean;
  company?: {
    id: string;
    name: string;
    settings?: Record<string, any>;
  };
}

// API 2: Verify FR
export interface VerifyFRRequest {
  phone: string;
}

export interface VerifyFRResponse {
  isFR: boolean;
  frId?: string;
  name?: string;
  role?: string;
}

// API 3: Event Types
export interface EventType {
  id: string;
  name: string;
  severity: string;
}

export interface EventTypesResponse {
  eventTypes: EventType[];
}

// API 4: Create Report
export interface CreateReportRequest {
  phone: string;
  type: string;
  subType?: string;
  severity: string;
  description?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  media?: {
    images?: string[];
    videos?: string[];
  };
}

export interface CreateReportResponse {
  success: boolean;
  reportId?: string;
  reporterType?: 'FR' | 'CIVILIAN';
  message?: string;
}

// API 5: Get My Reports
export interface GetReportsQuery {
  date?: string;
  status?: string;
  type?: string;
  severity?: string;
  limit?: number;
  offset?: number;
}

export interface ReportSummary {
  id: string;
  type: string;
  subType?: string;
  severity: string;
  status: string;
  description?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
}

export interface GetReportsResponse {
  reports: ReportSummary[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// API 6: Get Report by ID
export interface ReportDetail extends ReportSummary {
  media?: {
    images?: string[];
    videos?: string[];
  };
  reporterType: 'FR' | 'CIVILIAN';
  updatedAt: string;
}

export interface ReportDetailResponse {
  report: ReportDetail;
}
