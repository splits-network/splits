"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { Button } from "@splits-network/basel-ui";
import type { RecruiterCode } from "../../../types";
import { formatDate, copyShareLink, copyCandidateShareLink } from "../helpers";
import { statusBadgeClass } from "../status-color";

interface LogEntry {
    id: string;
    user_id: string;
    signup_type?: string;
    created_at: string;
    user?: { name: string; email: string };
}

export function OverviewTab({ code }: { code: RecruiterCode }) {
    const recruiterLink = `https://splits.network?rec_code=${code.code}`;
    const candidateLink = `https://applicant.network/sign-up?rec_code=${code.code}`;

    return (
        <div className="p-6 space-y-6">
            {/* Code Display */}
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/40 mb-2">
                    Referral Code
                </p>
                <div className="flex items-center gap-3 bg-base-200 border border-base-300 px-4 py-3">
                    <span className="font-mono text-xl font-black tracking-widest flex-1">
                        {code.code}
                    </span>
                    <Button
                        icon="fa-duotone fa-regular fa-copy"
                        variant="btn-ghost btn-square"
                        size="xs"
                        onClick={() => navigator.clipboard.writeText(code.code)}
                        title="Copy code"
                    />
                </div>
            </div>

            {/* Share Links */}
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/40 mb-2">
                    Share Links
                </p>
                <div className="space-y-2">
                    <div className="flex items-center gap-3 bg-base-200 border border-base-300 px-4 py-3">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <i className="fa-duotone fa-regular fa-briefcase text-xs text-base-content/40 shrink-0" />
                            <span className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/40 shrink-0">
                                Recruiters
                            </span>
                            <span className="text-sm text-base-content/70 truncate">
                                {recruiterLink}
                            </span>
                        </div>
                        <Button
                            icon="fa-duotone fa-regular fa-copy"
                            variant="btn-ghost btn-square"
                            size="xs"
                            onClick={() => copyShareLink(code.code)}
                            title="Copy recruiter share link"
                        />
                    </div>
                    <div className="flex items-center gap-3 bg-base-200 border border-base-300 px-4 py-3">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <i className="fa-duotone fa-regular fa-user text-xs text-base-content/40 shrink-0" />
                            <span className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/40 shrink-0">
                                Candidates
                            </span>
                            <span className="text-sm text-base-content/70 truncate">
                                {candidateLink}
                            </span>
                        </div>
                        <Button
                            icon="fa-duotone fa-regular fa-copy"
                            variant="btn-ghost btn-square"
                            size="xs"
                            onClick={() => copyCandidateShareLink(code.code)}
                            title="Copy candidate share link"
                        />
                    </div>
                </div>
            </div>

            {/* Code Details Grid */}
            <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/40 mb-3">
                    Details
                </p>
                <div className="grid grid-cols-2 gap-px bg-base-300 border border-base-300">
                    <DetailCell label="Label" value={code.label || "None"} />
                    <DetailCell
                        label="Status"
                        value={
                            <div className="flex items-center gap-2">
                                <span className={`badge ${statusBadgeClass(code)}`}>
                                    {code.status}
                                </span>
                                {code.is_default && (
                                    <span className="badge badge-primary badge-sm">
                                        Default
                                    </span>
                                )}
                            </div>
                        }
                    />
                    <DetailCell
                        label="Created"
                        value={formatDate(code.created_at)}
                    />
                    <DetailCell
                        label="Expires"
                        value={
                            code.expiry_date
                                ? formatDate(code.expiry_date)
                                : "Never"
                        }
                    />
                    <DetailCell
                        label="Max Uses"
                        value={
                            code.max_uses != null
                                ? String(code.max_uses)
                                : "Unlimited"
                        }
                    />
                    <DetailCell
                        label="Remaining"
                        value={
                            code.uses_remaining != null
                                ? String(code.uses_remaining)
                                : "Unlimited"
                        }
                    />
                </div>
            </div>

            {/* Recent Signups */}
            <RecentSignups codeId={code.id} />
        </div>
    );
}

function DetailCell({
    label,
    value,
}: {
    label: string;
    value: React.ReactNode;
}) {
    return (
        <div className="bg-base-100 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-base-content/30 mb-0.5">
                {label}
            </p>
            <div className="text-sm font-semibold text-base-content">
                {value}
            </div>
        </div>
    );
}

function RecentSignups({ codeId }: { codeId: string }) {
    const { getToken } = useAuth();
    const [entries, setEntries] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLog = useCallback(
        async (signal?: { cancelled: boolean }) => {
            try {
                const token = await getToken();
                if (!token || signal?.cancelled) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get<{ data: LogEntry[] }>(
                    `/recruiter-codes/log`,
                    { params: { recruiter_code_id: codeId, limit: 10 } },
                );
                if (!signal?.cancelled) setEntries(res.data || []);
            } catch (err) {
                console.error("Failed to fetch signups:", err);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [codeId],
    );

    useEffect(() => {
        const signal = { cancelled: false };
        setLoading(true);
        fetchLog(signal).finally(() => {
            if (!signal.cancelled) setLoading(false);
        });
        return () => {
            signal.cancelled = true;
        };
    }, [fetchLog]);

    return (
        <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/40 mb-3">
                Recent Signups
            </p>
            {loading ? (
                <div className="py-6 text-center">
                    <span className="loading loading-spinner loading-sm text-primary" />
                </div>
            ) : entries.length === 0 ? (
                <p className="text-sm text-base-content/40 italic py-4">
                    No signups yet
                </p>
            ) : (
                <div className="space-y-2">
                    {entries.map((entry) => (
                        <div
                            key={entry.id}
                            className="flex items-center justify-between bg-base-200/50 border border-base-300 px-4 py-3"
                        >
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-base-content truncate">
                                    {entry.user?.name || "Unknown User"}
                                </p>
                                <p className="text-xs text-base-content/40 truncate">
                                    {entry.user?.email}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {entry.signup_type && (
                                    <span className="badge badge-outline badge-sm">
                                        {entry.signup_type}
                                    </span>
                                )}
                                <span className="text-xs text-base-content/40">
                                    {formatDate(entry.created_at)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
