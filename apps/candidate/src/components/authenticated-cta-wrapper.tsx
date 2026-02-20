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

    // Hide CTA content for authenticated users
    if (isLoaded && isSignedIn) {
        return null;
    }

    // Render while loading (elements start opacity-0 so no flash) and for non-authenticated users.
    // Must be in the DOM before GSAP runs so animations can attach.
    return <>{children}</>;
}
