"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useUserProfile } from "@/contexts";

interface ExpiredBannerProps {
    applicationId: string;
    onReactivated: () => void;
}

export function ExpiredBanner({ applicationId, onReactivated }: ExpiredBannerProps) {
    const { getToken } = useAuth();
    const { isRecruiter, isAdmin } = useUserProfile();
    const [loading, setLoading] = useState(false);

    const canReactivate = isRecruiter || isAdmin;

    const handleReactivate = async () => {
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            const client = createAuthenticatedClient(token);
            await client.post(`/applications/${applicationId}/reactivate`);
            onReactivated();
        } catch (err: any) {
            console.error("Failed to reactivate application:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-warning/10 border-l-4 border-warning p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
                <i className="fa-duotone fa-regular fa-clock text-warning text-lg" />
                <div>
                    <div className="font-bold text-sm text-base-content">
                        This application has expired
                    </div>
                    <div className="text-sm text-base-content/60">
                        The original pipeline stage is preserved. Reactivate to
                        resume processing.
                    </div>
                </div>
            </div>
            {canReactivate && (
                <button
                    onClick={handleReactivate}
                    className="btn btn-warning btn-sm shrink-0"
                    disabled={loading}
                >
                    {loading ? (
                        <span className="loading loading-spinner loading-xs" />
                    ) : (
                        <i className="fa-duotone fa-regular fa-rotate-right mr-1" />
                    )}
                    Reactivate
                </button>
            )}
        </div>
    );
}
