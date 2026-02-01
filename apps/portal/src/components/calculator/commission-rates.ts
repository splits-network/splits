import { CommissionRates, Tier, RoleMeta } from './types';

// Commission rates by tier (percentage of placement fee going to recruiter for each role)
// From PROJECT.md commission structure
export const COMMISSION_RATES: Record<Tier, CommissionRates> = {
  free: {
    candidate_recruiter: 0.20,
    job_owner: 0.10,
    company_recruiter: 0.10,
    candidate_sourcer: 0.06,
    company_sourcer: 0.06,
  },
  paid: {
    candidate_recruiter: 0.30,
    job_owner: 0.15,
    company_recruiter: 0.15,
    candidate_sourcer: 0.08,
    company_sourcer: 0.08,
  },
  premium: {
    candidate_recruiter: 0.40,
    job_owner: 0.20,
    company_recruiter: 0.20,
    candidate_sourcer: 0.10,
    company_sourcer: 0.10,
  },
};

// Platform take percentages by tier
export const PLATFORM_TAKE: Record<Tier, number> = {
  free: 0.48,
  paid: 0.24,
  premium: 0.00,
};

// Tier display names and monthly prices
export const TIER_INFO: Record<Tier, { name: string; monthlyPrice: number }> = {
  free: { name: 'Starter', monthlyPrice: 0 },
  paid: { name: 'Pro', monthlyPrice: 99 },
  premium: { name: 'Partner', monthlyPrice: 249 },
};

// Role metadata for UI display
export const ROLE_META: RoleMeta[] = [
  {
    id: 'candidate_recruiter',
    label: 'Candidate Recruiter',
    description: 'Found and represents the candidate',
  },
  {
    id: 'job_owner',
    label: 'Job Owner',
    description: 'Owns the job requisition relationship',
  },
  {
    id: 'company_recruiter',
    label: 'Company Recruiter',
    description: 'Sourced and manages company relationship',
  },
  {
    id: 'candidate_sourcer',
    label: 'Candidate Sourcer',
    description: 'Initially sourced the candidate',
  },
  {
    id: 'company_sourcer',
    label: 'Company Sourcer',
    description: 'Initially sourced the company',
  },
];
