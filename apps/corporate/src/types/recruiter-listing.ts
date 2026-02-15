/**
 * Recruiter Listing Model
 * Used in the recruiter marketplace showcase page
 */

export type RecruiterStatus = 'active' | 'verified' | 'pending' | 'suspended' | 'inactive';

export interface RecruiterListing {
  id: string;
  name: string;
  avatar: string; // Unsplash URL
  title: string; // e.g., "Senior Technical Recruiter"
  agency: string; // recruiting firm name
  email: string;
  phone: string;
  location: string;
  status: RecruiterStatus;
  specializations: string[]; // e.g., "Engineering", "Product", "Sales"
  industries: string[]; // e.g., "SaaS", "Fintech", "Healthcare"
  rating: number; // 1-5, with decimals
  totalPlacements: number;
  activeCandidates: number;
  activeRoles: number;
  splitFeeRate: number; // percentage, e.g., 50 for 50/50 split
  revenue: {
    total: number;
    ytd: number;
    currency: string;
  };
  joinedDate: string; // ISO date string
  lastActiveDate: string; // ISO date string
  featured: boolean; // top recruiter
  verified: boolean;
  bio: string; // short professional bio
  recentPlacements: {
    candidateName: string;
    roleName: string;
    company: string;
    date: string; // ISO date string
  }[];
  responseTime: string; // e.g., "< 2 hours", "< 24 hours"
}
