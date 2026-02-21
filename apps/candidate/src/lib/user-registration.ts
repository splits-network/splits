/**
 * User & Candidate Registration Utility
 *
 * Thin wrapper around POST /onboarding/init — the backend handles
 * idempotent user+candidate creation, duplicate detection, and claiming.
 *
 * Type exports are kept for consumers that need UserData / CandidateData shapes.
 */

import { createAuthenticatedClient } from '@/lib/api-client';

/**
 * Data required to register a new user
 */
export interface UserRegistrationData {
    clerk_user_id: string;
    email: string;
    name?: string;
    image_url?: string;
}

/**
 * User data from the API
 */
export interface UserData {
    id: string;
    clerk_user_id: string;
    email: string;
    name: string | null;
    onboarding_status: string;
    onboarding_step: number;
    roles?: string[];
    is_platform_admin?: boolean;
    recruiter_id?: string | null;
    candidate_id?: string | null;
    organization_ids?: string[];
}

/**
 * Candidate data from the API
 * Matches the candidates table schema in the database
 */
export interface CandidateData {
    id: string;
    user_id: string | null;
    email: string | null;
    full_name: string | null;

    // Contact & Location
    phone?: string | null;
    location?: string | null;

    // Professional Info
    current_title?: string | null;
    current_company?: string | null;
    bio?: string | null;
    skills?: string | null;  // Text field in DB

    // Social/Portfolio Links
    linkedin_url?: string | null;
    github_url?: string | null;
    portfolio_url?: string | null;

    // Job Preferences
    desired_job_type?: string | null;  // Text field in DB
    desired_salary_min?: number | null;
    desired_salary_max?: number | null;
    open_to_remote?: boolean;
    open_to_relocation?: boolean;
    availability?: string | null;

    // Marketplace Settings
    marketplace_visibility?: string;
    show_email?: boolean;
    show_phone?: boolean;
    show_location?: boolean;
    show_current_company?: boolean;
    show_salary_expectations?: boolean;
    marketplace_profile?: Record<string, any>;

    // Verification
    verification_status?: string;
    verification_metadata?: Record<string, any>;
    verified_at?: string | null;
    verified_by_user_id?: string | null;

    // Relationships
    recruiter_id?: string | null;
    created_by_user_id?: string | null;

    // Timestamps
    created_at: string;
    updated_at: string;
}

/**
 * Result of the user and candidate registration attempt
 */
export interface UserAndCandidateRegistrationResult {
    success: boolean;
    user: UserData | null;
    candidate: CandidateData | null;
    error?: string;
    userWasExisting: boolean;
    candidateWasExisting: boolean;
}

/**
 * Ensures both user and candidate records exist in the database.
 *
 * Delegates to POST /onboarding/init which handles all orchestration:
 * - Idempotent user creation (GET first, POST if 404, handle 409 duplicate)
 * - Idempotent candidate creation with recruiter-candidate claiming
 * - Race condition handling with Clerk webhooks
 *
 * @deprecated Prefer calling POST /onboarding/init directly via createAuthenticatedClient.
 */
export async function ensureUserAndCandidateInDatabase(
    token: string,
    data: UserRegistrationData
): Promise<UserAndCandidateRegistrationResult> {
    const client = createAuthenticatedClient(token);

    try {
        const response = await client.post<{
            data: { user: UserData; candidate: CandidateData | null };
        }>('/onboarding/init', {
            email: data.email,
            name: data.name || '',
            image_url: data.image_url,
            source_app: 'candidate',
        });

        const user = response?.data?.user ?? null;
        const candidate = response?.data?.candidate ?? null;

        return {
            success: true,
            user,
            candidate,
            userWasExisting: true, // Backend is idempotent, we don't know
            candidateWasExisting: true,
        };
    } catch (error: any) {
        console.error('[UserRegistration] POST /onboarding/init failed:', error);
        return {
            success: false,
            user: null,
            candidate: null,
            error: error?.message || 'Failed to create user account',
            userWasExisting: false,
            candidateWasExisting: false,
        };
    }
}
