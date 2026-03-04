"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { MatchScoreBadge } from "@/components/matches/match-score-badge";
import { TrueScoreUpsell } from "@/components/matches/true-score-upsell";
import type { EnrichedMatch } from "@splits-network/shared-types";
import type { Job } from "../../types";

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

function candidateInitials(match: EnrichedMatch): string {
    const name = match.candidate?.full_name;
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

function candidateName(match: EnrichedMatch): string {
    return match.candidate?.full_name || "Unknown Candidate";
}

/* ─── Component ────────────────────────────────────────────────────────────── */

export function JobMatchesTab({ job, isPartner, isRecruiter }: { job: Job; isPartner: boolean; isRecruiter: boolean }) {
    const { getToken } = useAuth();
    const [matches, setMatches] = useState<EnrichedMatch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const token = await getToken();
                if (!token || cancelled) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get<{ data: EnrichedMatch[] }>("/matches", {
                    params: {
                        job_id: job.id,
                        status: "active",
                        sort_by: "match_score",
                        sort_order: "desc",
                        limit: 20,
                    },
                });
                if (!cancelled) {
                    setMatches(Array.isArray(res.data) ? res.data : []);
                }
            } catch {
                // Gracefully handle errors
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [job.id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <span className="loading loading-spinner loading-lg text-primary mb-4 block" />
                <span className="text-sm uppercase tracking-[0.2em] font-bold text-base-content/40">
                    Loading matches...
                </span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {isRecruiter && !isPartner && <TrueScoreUpsell />}

            {matches.length === 0 ? (
                <div className="text-center py-12 text-base-content/40">
                    <i className="fa-duotone fa-regular fa-bullseye text-3xl mb-3 block" />
                    <p className="text-sm font-semibold">No matched candidates yet</p>
                </div>
            ) : (
                <>
                    <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                        Matched Candidates
                    </h3>
                    <div className="space-y-[2px] bg-base-300 max-h-[60vh] overflow-y-auto">
                        {matches.map((match) => {
                            const factors = match.match_factors;
                            return (
                                <div key={match.id} className="flex items-center gap-3 bg-base-100 p-4">
                                    <div className="w-10 h-10 flex items-center justify-center bg-primary/10 border border-base-300 text-sm font-bold text-primary">
                                        {candidateInitials(match)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm truncate">{candidateName(match)}</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {factors.salary_overlap && (
                                                <span className="badge badge-success badge-outline badge-sm">Salary</span>
                                            )}
                                            {factors.location_compatible && (
                                                <span className="badge badge-success badge-outline badge-sm">Location</span>
                                            )}
                                            {factors.job_level_match && (
                                                <span className="badge badge-success badge-outline badge-sm">Level</span>
                                            )}
                                            {!factors.salary_overlap && (
                                                <span className="badge badge-error badge-outline badge-sm">Salary</span>
                                            )}
                                            {!factors.location_compatible && (
                                                <span className="badge badge-error badge-outline badge-sm">Location</span>
                                            )}
                                        </div>
                                    </div>
                                    <MatchScoreBadge score={match.match_score} size="sm" />
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
