/**
 * Onboarding Actions
 * Pure/async functions extracted from onboarding-provider.tsx for testability.
 *
 * These handle the API call contracts for completing/skipping onboarding
 * and the business logic for determining modal visibility and building payloads.
 */

import type { ApiClient } from '@/lib/api-client';
import type { CandidateProfileData } from '@/app/onboarding/types';

/**
 * Determines if the onboarding modal should be shown based on the user's onboarding status.
 * Reads from the USER record, not the candidate record.
 */
export function shouldShowOnboardingModal(onboardingStatus: string | undefined): boolean {
    return (onboardingStatus || 'pending') === 'pending';
}

/**
 * Builds the candidate PATCH payload from profile data,
 * including only non-empty values.
 */
export function buildCandidatePayload(profileData: CandidateProfileData): Record<string, any> {
    const payload: Record<string, any> = {};

    // String fields: include only if truthy (non-empty)
    if (profileData.full_name) payload.full_name = profileData.full_name;
    if (profileData.phone) payload.phone = profileData.phone;
    if (profileData.location) payload.location = profileData.location;
    if (profileData.current_title) payload.current_title = profileData.current_title;
    if (profileData.current_company) payload.current_company = profileData.current_company;
    if (profileData.bio) payload.bio = profileData.bio;
    if (profileData.linkedin_url) payload.linkedin_url = profileData.linkedin_url;
    if (profileData.github_url) payload.github_url = profileData.github_url;
    if (profileData.portfolio_url) payload.portfolio_url = profileData.portfolio_url;
    if (profileData.desired_job_type) payload.desired_job_type = profileData.desired_job_type;
    if (profileData.availability) payload.availability = profileData.availability;

    // Boolean/numeric fields: include if defined (even if false/0)
    if (profileData.open_to_remote !== undefined) payload.open_to_remote = profileData.open_to_remote;
    if (profileData.open_to_relocation !== undefined) payload.open_to_relocation = profileData.open_to_relocation;
    if (profileData.desired_salary_min !== undefined) payload.desired_salary_min = profileData.desired_salary_min;
    if (profileData.desired_salary_max !== undefined) payload.desired_salary_max = profileData.desired_salary_max;

    return payload;
}

/**
 * Completes onboarding by PATCHing candidate profile and user onboarding status in parallel.
 * - PATCH /candidates/:id with profile fields (skipped if payload is empty)
 * - PATCH /users/me with onboarding_status: "completed"
 */
export async function completeOnboarding(
    apiClient: ApiClient,
    candidateId: string,
    profileData: CandidateProfileData,
): Promise<void> {
    const candidatePayload = buildCandidatePayload(profileData);

    await Promise.all([
        Object.keys(candidatePayload).length > 0
            ? apiClient.patch(`/candidates/${candidateId}`, candidatePayload)
            : Promise.resolve(),
        apiClient.patch('/users/me', {
            onboarding_status: 'completed',
        }),
    ]);
}

/**
 * Skips onboarding by PATCHing user onboarding status to "skipped".
 * Does NOT call any candidate endpoint.
 */
export async function skipOnboarding(apiClient: ApiClient): Promise<void> {
    await apiClient.patch('/users/me', {
        onboarding_status: 'skipped',
    });
}
