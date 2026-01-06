'use client';

/**
 * Client Wrapper for Authenticated Layout
 * Provides user profile context and onboarding context
 */

import { OnboardingProvider, OnboardingWizardModal } from '@/components/onboarding';
import { UserProfileProvider } from '@/contexts';

export function AuthenticatedLayoutClient({ children }: { children: React.ReactNode }) {
    return (
        <UserProfileProvider>
            <OnboardingProvider>
                {children}
                <OnboardingWizardModal />
            </OnboardingProvider>
        </UserProfileProvider>
    );
}
