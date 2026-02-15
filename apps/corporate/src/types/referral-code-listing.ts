/**
 * Referral Code Listing Model
 * Used by the referral codes showcase page
 */

export type ReferralCodeType = 'recruiter' | 'company' | 'candidate' | 'partner';
export type ReferralCodeStatus = 'active' | 'expired' | 'paused' | 'maxed_out' | 'revoked';

export interface ReferralCodeListing {
  id: string;
  code: string;
  type: ReferralCodeType;
  status: ReferralCodeStatus;
  creator: {
    name: string;
    avatar: string; // Unsplash URL
    role: string;
  };
  totalUses: number;
  maxUses: number | null; // null = unlimited
  successfulReferrals: number;
  revenue: {
    earned: number;
    pending: number;
    currency: string;
  };
  reward: {
    type: 'percentage' | 'flat' | 'credit';
    value: number;
    description: string;
  };
  createdDate: string; // ISO date string
  expiryDate?: string; // ISO date string
  lastUsedDate?: string; // ISO date string
  campaign?: string;
  tags: string[];
  featured: boolean;
  conversionRate: number; // percentage 0-100
  recentSignups: {
    name: string;
    date: string; // ISO date string
    type: string;
  }[];
}
