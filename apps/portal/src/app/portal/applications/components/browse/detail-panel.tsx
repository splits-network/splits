"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useUserProfile } from "@/contexts";
import { Application } from "./types";
import DetailHeader from "./detail-header";
import ApplicationDetailsView from "../application-details-view";

interface DetailPanelProps {
    id: string | null;
    onClose: () => void;
}

export default function DetailPanel({ id, onClose }: DetailPanelProps) {
    const { getToken } = useAuth();
    const { isRecruiter, isCompanyUser } = useUserProfile();
    const [application, setApplication] = useState<Application | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    const fetchDetail = useCallback(async () => {
        if (!id) return;

        setLoading(true);
        setError(null);
        try {
            const authToken = await getToken();
            if (!authToken) return;

            setToken(authToken);
            const client = createAuthenticatedClient(authToken);

            // V2 API standard with all includes for full detail view
            const res = await client.get(`/applications/${id}`, {
                params: {
                    include: "candidate,job,company,recruiter,ai_review,documents,pre_screen_answers,audit_log",
                },
            });
            setApplication(res.data);
        } catch (err) {
            console.error(err);
            setError("Failed to load application details");
        } finally {
            setLoading(false);
        }
    }, [id, getToken]);

    useEffect(() => {
        if (!id) {
            setApplication(null);
            return;
        }

        fetchDetail();
    }, [fetchDetail]);

    if (!id) {
        return (
            <div className="hidden md:flex flex-1 items-center justify-center text-base-content/30 bg-base-100">
                <div className="text-center">
                    <i className="fa-duotone fa-user-check text-6xl mb-4 opacity-50" />
                    <p className="text-lg">Select an application to view details</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex-1 flex flex-col bg-base-100">
                <div className="h-20 border-b border-base-300 animate-pulse bg-base-200/50" />
                <div className="p-8 space-y-4">
                    <div className="h-8 w-1/3 bg-base-200 rounded animate-pulse" />
                    <div className="h-4 w-full bg-base-200 rounded animate-pulse" />
                    <div className="h-4 w-2/3 bg-base-200 rounded animate-pulse" />
                </div>
            </div>
        );
    }

    if (error || !application) {
        return (
            <div className="flex-1 flex items-center justify-center bg-base-100">
                <div className="text-center max-w-md p-6">
                    <div className="alert alert-error">
                        <i className="fa-duotone fa-regular fa-circle-exclamation" />
                        <span>{error || "Application not found"}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost mt-4 md:hidden"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-base-100 w-full overflow-hidden">
            <DetailHeader
                application={application}
                onClose={onClose}
                onRefresh={fetchDetail}
            />

            <div className="flex-1 overflow-y-auto p-6">
                <ApplicationDetailsView
                    application={application}
                    loading={loading}
                    compact={false}
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
                    onRefresh={fetchDetail}
                />
            </div>
        </div>
    );
}
