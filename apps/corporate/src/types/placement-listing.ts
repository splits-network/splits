/**
 * Placement Listing Model
 * Tracks successfully filled roles with placed candidates
 */

export type PlacementStatus = 'active' | 'completed' | 'guarantee_period' | 'cancelled' | 'pending_start';
export type InvoiceStatus = 'pending' | 'sent' | 'paid' | 'overdue';

export interface PlacementListing {
  id: string;
  candidate: {
    name: string;
    avatar: string; // Unsplash URL
    title: string;
  };
  jobTitle: string;
  company: string;
  companyLogo?: string;
  location: string;
  recruiter: {
    name: string;
    avatar: string; // Unsplash URL
    agency: string;
  };
  splitPartner?: {
    name: string;
    avatar: string; // Unsplash URL
    agency: string;
  };
  status: PlacementStatus;
  salary: {
    amount: number;
    currency: string;
  };
  fee: {
    percentage: number;
    amount: number;
    currency: string;
  };
  splitPercentage?: number; // e.g., 50 for 50/50
  startDate: string; // ISO date string
  guaranteePeriod: number; // days, e.g., 90
  guaranteeExpiry: string; // ISO date string
  placementDate: string; // ISO date string
  invoiceStatus: InvoiceStatus;
  featured: boolean;
  notes: string;
  tags: string[]; // Skills/technologies
}
