"use client";

/**
 * Client Wrapper for Authenticated Layout
 * Provides user profile context, page title context, subscription context, and onboarding context
 */

import {
    OnboardingProvider,
    OnboardingWizardModal,
} from "@/components/onboarding";
import {
    UserProfileProvider,
    PageTitleProvider,
    SubscriptionProvider,
} from "@/contexts";

export function AuthenticatedLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <UserProfileProvider>
            <SubscriptionProvider>
                <PageTitleProvider>
                    <OnboardingProvider>
                        {children}
                        <OnboardingWizardModal />
                    </OnboardingProvider>
                </PageTitleProvider>
            </SubscriptionProvider>
        </UserProfileProvider>
    );
}
