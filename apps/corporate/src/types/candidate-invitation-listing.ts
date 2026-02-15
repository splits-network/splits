/**
 * Candidate Invitation Model
 * Used for the candidate invitations showcase page
 */

export type InvitationType = 'platform_join' | 'role_application' | 'connect' | 'exclusive_opportunity';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'revoked';
export type InvitationChannel = 'email' | 'sms' | 'in_app' | 'linkedin';

export interface CandidateInvitationListing {
  id: string;
  candidate: {
    name: string;
    email: string;
    avatar: string; // Unsplash URL
    title?: string;
  };
  recruiter: {
    name: string;
    avatar: string; // Unsplash URL
    agency: string;
  };
  type: InvitationType;
  status: InvitationStatus;
  role?: {
    title: string;
    company: string;
    location: string;
  };
  message: string;
  sentDate: string; // ISO date string
  respondedDate?: string; // ISO date string
  expiryDate: string; // ISO date string
  channel: InvitationChannel;
  featured: boolean;
  followUpCount: number;
  tags: string[]; // Skills/interests
  responseTime?: number; // Hours to respond, if responded
}
