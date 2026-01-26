/**
 * User & Candidate Registration Utility
 * Ensures users and candidates exist in the database for SSO sign-ups
 * 
 * This module provides idempotent user/candidate creation that handles:
 * - First-time SSO sign-ups
 * - Race conditions with Clerk webhooks
 * - Duplicate key errors gracefully
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
    
    // Onboarding (newly added)
    onboarding_status?: string;
    onboarding_step?: number;
    
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
 * This function is idempotent - safe to call multiple times.
 * It will:
 * 1. Check/create user via /users/me and /users/register
 * 2. Check/create candidate via /candidates/me and POST /candidates
 * 3. Handle duplicate key errors gracefully (race condition with webhook)
 * 
 * @param token - Clerk JWT token for authentication
 * @param data - User registration data from Clerk
 * @returns UserAndCandidateRegistrationResult with success status and data
 */
export async function ensureUserAndCandidateInDatabase(
    token: string,
    data: UserRegistrationData
): Promise<UserAndCandidateRegistrationResult> {
    const client = createAuthenticatedClient(token);
    
    let user: UserData | null = null;
    let candidate: CandidateData | null = null;
    let userWasExisting = false;
    let candidateWasExisting = false;

    try {
        // ========== STEP 1: Ensure User Exists ==========
        
        // Try /users/me first
        try {
            const existingResponse = await client.get<{ data: UserData }>('/users/me');
            if (existingResponse?.data) {
                console.log('[UserRegistration] User already exists:', existingResponse.data.id);
                user = existingResponse.data;
                userWasExisting = true;
            }
        } catch (checkError: any) {
            const status = checkError?.response?.status || checkError?.status;
            if (status !== 404 && status !== 500) {
                console.warn('[UserRegistration] Error checking existing user:', checkError);
            }
        }

        // If no user found, create via /users/register
        if (!user) {
            console.log('[UserRegistration] Creating new user for:', data.email);
            
            try {
                const createResponse = await client.post<{ data: UserData }>('/users/register', {
                    clerk_user_id: data.clerk_user_id,
                    email: data.email,
                    name: data.name || '',
                    image_url: data.image_url,
                });

                if (createResponse?.data) {
                    console.log('[UserRegistration] User created successfully:', createResponse.data.id);
                    user = createResponse.data;
                    userWasExisting = false;
                }
            } catch (createError: any) {
                // Handle duplicate key error (race condition with webhook)
                const errorMessage = createError?.message || createError?.response?.data?.error?.message || '';
                const isDuplicateKey = 
                    errorMessage.toLowerCase().includes('already registered') ||
                    errorMessage.toLowerCase().includes('duplicate') ||
                    errorMessage.toLowerCase().includes('already exists') ||
                    createError?.response?.status === 409;

                if (isDuplicateKey) {
                    console.log('[UserRegistration] User created by webhook, fetching existing...');
                    
                    try {
                        const retryResponse = await client.get<{ data: UserData }>('/users/me');
                        if (retryResponse?.data) {
                            user = retryResponse.data;
                            userWasExisting = true;
                        }
                    } catch (retryError) {
                        console.error('[UserRegistration] Failed to fetch user after duplicate error:', retryError);
                    }
                } else {
                    throw createError;
                }
            }
        }

        if (!user) {
            throw new Error('Failed to create or find user account');
        }

        // ========== STEP 2: Ensure Candidate Exists ==========
        
        // Try /candidates/me first
        try {
            const existingCandidateResponse = await client.get<{ data: CandidateData }>('/candidates/me');
            if (existingCandidateResponse?.data) {
                console.log('[UserRegistration] Candidate already exists:', existingCandidateResponse.data.id);
                candidate = existingCandidateResponse.data;
                candidateWasExisting = true;
            }
        } catch (checkError: any) {
            const status = checkError?.response?.status || checkError?.status;
            if (status !== 404 && status !== 500) {
                console.warn('[UserRegistration] Error checking existing candidate:', checkError);
            }
        }

        // If no candidate found, create via POST /candidates
        if (!candidate) {
            console.log('[UserRegistration] Creating new candidate for user:', user.id);
            
            try {
                const createCandidateResponse = await client.post<{ data: CandidateData }>('/candidates', {
                    user_id: user.id,
                    full_name: data.name || data.email.split('@')[0],  // API expects full_name, not name
                    email: data.email,
                    onboarding_status: 'pending',
                });

                if (createCandidateResponse?.data) {
                    console.log('[UserRegistration] Candidate created successfully:', createCandidateResponse.data.id);
                    candidate = createCandidateResponse.data;
                    candidateWasExisting = false;
                }
            } catch (createError: any) {
                // Handle duplicate key error
                const errorMessage = createError?.message || createError?.response?.data?.error?.message || '';
                const isDuplicateKey = 
                    errorMessage.toLowerCase().includes('duplicate') ||
                    errorMessage.toLowerCase().includes('already exists') ||
                    errorMessage.toLowerCase().includes('unique constraint') ||
                    createError?.response?.status === 409;

                if (isDuplicateKey) {
                    console.log('[UserRegistration] Candidate created by webhook, fetching existing...');
                    
                    try {
                        const retryResponse = await client.get<{ data: CandidateData }>('/candidates/me');
                        if (retryResponse?.data) {
                            candidate = retryResponse.data;
                            candidateWasExisting = true;
                        }
                    } catch (retryError) {
                        console.error('[UserRegistration] Failed to fetch candidate after duplicate error:', retryError);
                    }
                } else {
                    // Log but don't fail - candidate creation might be handled elsewhere
                    console.error('[UserRegistration] Failed to create candidate:', createError);
                }
            }
        }

        return {
            success: true,
            user,
            candidate,
            userWasExisting,
            candidateWasExisting,
        };

    } catch (error: any) {
        console.error('[UserRegistration] Failed to ensure user and candidate:', error);
        return {
            success: false,
            user,
            candidate,
            error: error?.message || 'Failed to create user account',
            userWasExisting,
            candidateWasExisting,
        };
    }
}

/**
 * Check if a user exists in the database without creating them.
 * 
 * @param token - Clerk JWT token for authentication
 * @returns User data if exists, null otherwise
 */
export async function checkUserExists(
    token: string
): Promise<UserData | null> {
    const client = createAuthenticatedClient(token);

    try {
        const response = await client.get<{ data: UserData }>('/users/me');
        return response?.data || null;
    } catch {
        return null;
    }
}

/**
 * Check if a candidate exists in the database without creating them.
 * 
 * @param token - Clerk JWT token for authentication
 * @returns Candidate data if exists, null otherwise
 */
export async function checkCandidateExists(
    token: string
): Promise<CandidateData | null> {
    const client = createAuthenticatedClient(token);

    try {
        const response = await client.get<{ data: CandidateData }>('/candidates/me');
        return response?.data || null;
    } catch {
        return null;
    }
}
