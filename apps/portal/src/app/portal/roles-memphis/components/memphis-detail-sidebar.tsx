"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { GeometricDecoration } from "@splits-network/memphis-ui";
import { MemphisSidebarOverlay } from "./memphis-sidebar-overlay";
import DetailsView from "../../roles/components/details-view";

interface MemphisDetailSidebarProps {
    roleId: string | null;
    onClose: () => void;
    onViewPipeline?: (roleId: string) => void;
}

export default function MemphisDetailSidebar({
    roleId,
    onClose,
    onViewPipeline,
}: MemphisDetailSidebarProps) {
    const { getToken } = useAuth();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (roleId) {
            fetchJob(roleId);
        } else {
            setJob(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roleId]);

    const fetchJob = async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error("No auth token available");

            const client = createAuthenticatedClient(token);
            const response: any = await client.get(`/jobs/${id}`, {
                params: { include: "company,requirements,pre_screen_questions" },
            });
            setJob(response.data);
        } catch (err: any) {
            console.error("Failed to fetch job:", err);
            setError("Failed to load role details.");
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        if (roleId) fetchJob(roleId);
    };

    return (
        <MemphisSidebarOverlay
            isOpen={!!roleId}
            onClose={onClose}
            title="Role Details"
            subtitle={job?.title || undefined}
            headerActions={
                onViewPipeline && roleId ? (
                    <button
                        onClick={() => onViewPipeline(roleId)}
                        className="memphis-btn memphis-btn-sm btn-teal"
                    >
                        <i className="fa-duotone fa-regular fa-diagram-project" />
                        Pipeline
                    </button>
                ) : undefined
            }
        >
            {loading && (
                <div className="p-8 text-center">
                    <GeometricDecoration shape="square" color="coral" size={24} className="mx-auto mb-3 animate-spin" />
                    <p className="text-xs font-black uppercase tracking-wider text-dark/40">
                        Loading role details...
                    </p>
                </div>
            )}

            {error && !loading && (
                <div className="p-4">
                    <div className="border-memphis border-dark bg-coral/10 p-4">
                        <p className="text-xs font-bold text-coral">
                            <i className="fa-duotone fa-regular fa-circle-exclamation mr-2" />
                            {error}
                        </p>
                        <button
                            onClick={handleRefresh}
                            className="memphis-btn memphis-btn-sm btn-coral mt-3"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}

            {job && !loading && (
                <div className="p-4 space-y-4">
                    <DetailsView
                        job={job}
                        loading={loading}
                        compact={true}
                        tabbed={true}
                        showSections={{
                            quickStats: true,
                            descriptions: true,
                            requirements: true,
                            preScreen: true,
                            financials: true,
                            company: true,
                        }}
                    />
                </div>
            )}
        </MemphisSidebarOverlay>
    );
}
