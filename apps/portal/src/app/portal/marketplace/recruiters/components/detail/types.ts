import { MarketplaceRecruiterDTO } from "@splits-network/shared-types";

/**
 * Extended type to include joined user data from Supabase
 *
 * MarketplaceRecruiterDTO already includes:
 * - tagline, industries, specialties (no prefix)
 * - marketplace_location, marketplace_years_experience (with prefix)
 *
 * This extension adds the Supabase JOIN result for user data
 */
export interface RecruiterWithUser extends MarketplaceRecruiterDTO {
    users?: {
        id: string;
        name: string;
        email: string;
        profile_image_url?: string;
    };
}

export interface RecruiterDetailProps {
    recruiter: RecruiterWithUser;
}
