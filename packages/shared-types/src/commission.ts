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
 *
 * NOTE: Commission rates are now database-driven via the splits_rates table.
 * These types are kept for compatibility with code that needs the shape.
 * The platform remainder is NOT stored — it is computed dynamically as:
 *   100 - sum(filled role rates) per placement.
 */
export interface CommissionRatesByTier {
    candidate_recruiter: number;  // Closer
    job_owner: number;            // Specs Owner
    company_recruiter: number;    // Client/Hiring Facilitator
    candidate_sourcer: number;    // Discovery (base 6% + tier bonus)
    company_sourcer: number;      // BD (base 6% + tier bonus)
}

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
