export type RecruiterRole =
  | 'candidate_recruiter'
  | 'job_owner'
  | 'company_recruiter'
  | 'candidate_sourcer'
  | 'company_sourcer';

export type Tier = 'free' | 'paid' | 'premium';

export interface CommissionRates {
  candidate_recruiter: number;
  job_owner: number;
  company_recruiter: number;
  candidate_sourcer: number;
  company_sourcer: number;
}

export interface TierPayout {
  tier: Tier;
  tierName: string;
  monthlyPrice: number;
  payout: number;
  platformTake: number;
}

export interface CalculatorState {
  // Salary + fee percentage inputs
  salary: number;
  feePercentage: number;
  // Selected roles
  selectedRoles: RecruiterRole[];
}

export interface RoleMeta {
  id: RecruiterRole;
  label: string;
  description: string;
}
