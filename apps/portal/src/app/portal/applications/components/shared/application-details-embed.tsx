"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ApplicationDetailPanel } from "./application-detail-panel";
import type { Application } from "../../types";

interface ApplicationDetailsEmbedProps {
    itemId: string;
    onRefresh?: () => void;
}

/**
 * Self-fetching application detail view for embedded contexts
 * (e.g., notification detail panel) where no close button is needed.
 */
export function ApplicationDetailsEmbed({ itemId, onRefresh }: ApplicationDetailsEmbedProps) {
    const { getToken } = useAuth();
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchDetail = useCallback(async () => {
        if (!itemId) return;
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const response = await client.get(`/applications/${itemId}/view/detail?include=recruiter,audit,documents`);
            setApplication(response.data || null);
        } catch (err) {
            console.error("Failed to fetch application detail:", err);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemId]);

    useEffect(() => {
        setLoading(true);
        fetchDetail();
    }, [fetchDetail]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-center">
                    <span className="loading loading-spinner loading-md text-primary mb-4 block mx-auto" />
                    <span className="text-sm font-bold uppercase tracking-wider text-base-content/40">
                        Loading application...
                    </span>
                </div>
            </div>
        );
    }

    if (!application) {
        return (
            <div className="p-6 text-center text-base-content/40">
                <p>This application could not be loaded.</p>
            </div>
        );
    }

    return (
        <ApplicationDetailPanel
            application={application}
            onClose={() => {}}
            onRefresh={onRefresh || fetchDetail}
        />
    );
}
