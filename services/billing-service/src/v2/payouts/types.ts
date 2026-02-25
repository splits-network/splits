/**
 * Payout Domain Types
 */

/**
 * PayoutRole - Represents which commission role earned this payout
 * Part of the 5-role commission structure
 */
export type PayoutRole =
    | 'candidate_recruiter'  // Closer - represents the candidate
    | 'company_recruiter'    // Client/Hiring Facilitator - represents the company
    | 'job_owner'            // Specs Owner - created the job posting
    | 'candidate_sourcer'    // Discovery - first brought candidate to platform
    | 'company_sourcer';     // BD - first brought company to platform

/**
 * PlacementSplit - Attribution layer (who gets paid what role)
 * Created from placement_snapshot at hire time
 */
export interface PlacementSplit {
    id: string;
    placement_id: string;
    recruiter_id: string;
    role: PayoutRole;                // Explicit role from snapshot
    split_percentage: number;
    split_amount: number;
    team_id?: string | null;
    split_configuration_id?: string | null;
    notes?: string | null;
    created_at: string;
}

export interface PlacementSplitInsert {
    placement_id: string;
    recruiter_id: string;
    role: PayoutRole;
    split_percentage: number;
    split_amount: number;
    team_id?: string;
    split_configuration_id?: string;
    notes?: string;
}

/**
 * PlacementPayoutTransaction - Execution layer (Stripe transfer tracking)
 * One transaction per placement split
 */
export type TransactionStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'reversed' | 'on_hold';

export interface PlacementPayoutTransaction {
    id: string;
    placement_split_id: string;
    placement_id: string;
    recruiter_id: string;
    amount: number;
    status: TransactionStatus;
    stripe_transfer_id?: string | null;
    stripe_payout_id?: string | null;
    stripe_connect_account_id?: string | null;
    created_at: string;
    updated_at: string;
    processing_started_at?: string | null;
    completed_at?: string | null;
    failed_at?: string | null;
    failure_reason?: string | null;
    retry_count: number;
}

export interface PlacementPayoutTransactionInsert {
    placement_split_id: string;
    placement_id: string;
    recruiter_id: string;
    amount: number;
    status?: TransactionStatus;
    stripe_connect_account_id?: string;
}

export interface PlacementPayoutTransactionUpdate {
    status?: TransactionStatus;
    stripe_transfer_id?: string;
    stripe_payout_id?: string;
    stripe_connect_account_id?: string | null;
    processing_started_at?: string;
    completed_at?: string;
    failed_at?: string;
    failure_reason?: string;
    retry_count?: number;
}
