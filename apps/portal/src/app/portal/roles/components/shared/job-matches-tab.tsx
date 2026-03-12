"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { startChatConversation, sendChatMessage } from "@/lib/chat-start";
import { UpgradePrompt } from "@/components/entitlements/upgrade-prompt";
import { useUserProfile } from "@/contexts/user-profile-context";
import { MatchCard } from "./match-card";
import { useMatchActions } from "../../hooks/use-match-actions";
import type { EnrichedMatch } from "@splits-network/shared-types";
import type { Job } from "../../types";

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

function buildInviteMessage(match: EnrichedMatch, job: Job): string {
    const factors = match.match_factors;
    const factorLines = [
        factors.salary_overlap ? "Salary: Match" : "Salary: Mismatch",
        factors.location_compatible
            ? "Location: Compatible"
            : "Location: Incompatible",
        factors.job_level_match ? "Level: Match" : "Level: Mismatch",
        `Skills: ${factors.skills_match_pct}% match`,
    ];
    return [
        `Hi, we're interested in ${match.candidate?.full_name || "your candidate"} for the ${job.title} role (Match Score: ${Math.round(match.match_score)}%).`,
        "",
        "Key match factors:",
        ...factorLines.map((f) => `- ${f}`),
        "",
        "Please review and submit the candidate if appropriate.",
    ].join("\n");
}

/* ─── Component ────────────────────────────────────────────────────────────── */

export function JobMatchesTab({
    job,
    isRecruiter,
}: {
    job: Job;
    isRecruiter: boolean;
}) {
    const { getToken } = useAuth();
    const { hasEntitlement } = useUserProfile();
    const { inviteCandidate, dismissMatch } = useMatchActions();
    const [matches, setMatches] = useState<EnrichedMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [invitingId, setInvitingId] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const token = await getToken();
                if (!token || cancelled) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get<{ data: EnrichedMatch[] }>(
                    "/matches",
                    {
                        params: {
                            job_id: job.id,
                            status: "active",
                            sort_by: "match_score",
                            sort_order: "desc",
                            limit: 20,
                        },
                    },
                );
                if (!cancelled)
                    setMatches(Array.isArray(res.data) ? res.data : []);
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

    const handleInvite = useCallback(
        async (matchId: string) => {
            setInvitingId(matchId);
            try {
                const result = await inviteCandidate(matchId);
                const recruiterUserId = result?.data?.recruiter_user_id;

                // Send chat message to recruiter if candidate is represented
                if (recruiterUserId) {
                    try {
                        const match = matches.find((m) => m.id === matchId);
                        const convId = await startChatConversation(
                            getToken,
                            recruiterUserId,
                            { job_id: job.id },
                        );
                        if (match)
                            await sendChatMessage(
                                getToken,
                                convId,
                                buildInviteMessage(match, job),
                            );
                    } catch {
                        // Chat is best-effort — invite already succeeded
                    }
                }

                // Update local state
                setMatches((prev) =>
                    prev.map((m) =>
                        m.id === matchId
                            ? { ...m, invite_status: "sent" as const }
                            : m,
                    ),
                );
            } catch {
                // Could show toast error
            } finally {
                setInvitingId(null);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [matches, job],
    );

    const handleDismiss = useCallback(async (matchId: string) => {
        try {
            await dismissMatch(matchId);
            setMatches((prev) => prev.filter((m) => m.id !== matchId));
        } catch {
            // Could show toast error
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            {isRecruiter && !hasEntitlement("ai_match_scoring") && <UpgradePrompt entitlement="ai_match_scoring" variant="card" />}

            {matches.length === 0 ? (
                <div className="text-center py-12 text-base-content/40">
                    <i className="fa-duotone fa-regular fa-bullseye text-3xl mb-3 block" />
                    <p className="text-sm font-semibold">
                        No matched candidates yet
                    </p>
                </div>
            ) : (
                <>
                    <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                        Matched Candidates
                    </h3>
                    <div className="space-y-[2px] bg-base-300">
                        {matches.map((match) => (
                            <MatchCard
                                key={match.id}
                                match={match}
                                onInvite={handleInvite}
                                onDismiss={handleDismiss}
                                isInviting={invitingId === match.id}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
