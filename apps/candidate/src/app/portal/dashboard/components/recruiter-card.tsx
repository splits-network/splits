"use client";

import Link from "next/link";
import type { PendingInvitation } from "../hooks/use-candidate-dashboard-data";
import type { PresenceEntry, ActiveRecruiterItem } from "./recruiter-card-sections";
import { PendingSection, ActiveSection, EmptyState } from "./recruiter-card-sections";

/* ── Types ── */

interface RecruiterCardProps {
    activeRecruiters: ActiveRecruiterItem[];
    pendingInvitations: PendingInvitation[];
    presence: Record<string, PresenceEntry>;
    loading: boolean;
}

/* ── Component ── */

export function RecruiterCard({ activeRecruiters, pendingInvitations, presence, loading }: RecruiterCardProps) {
    const activeCount = activeRecruiters.length;
    const pendingCount = pendingInvitations.length;
    const totalCount = activeCount + pendingCount;

    return (
        <div className="h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-base-content">
                    My Recruiter
                </h3>
                {totalCount > 1 && (
                    <Link
                        href="/portal/recruiters"
                        className="btn btn-ghost btn-sm text-primary"
                        style={{ borderRadius: 0 }}
                    >
                        View all ({totalCount})
                        <i className="fa-duotone fa-regular fa-arrow-right" />
                    </Link>
                )}
            </div>

            {loading ? (
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-base-content/10 animate-pulse" />
                        <div className="flex-1 space-y-1.5">
                            <div className="h-4 bg-base-content/10 animate-pulse w-36" />
                            <div className="h-3 bg-base-content/5 animate-pulse w-24" />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Pending invitations */}
                    {pendingCount > 0 && (
                        <PendingSection invitations={pendingInvitations} />
                    )}

                    {/* Divider between pending and active */}
                    {pendingCount > 0 && activeCount > 0 && (
                        <div className="border-t border-base-content/10" />
                    )}

                    {/* Active recruiters */}
                    {activeCount > 0 && (
                        <ActiveSection
                            recruiters={activeRecruiters}
                            presence={presence}
                        />
                    )}

                    {/* Empty state: no pending, no active */}
                    {pendingCount === 0 && activeCount === 0 && <EmptyState />}

                    {/* Soft marketplace link when pending only */}
                    {pendingCount > 0 && activeCount === 0 && (
                        <div className="border-t border-base-content/10 pt-4">
                            <p className="text-sm text-base-content/60 text-center">
                                Looking for more options?
                            </p>
                            <Link
                                href="/marketplace"
                                className="btn btn-ghost btn-sm w-full mt-2"
                                style={{ borderRadius: 0 }}
                            >
                                <i className="fa-duotone fa-regular fa-search" />
                                Browse Marketplace
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
