/**
 * Application Listing Model
 * Represents a candidate's application to a job role through a recruiter
 */

export type ApplicationStatus =
  | 'submitted'
  | 'screening'
  | 'interviewing'
  | 'offered'
  | 'placed'
  | 'rejected'
  | 'withdrawn';

export type ApplicationSource =
  | 'direct'
  | 'referral'
  | 'recruiter_submit'
  | 'marketplace';

export interface ApplicationListing {
  id: string;
  candidateName: string;
  candidateAvatar: string; // Unsplash URL
  candidateTitle: string; // Current job title
  jobTitle: string;
  company: string;
  location: string;
  recruiter: {
    name: string;
    avatar: string; // Unsplash URL
    agency: string;
  };
  status: ApplicationStatus;
  matchScore: number; // 0-100, AI match percentage
  appliedDate: string; // ISO date string
  lastActivityDate: string; // ISO date string
  source: ApplicationSource;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  notes: string;
  stage: string; // Current interview stage
  tags: string[]; // Skills that matched
  featured: boolean; // Hot candidate
}
