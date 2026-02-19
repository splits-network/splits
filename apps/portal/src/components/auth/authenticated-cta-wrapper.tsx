"use client";

import { useAuth } from "@clerk/nextjs";

interface AuthenticatedCTAWrapperProps {
    children: React.ReactNode;
}

/**
 * Wrapper component that hides CTA sections for authenticated users.
 * Used to prevent showing sign-up CTAs to users who are already logged in.
 */
export function AuthenticatedCTAWrapper({
    children,
}: AuthenticatedCTAWrapperProps) {
    const { isSignedIn, isLoaded } = useAuth();

    // Don't render anything while Clerk is loading to prevent flash
    if (!isLoaded) {
        return null;
    }

    // Hide CTA content for authenticated users
    if (isSignedIn) {
        return null;
    }

    // Show CTA content for non-authenticated users
    return <>{children}</>;
}
