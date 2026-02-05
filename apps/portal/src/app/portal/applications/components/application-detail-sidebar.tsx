"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useUserProfile } from "@/contexts";
import { LoadingState } from "@splits-network/shared-ui";
import ApplicationActionsToolbar from "./application-actions-toolbar";
import ApplicationDetailsView from "./application-details-view";
import type { Application } from "./browse/types";

// ===== TYPES =====

interface ApplicationDetailSidebarProps {
    applicationId: string | null;
    onClose: () => void;
}

// ===== COMPONENT =====

export default function ApplicationDetailSidebar({
    applicationId,
    onClose,
}: ApplicationDetailSidebarProps) {
    const { getToken } = useAuth();
    const { isRecruiter, isCompanyUser } = useUserProfile();
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        if (applicationId) {
            fetchApplication(applicationId);
        } else {
            setApplication(null);
        }
    }, [applicationId]);

    const fetchApplication = async (id: string) => {
        setLoading(true);
        setError(null);

        try {
            const authToken = await getToken();
            if (!authToken) {
                throw new Error("No auth token available");
            }

            setToken(authToken);
            const client = createAuthenticatedClient(authToken);
            const response: any = await client.get(`/applications/${id}`, {
                params: {
                    include: "candidate,job,company,recruiter,ai_review,documents,pre_screen_answers,audit_log",
                },
            });
            setApplication(response.data);
        } catch (err: any) {
            console.error("Failed to fetch application:", err);
            setError("Failed to load application details. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        if (applicationId) {
            fetchApplication(applicationId);
        }
    };

    if (!applicationId) {
        return null;
    }

    if (loading && !application) {
        return (
            <div className="drawer drawer-end">
                <input
                    id="application-detail-drawer"
                    type="checkbox"
                    className="drawer-toggle"
                    checked={!!applicationId}
                    readOnly
                />
                <div className="drawer-side z-50">
                    <label
                        className="drawer-overlay"
                        onClick={onClose}
                        aria-label="Close sidebar"
                    ></label>
                    <div className="bg-base-100 min-h-full w-full md:w-2/3 lg:w-1/2 xl:w-1/2 flex flex-col">
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-8">
                                <LoadingState message="Loading application details..." />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!application) {
        return null;
    }

    return (
        <div className="drawer drawer-end">
            <input
                id="application-detail-drawer"
                type="checkbox"
                className="drawer-toggle"
                checked={!!applicationId}
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
                        <h2 className="text-lg font-bold">Application Details</h2>
                        <div className="flex items-center gap-2">
                            {/* Mobile: icon-only toolbar */}
                            <div className="md:hidden">
                                <ApplicationActionsToolbar
                                    application={application}
                                    variant="icon-only"
                                    layout="horizontal"
                                    size="sm"
                                    onRefresh={handleRefresh}
                                    showActions={{
                                        viewDetails: false, // Already viewing details
                                    }}
                                />
                            </div>
                            {/* Desktop: descriptive toolbar */}
                            <div className="hidden md:block">
                                <ApplicationActionsToolbar
                                    application={application}
                                    variant="descriptive"
                                    layout="horizontal"
                                    size="sm"
                                    onRefresh={handleRefresh}
                                    showActions={{
                                        viewDetails: false, // Already viewing details
                                    }}
                                />
                            </div>
                            <button
                                onClick={onClose}
                                className="btn btn-sm btn-circle btn-ghost"
                                aria-label="Close"
                            >
                                <i className="fa-duotone fa-regular fa-xmark"></i>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                        {loading && (
                            <div className="p-8">
                                <LoadingState message="Loading application details..." />
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

                        {application && !loading && (
                            <div className="p-4 space-y-4">
                                <ApplicationDetailsView
                                    application={application}
                                    loading={loading}
                                    compact={true}
                                    tabbed={true}
                                    showSections={{
                                        summary: true,
                                        candidate: true,
                                        job: true,
                                        documents: true,
                                        aiReview: true,
                                        timeline: true,
                                    }}
                                    token={token}
                                    isRecruiter={isRecruiter}
                                    isCompanyUser={isCompanyUser}
                                    onRefresh={handleRefresh}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
