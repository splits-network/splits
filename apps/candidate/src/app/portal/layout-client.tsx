"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { PageTitleProvider } from "@/contexts/page-title-context";
import { useUserProfile } from "@/contexts";
import { PortalToolbar } from "@/components/portal-toolbar";

/**
 * Redirects users who haven't completed or skipped onboarding to /onboarding.
 * Skips redirect for invitation routes and admin users.
 */
function OnboardingRedirectGuard({ children }: { children: React.ReactNode }) {
    const { profile, isLoading, isAdmin } = useUserProfile();
    const pathname = usePathname();

    useEffect(() => {
        if (isLoading) return;
        if (isAdmin) return;

        // Don't redirect on invitation routes
        if (pathname?.startsWith("/portal/invitation/")) return;

        // Allow completed and skipped users through
        if (
            profile?.onboarding_status === "completed" ||
            profile?.onboarding_status === "skipped"
        ) {
            return;
        }

        // Pending / in_progress / missing → send to onboarding
        window.location.href = "/onboarding";
    }, [profile, isLoading, isAdmin, pathname]);

    return <>{children}</>;
}

export function PortalLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PageTitleProvider>
            <OnboardingRedirectGuard>
                <PortalToolbar />
                <div className="bg-base-300 p-6">{children}</div>
            </OnboardingRedirectGuard>
        </PageTitleProvider>
    );
}
