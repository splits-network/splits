/* ─── Cookie helpers for consent persistence ─────────────────────────── */

const CONSENT_COOKIE_NAME = "sn-cookie-consent";
const CONSENT_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

export interface ConsentPreferences {
    necessary: true;
    functional: boolean;
    analytics: boolean;
    marketing: boolean;
    timestamp: string;
}

/**
 * Read the consent cookie and return parsed preferences, or null if absent.
 */
export function readConsentCookie(): ConsentPreferences | null {
    if (typeof document === "undefined") return null;

    const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${CONSENT_COOKIE_NAME}=`));

    if (!match) return null;

    try {
        return JSON.parse(decodeURIComponent(match.split("=")[1]));
    } catch {
        return null;
    }
}

/**
 * Write consent preferences to a cookie with long expiry.
 * Uses SameSite=Lax and a root path so it persists across page navigations.
 */
export function writeConsentCookie(prefs: ConsentPreferences): void {
    if (typeof document === "undefined") return;

    const value = encodeURIComponent(JSON.stringify(prefs));
    const parts = [
        `${CONSENT_COOKIE_NAME}=${value}`,
        `path=/`,
        `max-age=${CONSENT_COOKIE_MAX_AGE}`,
        `SameSite=Lax`,
    ];

    document.cookie = parts.join("; ");
}
