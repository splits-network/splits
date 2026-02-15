/**
 * Company Invitation Model
 * Represents invitations sent by recruiters to companies to join the split-fee marketplace
 */

export type InvitationType = 'platform_join' | 'partnership' | 'exclusive_contract' | 'trial_offer';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'negotiating';
export type InvitationChannel = 'email' | 'phone' | 'in_person' | 'linkedin';

export interface CompanyInvitationListing {
  id: string;
  company: {
    name: string;
    industry: string;
    location: string;
    contactName: string;
    contactEmail: string;
    contactTitle: string;
    avatar: string; // Unsplash URL
  };
  recruiter: {
    name: string;
    avatar: string; // Unsplash URL
    agency: string;
  };
  type: InvitationType;
  status: InvitationStatus;
  message: string; // Personalized pitch
  proposal?: {
    feePercentage: number;
    guaranteeDays: number;
    exclusivity: boolean;
  };
  sentDate: string; // ISO date string
  respondedDate?: string; // ISO date string
  expiryDate: string; // ISO date string
  channel: InvitationChannel;
  featured: boolean; // High-value target
  followUpCount: number;
  estimatedRevenue?: number; // Projected annual value
  tags: string[]; // Industry tags
  responseTime?: number; // Hours
}
