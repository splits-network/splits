/**
 * Recruiter Team Listing Model
 * Shared across recruiter teams showcase pages
 */

export type TeamStatus = 'active' | 'growing' | 'full' | 'restructuring' | 'inactive';

export interface TeamMember {
  name: string;
  avatar: string; // Unsplash URL
  role: string;
  joinedDate: string; // ISO date string
}

export interface RecruiterTeamListing {
  id: string;
  name: string;
  agency: string;
  lead: {
    name: string;
    avatar: string; // Unsplash URL
    title: string;
  };
  members: TeamMember[];
  status: TeamStatus;
  specializations: string[];
  totalPlacements: number;
  activeCandidates: number;
  activeRoles: number;
  revenue: {
    total: number;
    ytd: number;
    currency: string;
  };
  avgRating: number; // 1-5
  createdDate: string; // ISO date string
  lastActiveDate: string; // ISO date string
  description: string;
  maxMembers: number;
  featured: boolean;
  tags: string[];
}
