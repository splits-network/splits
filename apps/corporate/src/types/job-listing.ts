/**
 * Job Listing Model
 * Shared across all 10 lists page variants
 */

export type JobType = 'full-time' | 'part-time' | 'contract' | 'remote';
export type JobStatus = 'open' | 'filled' | 'pending' | 'closed';
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'executive';

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  type: JobType;
  status: JobStatus;
  postedDate: string; // ISO date string
  deadline: string; // ISO date string
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  recruiter: {
    name: string;
    avatar: string; // Unsplash URL
    agency: string;
  };
  applicants: number;
  views: number;
  featured: boolean;
  tags: string[]; // Skills/technologies
  department: string;
  experienceLevel: ExperienceLevel;
  equity?: string; // e.g., "0.1% - 0.5%"
}
