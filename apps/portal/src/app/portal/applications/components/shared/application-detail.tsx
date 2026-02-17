"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { Application } from "../../types";
import type { AccentClasses } from "./accent";
import Details from "./details";
import ActionsToolbar from "./actions-toolbar";

interface DetailLoaderProps {
    applicationId: string;
    accent: AccentClasses;
    onClose: () => void;
    onRefresh?: () => void;
}

export function DetailLoader({
    applicationId,
    accent,
    onClose,
    onRefresh,
}: DetailLoaderProps) {
    const { getToken } = useAuth();
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        (async () => {
            try {
                const token = await getToken();
                if (!token || cancelled) return;
                const client = createAuthenticatedClient(token);
                const response = await client.get(
                    `/applications/${applicationId}`,
                    {
                        params: { include: "candidate,job,company,ai_review" },
                    },
                );
                if (!cancelled) setApplication(response.data || null);
            } catch (error) {
                console.error("Failed to fetch application detail:", error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [applicationId]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-12">
                <div className="text-center">
                    <div className="flex justify-center gap-3 mb-4">
                        <div className="w-4 h-4 bg-coral animate-pulse" />
                        <div className="w-4 h-4 rounded-full bg-teal animate-pulse" />
                        <div className="w-4 h-4 rotate-45 bg-yellow animate-pulse" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider text-dark/50">
                        Loading details...
                    </span>
                </div>
            </div>
        );
    }

    if (!application) return null;

    return (
        <div className="flex flex-col h-full bg-white">
            <div className={`p-4 border-b-4 ${accent.border}`}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <ActionsToolbar
                            application={application}
                            variant="priority"
                            size="xs"
                            showActions={{ viewDetails: false }}
                            onRefresh={onRefresh}
                        />
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-xs btn-square btn-ghost flex-shrink-0"
                    >
                        <i className="fa-duotone fa-regular fa-xmark" />
                    </button>
                </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
                <Details itemId={application.id} onRefresh={onRefresh} />
            </div>
        </div>
    );
}
