"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

export interface ScheduledInterview {
    id: string;
    scheduled_at: string;
    scheduled_duration_minutes: number;
    status: "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show";
    calendar_event_id?: string;
    calendar_connection_id?: string;
    title?: string;
    application_id?: string;
}

const JOINABLE_STAGES = new Set([
    "submitted",
    "recruiter_review",
    "screen",
    "company_review",
    "company_feedback",
    "interview",
    "offer",
]);

/**
 * Self-fetch hook to find a joinable interview for an application.
 * Only fetches when the application is in an interview-relevant stage.
 */
export function useScheduledInterview(
    applicationId: string,
    stage: string | null | undefined,
) {
    const [interview, setInterview] = useState<ScheduledInterview | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const { getToken } = useAuth();

    const refetch = useCallback(() => {
        setRefreshKey((k) => k + 1);
    }, []);

    useEffect(() => {
        if (!stage || !JOINABLE_STAGES.has(stage)) return;

        let cancelled = false;
        (async () => {
            try {
                const token = await getToken();
                if (!token || cancelled) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get("/interviews", {
                    params: { application_id: applicationId, limit: 1 },
                });
                const interviews = Array.isArray(res.data) ? res.data : [];
                const joinable = interviews.find(
                    (i: ScheduledInterview) =>
                        i.status === "scheduled" || i.status === "in_progress",
                );
                if (!cancelled) {
                    setInterview(joinable || null);
                }
            } catch (err) {
                console.warn("[useScheduledInterview] Failed to fetch interviews for", applicationId, err);
            }
        })();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [applicationId, stage, refreshKey]);

    return { interview, refetch };
}
