// Import shared types and extend for local use
import type { 
    Candidate as BaseCandidate, 
    MarketplaceProfile,
    RecruiterCandidateWithCandidate 
} from '@splits-network/shared-types';

// Export shared types (no change for importing components)
export type { MarketplaceProfile };

// Enriched candidate type with computed fields for UI
// Note: API returns date strings, not Date objects
export interface Candidate extends Omit<BaseCandidate, 'created_at' | 'updated_at' | 'marketplace_profile'> {
    // Override date fields to match API response format
    created_at: string;
    updated_at?: string;
    
    // Override marketplace_profile to be properly typed (not generic JSON)
    marketplace_profile?: MarketplaceProfile;
    
    // Legacy fields that may exist in API but not in shared types
    description?: string;

    // Identity linkage (for chat)
    user_id: string | null;
    company_id?: string | null;
    
    // Computed relationship status fields
    is_new?: boolean;
    has_active_relationship?: boolean;
    has_pending_invitation?: boolean;
    has_other_active_recruiters?: boolean;
    other_active_recruiters_count?: number;
    is_sourcer?: boolean;
}

// Export RecruiterCandidate with proper naming
export type RecruiterCandidate = RecruiterCandidateWithCandidate;

// Local filter interface that extends shared pagination patterns
export interface CandidateFilters {
    scope?: "mine" | "all";
    open_to_remote?: boolean;
    desired_job_type?: string;
    verification_status?: string;
}
