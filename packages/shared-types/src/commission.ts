/**
 * Commission Structure Types
 * 
 * Defines the five-role commission model for recruiter marketplace placements.
 * 
 * Five Commission Roles:
 * 1. Candidate Recruiter ("Closer") - Represents the candidate
 * 2. Job Owner ("Specs Owner") - Created the job posting (recruiter only)
 * 3. Company Recruiter ("Client/Hiring Facilitator") - Represents the company
 * 4. Company Sourcer ("BD") - First brought company to platform
 * 5. Candidate Sourcer ("Discovery") - First brought candidate to platform
 * 
 * All roles are nullable. When a role is NULL, that percentage goes to platform as remainder.
 */

export type SubscriptionTier = 'premium' | 'paid' | 'free';

/**
 * Commission rates by subscription tier
 * All values are percentages (0-100)
 */
export interface CommissionRatesByTier {
    candidate_recruiter: number;  // Closer
    job_owner: number;            // Specs Owner
    company_recruiter: number;    // Client/Hiring Facilitator
    candidate_sourcer: number;    // Discovery (base 6% + tier bonus)
    company_sourcer: number;      // BD (base 6% + tier bonus)
    platform_remainder: number;   // Platform's share
}

/**
 * Commission rates for all three subscription tiers
 * 
 * Premium Plan ($249/month):
 * - Candidate Recruiter: 40%
 * - Job Owner: 20%
 * - Company Recruiter: 20%
 * - Company Sourcer: 6% + 4% bonus = 10%
 * - Candidate Sourcer: 6% + 4% bonus = 10%
 * - Platform Remainder: 0%
 * 
 * Paid Plan ($99/month):
 * - Candidate Recruiter: 30%
 * - Job Owner: 15%
 * - Company Recruiter: 15%
 * - Company Sourcer: 6% + 2% bonus = 8%
 * - Candidate Sourcer: 6% + 2% bonus = 8%
 * - Platform Remainder: 24%
 * 
 * Free Plan ($0/month):
 * - Candidate Recruiter: 20%
 * - Job Owner: 10%
 * - Company Recruiter: 10%
 * - Company Sourcer: 6%
 * - Candidate Sourcer: 6%
 * - Platform Remainder: 48%
 */
export const COMMISSION_RATES: Record<SubscriptionTier, CommissionRatesByTier> = {
    premium: {
        candidate_recruiter: 40,
        job_owner: 20,
        company_recruiter: 20,
        candidate_sourcer: 10,  // 6% base + 4% bonus
        company_sourcer: 10,    // 6% base + 4% bonus
        platform_remainder: 0,
    },
    paid: {
        candidate_recruiter: 30,
        job_owner: 15,
        company_recruiter: 15,
        candidate_sourcer: 8,   // 6% base + 2% bonus
        company_sourcer: 8,     // 6% base + 2% bonus
        platform_remainder: 24,
    },
    free: {
        candidate_recruiter: 20,
        job_owner: 10,
        company_recruiter: 10,
        candidate_sourcer: 6,   // 6% base only
        company_sourcer: 6,     // 6% base only
        platform_remainder: 48,
    },
};

/**
 * Breakdown of commission amounts for a placement
 * All amounts are in dollars
 */
export interface CommissionBreakdown {
    total_placement_fee: number;
    subscription_tier: SubscriptionTier;

    // Role-specific commissions (null if role not filled)
    candidate_recruiter_amount: number | null;
    job_owner_amount: number | null;
    company_recruiter_amount: number | null;
    candidate_sourcer_amount: number | null;
    company_sourcer_amount: number | null;

    // Platform's share (from NULL roles + base remainder)
    platform_amount: number;

    // Verification (should always equal total_placement_fee)
    total_distributed: number;
}

/**
 * Input for calculating commission breakdown
 */
export interface CommissionCalculationInput {
    total_placement_fee: number;
    subscription_tier: SubscriptionTier;

    // Role assignments (null if role not filled)
    candidate_recruiter_id: string | null;
    company_recruiter_id: string | null;
    job_owner_recruiter_id: string | null;
    candidate_sourcer_recruiter_id: string | null;
    company_sourcer_recruiter_id: string | null;
}

/**
 * Sourcer-specific rules
 */
export interface SourcerAttribution {
    /**
     * Sourcer commission is permanent while recruiter maintains active account
     */
    is_permanent: boolean;

    /**
     * If sourcer account becomes inactive, fee is NOT paid out (platform consumes remainder)
     */
    account_status: 'active' | 'inactive';

    /**
     * First recruiter wins - no changes allowed
     */
    first_recruiter_wins: boolean;

    /**
     * No time-based expiration - tied to account status only
     */
    no_expiration: boolean;
}

/**
 * Job owner-specific rules
 */
export interface JobOwnerRules {
    /**
     * Job owner must be a recruiter (not company employee)
     */
    recruiter_only: boolean;

    /**
     * Company employees (hiring_manager, company_admin) do NOT receive job owner commission
     */
    no_company_employee_payout: boolean;

    /**
     * Only recruiters who post jobs on behalf of companies get this payout
     */
    external_recruiter_only: boolean;
}
