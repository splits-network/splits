/**
 * Company Listing Model
 * Used by the company showcase page variant
 */

export type CompanySize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
export type CompanyStatus = 'active' | 'trial' | 'churned' | 'suspended' | 'pending_setup';
export type CompanyPlan = 'free' | 'starter' | 'professional' | 'enterprise';

export interface CompanyListing {
  id: string;
  name: string;
  logo: string; // Unsplash URL or placeholder
  industry: string;
  location: string; // HQ
  website: string;
  size: CompanySize;
  status: CompanyStatus;
  plan: CompanyPlan;
  openRolesCount: number;
  totalPlacements: number;
  totalSpend: {
    value: number;
    currency: string;
  };
  primaryContact: {
    name: string;
    title: string;
    email: string;
    avatar: string; // Unsplash URL
  };
  recruiters: number; // assigned recruiter count
  joinedDate: string; // ISO date string
  lastActiveDate: string; // ISO date string
  description: string;
  departments: string[];
  featured: boolean; // key account
  avgTimeToFill?: number; // days
  avgFeePercentage?: number;
  tags: string[]; // industry tags
}
