/**
 * Company Team Listing Model
 * Internal hiring teams within companies that manage recruitment for their departments
 */

export type TeamStatus = 'active' | 'hiring' | 'paused' | 'full' | 'archived';

export interface TeamMember {
  name: string;
  avatar: string; // Unsplash URL
  role: string;
  department: string;
}

export interface CompanyTeamListing {
  id: string;
  name: string;
  company: {
    name: string;
    industry: string;
    location: string;
    logo?: string;
  };
  admin: {
    name: string;
    avatar: string; // Unsplash URL
    title: string;
  };
  members: TeamMember[];
  status: TeamStatus;
  department: string;
  openRoles: number;
  totalHires: number;
  avgTimeToFill: number; // days
  budget: {
    allocated: number;
    spent: number;
    currency: string;
  };
  createdDate: string; // ISO date string
  lastActiveDate: string; // ISO date string
  description: string;
  hiringGoal?: number; // target hires for period
  featured: boolean;
  tags: string[];
  recruitersAssigned: number; // external recruiters working with this team
}
