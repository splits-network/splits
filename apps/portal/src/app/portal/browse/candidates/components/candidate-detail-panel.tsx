"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { Candidate } from "./types";
import DetailHeader from "./detail-header";
import DetailInvitation from "./detail-invitation";
import DetailBio from "./detail-bio";
import DetailPreferences from "./detail-preferences";
import DetailSkills from "./detail-skills";
import DetailApplications from "./detail-applications";
import DetailDocuments from "./detail-documents";
import DetailTimeline from "./detail-timeline";

interface CandidateDetailPanelProps {
    candidateId: string | null;
    onClose: () => void;
}

export default function CandidateDetailPanel({
    candidateId,
    onClose,
}: CandidateDetailPanelProps) {
    const { getToken } = useAuth();
    const [candidate, setCandidate] = useState<Candidate | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!candidateId) {
            setCandidate(null);
            return;
        }

        const fetchCandidate = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = await getToken();
                if (!token) throw new Error("Not authenticated");
                const client = createAuthenticatedClient(token);
                // V2 API
                const response = await client.get(`/candidates/${candidateId}`);
                setCandidate(response.data as Candidate);
            } catch (err) {
                console.error(err);
                setError("Failed to load candidate details");
            } finally {
                setLoading(false);
            }
        };

        fetchCandidate();
    }, [candidateId, getToken]);

    if (!candidateId) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-base-content/40">
                <div className="bg-base-200 p-6 rounded-full mb-4">
                    <i className="fa-duotone fa-regular fa-user-magnifying-glass text-4xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">
                    Select a candidate
                </h3>
                <p className="max-w-xs">
                    Select a candidate from the list to view their details,
                    applications, and documents.
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="h-full overflow-y-auto p-6 md:p-8 space-y-8 animate-pulse">
                {/* Header Skeleton */}
                <div className="flex gap-4 items-start">
                    <div className="skeleton w-16 h-16 rounded-full"></div>
                    <div className="space-y-2 flex-1">
                        <div className="skeleton h-6 w-1/3"></div>
                        <div className="skeleton h-4 w-1/4"></div>
                        <div className="flex gap-2 pt-2">
                            <div className="skeleton h-6 w-16"></div>
                            <div className="skeleton h-6 w-16"></div>
                        </div>
                    </div>
                </div>
                {/* Section Skeletons */}
                <div className="space-y-4">
                    <div className="skeleton h-40 w-full rounded-lg"></div>
                    <div className="skeleton h-24 w-full rounded-lg"></div>
                </div>
            </div>
        );
    }

    if (error || !candidate) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-error">
                <i className="fa-duotone fa-circle-exclamation text-4xl mb-3"></i>
                <p>{error || "Candidate not found"}</p>
                <button onClick={onClose} className="btn btn-ghost btn-sm mt-4">
                    Go back
                </button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-base-100">
            {/* Toolbar for Mobile (Back button) */}
            <div className="md:hidden p-2 border-b border-base-200">
                <button
                    onClick={onClose}
                    className="btn btn-ghost btn-sm gap-2"
                >
                    <i className="fa-regular fa-arrow-left"></i>
                    Back to List
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="p-6 md:p-8 space-y-8">
                    {/* Header Section */}
                    <DetailHeader candidate={candidate} />

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Main Content (2 cols) */}
                        <div className="xl:col-span-2 space-y-8">
                            <DetailBio candidate={candidate} />

                            {/* Async Components */}
                            <DetailApplications candidateId={candidate.id} />
                            <DetailTimeline candidateId={candidateId} />
                        </div>

                        {/* Sidebar Content (1 col) */}
                        <div className="space-y-8">
                            <DetailInvitation
                                candidateId={candidateId as string}
                            />
                            <DetailPreferences candidate={candidate} />
                            <DetailSkills candidate={candidate} />
                            <DetailDocuments candidateId={candidateId} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
