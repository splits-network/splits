"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { Application } from "../../types";
import Details from "./details";
// Reuse the original ActionsToolbar -- it contains all the business logic + modals
import ActionsToolbar from "@/app/portal/applications/components/shared/actions-toolbar";

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
        <div className="flex flex-col h-full bg-base-100">
            {/* Action bar */}
            <div className="p-4 border-b-2 border-base-300">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <ActionsToolbar
                            application={application as any}
                            variant="descriptive"
                            size="sm"
                            showActions={{ viewDetails: false }}
                            onRefresh={onRefresh}
                        />
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-sm btn-square btn-ghost flex-shrink-0"
                    >
                        <i className="fa-duotone fa-regular fa-xmark text-lg" />
                    </button>
                </div>
            </div>
            {/* Detail content */}
            <div className="min-h-0 flex-1 overflow-y-auto">
                <Details itemId={application.id} onRefresh={onRefresh} />
            </div>
        </div>
    );
}
