"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { LoadingState, ErrorState } from "@/hooks/use-standard-list";
import { AdminPageHeader } from "../../components";
import { MatchOverviewCard } from "./components/match-overview-card";
import { FactorCard } from "./components/factor-card";
import { SkillsBreakdown } from "./components/skills-breakdown";
import { FeatureGate } from "@/components/entitlements/feature-gate";
import { UpgradePrompt } from "@/components/entitlements/upgrade-prompt";
import type { EnrichedMatch } from "@splits-network/shared-types";

interface MatchDetailClientProps {
    matchId: string;
}

export default function MatchDetailClient({ matchId }: MatchDetailClientProps) {
    const { getToken } = useAuth();
    const router = useRouter();

    const [match, setMatch] = useState<EnrichedMatch | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dismissing, setDismissing] = useState(false);

    const fetchMatch = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const token = await getToken();
            if (!token) throw new Error("No auth token");
            const apiClient = createAuthenticatedClient(token);
            const response: any = await apiClient.get(`/matches/views/enriched`, { params: { id: matchId, limit: 1 } });
            const items = response?.data || [];
            setMatch(Array.isArray(items) ? items[0] || null : items);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load match");
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchId]);

    useEffect(() => {
        fetchMatch();
    }, [fetchMatch]);

    const handleDismiss = useCallback(async () => {
        if (!match) return;
        try {
            setDismissing(true);
            const token = await getToken();
            if (!token) return;
            const apiClient = createAuthenticatedClient(token);
            await apiClient.patch(`/matches/${match.id}/dismiss`);
            setMatch((prev) => (prev ? { ...prev, status: "dismissed" } : prev));
        } catch (err) {
            console.error("Failed to dismiss match:", err);
        } finally {
            setDismissing(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [match?.id]);

    if (loading) return <LoadingState message="Loading match details..." />;
    if (error) return <ErrorState message={error} onRetry={fetchMatch} />;
    if (!match) return <ErrorState message="This match could not be found. It may have been removed." />;

    const factors = match.match_factors;

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Match detail"
                subtitle={`${match.candidate?.full_name || "Candidate"} matched to ${match.job?.title || "role"}`}
                breadcrumbs={[
                    { label: "Matches", href: "/portal/admin/matches" },
                    { label: match.candidate?.full_name || "Candidate" },
                ]}
                actions={
                    <div className="flex gap-2">
                        <button className="btn btn-sm btn-ghost" onClick={() => router.back()}>
                            <i className="fa-duotone fa-regular fa-arrow-left mr-1"></i>
                            Back
                        </button>
                        {match.status === "active" && (
                            <button
                                className="btn btn-sm btn-error btn-outline"
                                onClick={handleDismiss}
                                disabled={dismissing}
                            >
                                {dismissing && <span className="loading loading-spinner loading-xs"></span>}
                                <i className="fa-duotone fa-regular fa-xmark mr-1"></i>
                                Dismiss
                            </button>
                        )}
                    </div>
                }
            />

            {/* Status badge if not active */}
            {match.status !== "active" && (
                <div className="alert alert-warning">
                    <i className="fa-duotone fa-regular fa-circle-info"></i>
                    <span>
                        This match was <strong>{match.status}</strong>
                        {match.dismissed_at && ` on ${new Date(match.dismissed_at).toLocaleDateString()}`}.
                    </span>
                </div>
            )}

            {/* Overview card */}
            <MatchOverviewCard match={match} />

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Factor cards */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">
                        <i className="fa-duotone fa-regular fa-clipboard-check mr-2"></i>
                        Match factors
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FactorCard
                            icon="fa-money-bill-wave"
                            label="Salary alignment"
                            passed={factors.salary_overlap}
                            detail={`${Math.round(factors.salary_overlap_pct)}% overlap`}
                        />
                        <FactorCard icon="fa-briefcase" label="Employment type" passed={factors.employment_type_match} />
                        <FactorCard icon="fa-layer-group" label="Seniority level" passed={factors.job_level_match} />
                        <FactorCard icon="fa-location-dot" label="Location" passed={factors.location_compatible} />
                        <FactorCard icon="fa-car" label="Commute" passed={factors.commute_compatible} />
                        <FactorCard icon="fa-calendar-check" label="Availability" passed={factors.availability_compatible} />
                    </div>
                </div>

                {/* Right: Skills + AI */}
                <div className="space-y-6">
                    <div className="card bg-base-100 shadow">
                        <div className="card-body">
                        <SkillsBreakdown
                            matched={factors.skills_matched}
                            missing={factors.skills_missing}
                            matchPct={factors.skills_match_pct}
                        />
                        </div>
                    </div>

                    {/* AI Summary */}
                    <FeatureGate entitlement="ai_match_scoring">
                        {match.ai_score !== null && factors.ai_summary ? (
                            <div className="card bg-base-100 shadow">
                                <div className="card-body">
                                    <h3 className="font-semibold mb-2">
                                        <i className="fa-duotone fa-regular fa-brain mr-2"></i>
                                        True Score analysis
                                    </h3>
                                    <p className="text-sm text-base-content/80 leading-relaxed">
                                        {factors.ai_summary}
                                    </p>
                                </div>
                            </div>
                        ) : null}
                    </FeatureGate>
                </div>
            </div>
        </div>
    );
}
