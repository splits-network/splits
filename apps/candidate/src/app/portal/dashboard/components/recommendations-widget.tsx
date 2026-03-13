"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

interface JobRecommendation {
    id: string;
    job_id: string;
    message: string | null;
    status: string;
    created_at: string;
    job?: {
        title: string;
        location: string | null;
        company?: { name: string } | null;
    };
}

export default function RecommendationsWidget() {
    const { getToken } = useAuth();
    const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
    const [loading, setLoading] = useState(true);

    const loadRecommendations = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const response: any = await client.get("/v3/job-recommendations/mine");
            setRecommendations(response.data || []);
        } catch {
            setRecommendations([]);
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        loadRecommendations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateStatus = async (id: string, status: "viewed" | "dismissed") => {
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            await client.patch(`/v3/job-recommendations/${id}`, { status });
            setRecommendations((prev) =>
                status === "dismissed"
                    ? prev.filter((r) => r.id !== id)
                    : prev.map((r) => (r.id === id ? { ...r, status } : r)),
            );
        } catch {
            // silent fail
        }
    };

    if (loading) {
        return (
            <div className="bg-base-100 border-2 border-base-200 p-6">
                <div className="h-5 w-48 bg-base-content/10 animate-pulse mb-4" />
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-16 bg-base-content/5 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (recommendations.length === 0) return null;

    return (
        <div className="bg-base-100 border-2 border-primary/20 p-6 scroll-reveal fade-up">
            <div className="flex items-center gap-2 mb-4">
                <i className="fa-duotone fa-regular fa-star text-primary" />
                <h3 className="text-base font-bold tracking-tight">
                    Recommended for You
                </h3>
                <span className="badge badge-primary badge-sm">
                    {recommendations.length}
                </span>
            </div>

            <div className="space-y-3">
                {recommendations.map((rec) => (
                    <div
                        key={rec.id}
                        className="flex items-start gap-3 p-3 bg-base-200/50 border border-base-200"
                    >
                        <div className="flex-1 min-w-0">
                            <Link
                                href={`/portal/jobs/${rec.job_id}`}
                                className="text-sm font-semibold hover:text-primary transition-colors line-clamp-1"
                                onClick={() => {
                                    if (rec.status === "pending") {
                                        updateStatus(rec.id, "viewed");
                                    }
                                }}
                            >
                                {rec.job?.title || "Open Position"}
                            </Link>
                            <p className="text-sm text-base-content/60 line-clamp-1">
                                {rec.job?.company?.name || "Company"}
                                {rec.job?.location && ` \u00B7 ${rec.job.location}`}
                            </p>
                            {rec.message && (
                                <p className="text-sm text-base-content/40 mt-1 line-clamp-2">
                                    {rec.message}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            <Link
                                href={`/portal/jobs/${rec.job_id}`}
                                className="btn btn-primary btn-sm"
                                onClick={() => {
                                    if (rec.status === "pending") {
                                        updateStatus(rec.id, "viewed");
                                    }
                                }}
                            >
                                View
                            </Link>
                            <button
                                type="button"
                                className="btn btn-ghost btn-sm"
                                onClick={() => updateStatus(rec.id, "dismissed")}
                                title="Dismiss"
                            >
                                <i className="fa-duotone fa-regular fa-xmark" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
