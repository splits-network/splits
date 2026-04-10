"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ApplicationDetailPanel } from "./application-detail-panel";
import type { Application } from "../../types";

interface DetailLoaderProps {
    applicationId: string;
    onClose: () => void;
    onRefresh?: () => void;
}

export function DetailLoader({
    applicationId,
    onClose,
    onRefresh,
}: DetailLoaderProps) {
    const { getToken } = useAuth();
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchDetail = useCallback(async (id: string, signal?: { cancelled: boolean }) => {
        try {
            const token = await getToken();
            if (!token || signal?.cancelled) return;
            const client = createAuthenticatedClient(token);
            const response = await client.get(
                `/applications/${id}/view/detail`,
                { params: { include: 'timeline,recruiter' } },
            );
            if (!signal?.cancelled) setApplication(response.data || null);
        } catch (error) {
            console.error("Failed to fetch application detail:", error);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const signal = { cancelled: false };
        setLoading(true);

        fetchDetail(applicationId, signal).finally(() => {
            if (!signal.cancelled) setLoading(false);
        });

        return () => {
            signal.cancelled = true;
        };
    }, [applicationId, refreshKey, fetchDetail]);

    const handleRefresh = useCallback(() => {
        setRefreshKey((k) => k + 1);
        onRefresh?.();
    }, [onRefresh]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-12">
                <div className="text-center">
                    <span className="loading loading-spinner loading-md text-primary mb-4 block mx-auto"></span>
                    <span className="text-sm font-bold uppercase tracking-wider text-base-content/40">
                        Loading application...
                    </span>
                </div>
            </div>
        );
    }

    if (!application) return null;

    return (
        <ApplicationDetailPanel
            application={application}
            onClose={onClose}
            onRefresh={handleRefresh}
        />
    );
}
