"use client";

/**
 * Client Wrapper for Authenticated Layout
 * Provides user profile context (includes subscription), page title context, onboarding context,
 * and global site-wide presence tracking
 */

import {
    OnboardingProvider,
    OnboardingWizardModal,
} from "@/components/onboarding";
import { PageTitleProvider } from "@/contexts";
import { useGlobalPresence } from "@/hooks/use-global-presence";

export function AuthenticatedLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    // Enable global presence tracking across the entire portal
    useGlobalPresence({
        enabled: true,
        pingIntervalMs: 30000, // 30 seconds
        idleTimeoutMs: 900000, // 15 minutes
        debugLogging: process.env.NODE_ENV === "development",
    });

    return (
        <PageTitleProvider>
            <OnboardingProvider>
                {children}
                <OnboardingWizardModal />
            </OnboardingProvider>
        </PageTitleProvider>
    );
}
