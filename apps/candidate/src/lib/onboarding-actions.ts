/**
 * Onboarding Actions
 * Pure/async functions for completing/skipping onboarding.
 */

import type { ApiClient } from '@/lib/api-client';

/**
 * Determines if the onboarding modal should be shown based on the user's onboarding status.
 * Reads from the USER record, not the candidate record.
 */
export function shouldShowOnboardingModal(onboardingStatus: string | undefined): boolean {
    return (onboardingStatus || 'pending') === 'pending';
}

/**
 * Completes onboarding by marking the user status as completed.
 */
export async function completeOnboarding(
    apiClient: ApiClient,
    candidateId: string,
): Promise<void> {
    await apiClient.patch('/users/me', {
        onboarding_status: 'completed',
    });
}

/**
 * Skips onboarding by PATCHing user onboarding status to "skipped".
 */
export async function skipOnboarding(apiClient: ApiClient): Promise<void> {
    await apiClient.patch('/users/me', {
        onboarding_status: 'skipped',
    });
}
