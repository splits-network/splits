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
        id: string;
        title: string;
        location: string | null;
        employment_type: string | null;
        company?: { id: string; name: string; logo_url: string | null } | null;
    };
    recommender?: { id: string; name: string } | null;
}

interface RecommendationsWidgetProps {
    variant?: "banner" | "list";
}

export default function RecommendationsWidget({
    variant = "list",
}: RecommendationsWidgetProps) {
    const { getToken } = useAuth();
    const [recommendations, setRecommendations] = useState<
        JobRecommendation[]
    >([]);
    const [loading, setLoading] = useState(true);

    const loadRecommendations = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const response: any = await client.get(
                "/job-recommendations/mine",
            );
            setRecommendations(response.data || []);
        } catch {
            setRecommendations([]);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        loadRecommendations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateStatus = async (id: string, status: "viewed" | "dismissed") => {
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            await client.patch(`/job-recommendations/${id}`, { status });
            setRecommendations((prev) =>
                status === "dismissed"
                    ? prev.filter((r) => r.id !== id)
                    : prev.map((r) =>
                          r.id === id ? { ...r, status } : r,
                      ),
            );
        } catch {
            // silent fail
        }
    };

    if (loading) {
        if (variant === "banner") return null;
        return (
            <div className="bg-base-100 border-2 border-base-200 p-6">
                <div className="h-5 w-48 bg-base-content/10 animate-pulse mb-4" />
                <div className="space-y-3">
                    {[1, 2].map((i) => (
                        <div
                            key={i}
                            className="h-16 bg-base-content/5 animate-pulse"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (recommendations.length === 0) return null;

    const pendingCount = recommendations.filter(
        (r) => r.status === "pending",
    ).length;

    // ── Banner variant: top-of-dashboard alert ──
    if (variant === "banner" && pendingCount > 0) {
        const newest = recommendations.find((r) => r.status === "pending");
        return (
            <div className="bg-accent/5 border-l-4 border-accent px-6 sm:px-8 lg:px-12 py-4">
                <div className="container mx-auto flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                    <i className="fa-duotone fa-regular fa-building text-accent text-lg shrink-0 hidden sm:block" />
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                        <i className="fa-duotone fa-regular fa-building text-accent text-lg shrink-0 sm:hidden mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-base-content">
                                {pendingCount === 1
                                    ? `A company wants you for "${newest?.job?.title || "a role"}"${newest?.job?.company?.name ? ` at ${newest.job.company.name}` : ""}`
                                    : `${pendingCount} companies have roles for you`}
                            </p>
                            <p className="text-sm text-base-content/60 mt-0.5">
                                {pendingCount === 1
                                    ? "Review this opportunity and decide if you'd like to apply"
                                    : "Review these opportunities and decide which ones interest you"}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto shrink-0">
                        <a
                            href="#job-recommendations"
                            className="btn btn-accent btn-sm flex-1 sm:flex-initial"
                        >
                            {pendingCount === 1
                                ? "View Role"
                                : `View All (${pendingCount})`}
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    if (variant === "banner") return null;

    // ── List variant: full recommendation cards ──
    return (
        <div
            id="job-recommendations"
            className="scroll-reveal fade-up"
        >
            <div className="flex items-center gap-2 mb-4">
                <i className="fa-duotone fa-regular fa-building text-accent" />
                <h3 className="text-base font-bold tracking-tight">
                    Roles Sent to You
                </h3>
                {pendingCount > 0 && (
                    <span className="badge badge-accent badge-sm">
                        {pendingCount} new
                    </span>
                )}
            </div>

            <div className="space-y-3">
                {recommendations.map((rec) => {
                    const isPending = rec.status === "pending";
                    const timeAgo = getTimeAgo(rec.created_at);

                    return (
                        <div
                            key={rec.id}
                            className={`p-4 border transition-colors ${
                                isPending
                                    ? "bg-accent/5 border-accent/20"
                                    : "bg-base-200/50 border-base-200"
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Company logo/initial */}
                                <div className="w-10 h-10 bg-accent/10 flex items-center justify-center shrink-0">
                                    {rec.job?.company?.logo_url ? (
                                        <img
                                            src={rec.job.company.logo_url}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-sm font-bold text-accent">
                                            {(rec.job?.company?.name || "C")
                                                .charAt(0)
                                                .toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <Link
                                                href={`/jobs/${rec.job_id}`}
                                                className="text-sm font-bold hover:text-accent transition-colors line-clamp-1"
                                                onClick={() => {
                                                    if (isPending) {
                                                        updateStatus(
                                                            rec.id,
                                                            "viewed",
                                                        );
                                                    }
                                                }}
                                            >
                                                {rec.job?.title ||
                                                    "Open Position"}
                                            </Link>
                                            <p className="text-sm text-base-content/60 line-clamp-1">
                                                {rec.job?.company?.name ||
                                                    "Company"}
                                                {rec.job?.location &&
                                                    ` · ${rec.job.location}`}
                                                {rec.job?.employment_type &&
                                                    ` · ${rec.job.employment_type}`}
                                            </p>
                                        </div>
                                        {isPending && (
                                            <span className="badge badge-accent badge-sm shrink-0">
                                                New
                                            </span>
                                        )}
                                    </div>

                                    {rec.message && (
                                        <p className="text-sm text-base-content/50 mt-2 line-clamp-2 italic">
                                            &ldquo;{rec.message}&rdquo;
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between mt-3">
                                        <p className="text-sm text-base-content/40">
                                            {rec.recommender?.name
                                                ? `Sent by ${rec.recommender.name}`
                                                : "Sent by company"}{" "}
                                            · {timeAgo}
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <Link
                                                href={`/jobs/${rec.job_id}`}
                                                className="btn btn-accent btn-sm"
                                                onClick={() => {
                                                    if (isPending) {
                                                        updateStatus(
                                                            rec.id,
                                                            "viewed",
                                                        );
                                                    }
                                                }}
                                            >
                                                View Role
                                            </Link>
                                            <button
                                                type="button"
                                                className="btn btn-ghost btn-sm"
                                                onClick={() =>
                                                    updateStatus(
                                                        rec.id,
                                                        "dismissed",
                                                    )
                                                }
                                                title="Dismiss"
                                            >
                                                <i className="fa-duotone fa-regular fa-xmark" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function getTimeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}
