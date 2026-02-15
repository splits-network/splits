/**
 * Candidate Listing Model
 * Shared across candidate showcase page variants
 */

export type CandidateStatus = 'available' | 'interviewing' | 'placed' | 'passive' | 'unavailable';
export type CandidateAvailability = 'immediate' | '2_weeks' | '1_month' | '3_months' | 'not_looking';
export type CandidateExperienceLevel = 'entry' | 'mid' | 'senior' | 'executive';
export type CandidateWorkType = 'remote' | 'hybrid' | 'onsite' | 'flexible';

export interface CandidateListing {
  id: string;
  name: string;
  avatar: string; // Unsplash URL
  title: string; // Current/desired job title
  email: string;
  phone: string;
  location: string;
  status: CandidateStatus;
  availability: CandidateAvailability;
  experienceLevel: CandidateExperienceLevel;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  skills: string[]; // Technical skills
  industries: string[]; // Preferred industries
  recruiter: {
    name: string;
    avatar: string; // Unsplash URL
    agency: string;
  };
  applicationsCount: number;
  placementsCount: number;
  lastActiveDate: string; // ISO date string
  createdDate: string; // ISO date string
  resumeUrl?: string;
  featured: boolean; // Top candidate
  openToRelocation: boolean;
  preferredWorkType: CandidateWorkType;
  summary: string; // Brief professional summary
}
