"use client";

/**
 * Client Wrapper for Authenticated Layout
 * Provides user profile context (includes subscription) and page title context.
 * Presence tracking is handled by the sidebar's WebSocket connection (useChatGateway + useActivityStatus).
 *
 * Onboarding is now handled by the full-page /onboarding route.
 * This component includes a redirect guard: if onboarding is not complete,
 * the user is sent to /onboarding instead of seeing the dashboard.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageTitleProvider, useUserProfile } from "@/contexts";

function OnboardingRedirectGuard({ children }: { children: React.ReactNode }) {
    const { profile, isLoading, isAdmin, error } = useUserProfile();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;
        if (isAdmin) return; // Admins skip onboarding

        // Profile failed to load (e.g. user record doesn't exist yet) or
        // onboarding not completed → send to onboarding wizard
        if (!profile || error || profile.onboarding_status !== "completed") {
            router.replace("/onboarding");
        }
    }, [profile, isLoading, isAdmin, error, router]);

    return <>{children}</>;
}

export function AuthenticatedLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PageTitleProvider>
            <OnboardingRedirectGuard>{children}</OnboardingRedirectGuard>
        </PageTitleProvider>
    );
}
