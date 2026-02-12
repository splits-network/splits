"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { LoadingState } from "@splits-network/shared-ui";
import RoleActionsToolbar from "./shared/actions-toolbar";
import DetailsView from "./details-view";

// ===== TYPES =====

interface Job {
    id: string;
    title: string | null;
    company_id: string | null;
    company?: {
        id?: string;
        name: string | null;
        logo_url?: string | null;
        [key: string]: any;
    };
    location?: string | null;
    department?: string | null;
    employment_type?: string | null;
    salary_min?: number | null;
    salary_max?: number | null;
    fee_percentage: number | null;
    guarantee_days?: number | null;
    status: "active" | "paused" | "filled" | "closed" | string | null;
    recruiter_description?: string | null;
    candidate_description?: string | null;
    open_to_relocation?: boolean | null;
    show_salary_range?: boolean | null;
    created_at: string | null;
    requirements?: JobRequirement[];
    [key: string]: any;
}

interface JobRequirement {
    id: string;
    requirement_type: "mandatory" | "preferred" | string | null;
    description: string | null;
    [key: string]: any;
}

interface Badge {
    class: string;
    icon: string;
    text?: string;
    tooltip?: string;
    animated?: boolean;
}

interface DetailSidebarProps {
    roleId: string | null;
    onClose: () => void;
    onViewPipeline?: (roleId: string) => void;
}

// ===== COMPONENT =====

export default function DetailSidebar({
    roleId,
    onClose,
    onViewPipeline,
}: DetailSidebarProps) {
    const { getToken } = useAuth();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (roleId) {
            fetchJob(roleId);
        } else {
            setJob(null);
        }
    }, [roleId]);

    const fetchJob = async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error("No auth token available");
            }

            const client = createAuthenticatedClient(token);
            const response: any = await client.get(`/jobs/${id}`, {
                params: {
                    include: "company,requirements,pre_screen_questions",
                },
            });
            setJob(response.data);
        } catch (err: any) {
            console.error("Failed to fetch job:", err);
            setError("Failed to load role details. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        if (roleId) {
            fetchJob(roleId);
        }
    };

    if (!roleId || !job) {
        return null;
    }

    if (loading) {
        return (
            <div className="drawer drawer-end">
                <input
                    id="role-detail-drawer"
                    type="checkbox"
                    className="drawer-toggle"
                    checked={!!roleId}
                    readOnly
                />
                <div className="drawer-side z-50">
                    <label
                        className="drawer-overlay"
                        onClick={onClose}
                        aria-label="Close sidebar"
                    ></label>
                    <div className="bg-base-100 min-h-full w-full md:w-2/3 lg:w-1/2 xl:w-2/5 flex flex-col">
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-8">
                                <LoadingState message="Loading role details..." />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="drawer drawer-end">
            <input
                id="role-detail-drawer"
                type="checkbox"
                className="drawer-toggle"
                checked={!!roleId}
                readOnly
            />

            <div className="drawer-side z-50">
                <label
                    className="drawer-overlay"
                    onClick={onClose}
                    aria-label="Close sidebar"
                ></label>

                <div className="bg-base-100 min-h-full w-full md:w-2/3 lg:w-1/2 xl:w-1/2 flex flex-col">
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 p-4 flex items-center justify-between">
                        <h2 className="text-lg font-bold">Role Details</h2>
                        <div className="flex items-center gap-2">
                            <div className="md:hidden">
                                {/* Actions Toolbar */}
                                <RoleActionsToolbar
                                    job={job}
                                    variant="descriptive"
                                    layout="horizontal"
                                    size="md"
                                    onRefresh={handleRefresh}
                                    onViewPipeline={onViewPipeline}
                                    showActions={{
                                        viewDetails: false, // Already viewing full details in sidebar
                                        viewPipeline: true, // Show pipeline button
                                    }}
                                />
                            </div>
                            <div className="hidden md:block">
                                {/* Actions Toolbar */}
                                <RoleActionsToolbar
                                    job={job}
                                    variant="descriptive"
                                    layout="horizontal"
                                    size="md"
                                    onRefresh={handleRefresh}
                                    onViewPipeline={onViewPipeline}
                                    showActions={{
                                        viewDetails: false, // Already viewing full details in sidebar
                                        viewPipeline: true, // Show pipeline button
                                    }}
                                />
                            </div>
                            <button
                                onClick={onClose}
                                className="btn btn-sm btn-circle btn-ghost"
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        {loading && (
                            <div className="p-8">
                                <LoadingState message="Loading role details..." />
                            </div>
                        )}

                        {error && !loading && (
                            <div className="p-4">
                                <div className="alert alert-error">
                                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                                    <span>{error}</span>
                                </div>
                            </div>
                        )}

                        {job && !loading && (
                            <div className="p-4 space-y-4">
                                {/* Role Details - FULL COMPREHENSIVE VIEW WITH TABS */}
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
                    </div>
                </div>
            </div>
        </div>
    );
}
