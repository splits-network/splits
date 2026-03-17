"use client";

/**
 * Client Wrapper for Authenticated Layout
 * Provides user profile context (includes subscription) and page title context.
 * Presence tracking: usePresenceHeartbeat() connects to chat-gateway on mount,
 * keeping the user online/idle in Redis for the duration of their session.
 *
 * Onboarding is now handled by the full-page /onboarding route.
 * This component includes a redirect guard: if onboarding is not complete,
 * the user is sent to /onboarding instead of seeing the dashboard.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageTitleProvider, DrawerProvider, useUserProfile } from "@/contexts";
import { usePresenceHeartbeat } from "@/hooks/use-presence-heartbeat";

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
    // Global presence: keeps user online/idle in Redis on every authenticated page
    usePresenceHeartbeat();

    return (
        <PageTitleProvider>
            <DrawerProvider>
                <OnboardingRedirectGuard>{children}</OnboardingRedirectGuard>
            </DrawerProvider>
        </PageTitleProvider>
    );
}
