"use client";

/**
 * Client Wrapper for Authenticated Layout
 * Provides user profile context (includes subscription), page title context, and onboarding context
 */

import {
    OnboardingProvider,
    OnboardingWizardModal,
} from "@/components/onboarding";
import { PageTitleProvider } from "@/contexts";

export function AuthenticatedLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PageTitleProvider>
            <OnboardingProvider>
                {children}
                <OnboardingWizardModal />
            </OnboardingProvider>
        </PageTitleProvider>
    );
}
