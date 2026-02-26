"use client";

import { useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import {
    BaselCookieConsent,
    type ConsentPreferences,
} from "@splits-network/basel-ui";
import { createAuthenticatedClient } from "@/lib/api-client";

export default function CookieConsent() {
    const { isSignedIn, getToken } = useAuth();

    const handleConsentSaved = useCallback(
        async (prefs: ConsentPreferences) => {
            if (!isSignedIn) return;

            try {
                const token = await getToken();
                if (!token) return;

                const client = createAuthenticatedClient(token);
                await client.post("/consent", {
                    preferences: {
                        functional: prefs.functional,
                        analytics: prefs.analytics,
                        marketing: prefs.marketing,
                    },
                });
            } catch (error) {
                console.error("Error syncing consent:", error);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isSignedIn],
    );

    return <BaselCookieConsent onConsentSaved={handleConsentSaved} />;
}
