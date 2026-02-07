import { MarketplaceRecruiterDTO } from "@splits-network/shared-types";

/**
 * Extended recruiter type with joined user data from Supabase
 */
export interface RecruiterWithUser extends MarketplaceRecruiterDTO {
    users?: {
        id: string;
        name: string;
        email: string;
        profile_image_url?: string;
    };
}

/**
 * Filter interface for recruiter marketplace list
 */
export interface MarketplaceFilters {
    status?: string;
    marketplace_enabled?: boolean;
}

/**
 * Props for components that display recruiter details
 */
export interface RecruiterDetailProps {
    recruiter: RecruiterWithUser;
}

/**
 * Company type for invite functionality
 */
export interface Company {
    id: string;
    name: string;
    identity_organization_id?: string;
}

/**
 * Resolve display name from recruiter with user join data
 */
export function getDisplayName(recruiter: RecruiterWithUser): string {
    return (
        recruiter.users?.name ||
        recruiter.name ||
        recruiter.users?.email ||
        "Unknown Recruiter"
    );
}
