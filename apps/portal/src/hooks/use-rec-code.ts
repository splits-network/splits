"use client";

import { useSearchParams } from "next/navigation";

/**
 * Hook to read the recruiter referral code from URL params or cookie.
 * URL param takes priority over cookie.
 *
 * The rec_code is stored as a cookie by middleware.ts when a user
 * first visits with ?rec_code=xxx, so it persists across navigation.
 */
export function useRecCode(): string | null {
    const searchParams = useSearchParams();

    // URL param takes priority
    const urlCode = searchParams.get("rec_code");
    if (urlCode) return urlCode;

    // Fallback to cookie
    if (typeof document !== "undefined") {
        const match = document.cookie.match(/(?:^|;\s*)rec_code=([^;]*)/);
        if (match) return decodeURIComponent(match[1]);
    }

    return null;
}

/**
 * Read rec_code from cookie only (for use outside of React components)
 */
export function getRecCodeFromCookie(): string | null {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/(?:^|;\s*)rec_code=([^;]*)/);
    if (match) return decodeURIComponent(match[1]);
    return null;
}
