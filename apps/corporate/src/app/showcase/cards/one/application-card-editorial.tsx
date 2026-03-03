"use client";

import { BaselBadge, type BaselSemanticColor } from "@splits-network/basel-ui";
import type { ApplicationCardData } from "./data";

const STATUS_COLORS: Record<ApplicationCardData["status"], BaselSemanticColor> =
    {
        Submitted: "info",
        Screening: "warning",
        Interview: "accent",
        Offer: "success",
        Placed: "success",
        Rejected: "error",
    };

function matchScoreColor(score: number): string {
    if (score >= 90) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-error";
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function daysSince(dateStr: string): string {
    const now = new Date();
    const then = new Date(dateStr);
    const days = Math.floor(
        (now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    return `${days}d ago`;
}

export function ApplicationCardEditorial({
    application,
}: {
    application: ApplicationCardData;
}) {
    const statusColor = STATUS_COLORS[application.status];

    return (
        <article className="bg-base-100 border border-base-300 border-l-4 border-l-primary w-full max-w-md">
            {/* Header Band */}
            <div className="bg-base-300 border-b border-base-300 px-6 pt-6 pb-5">
                {/* Kicker row: company + status badge */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/40">
                        {application.company}
                    </p>
                    <BaselBadge color={statusColor} size="sm">
                        {application.status}
                    </BaselBadge>
                </div>

                {/* Avatar + Name block */}
                <div className="flex items-end gap-4">
                    <div className="relative shrink-0">
                        <div className="w-16 h-16 bg-primary text-primary-content flex items-center justify-center text-xl font-black tracking-tight select-none">
                            {application.candidateInitials}
                        </div>
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-0.5">
                            {application.roleTitle}
                        </p>
                        <h2 className="text-3xl font-black tracking-tight leading-none text-base-content truncate">
                            {application.candidateName}
                        </h2>
                    </div>
                </div>

                {/* Submitted by + date */}
                <div className="flex items-center gap-4 mt-3 text-sm text-base-content/40">
                    <span className="flex items-center gap-1.5">
                        <i className="fa-duotone fa-regular fa-user-tie text-xs" />
                        {application.submittedBy}
                    </span>
                    <span className="text-base-content/20">|</span>
                    <span className="flex items-center gap-1.5">
                        <i className="fa-duotone fa-regular fa-calendar text-xs" />
                        {formatDate(application.submittedDate)}
                    </span>
                </div>
            </div>

            {/* Progress Section */}
            <div className="px-6 py-5 border-b border-base-300">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30">
                        Pipeline Progress
                    </p>
                    <span className="text-sm font-bold text-base-content/60">
                        Stage {application.stage}{" "}
                        <span className="text-base-content/30">
                            / {application.totalStages}
                        </span>
                    </span>
                </div>
                <div className="flex gap-1.5">
                    {Array.from({ length: application.totalStages }).map(
                        (_, i) => (
                            <div
                                key={i}
                                className={`h-2 flex-1 ${
                                    i < application.stage
                                        ? "bg-primary"
                                        : "bg-base-300"
                                }`}
                            />
                        ),
                    )}
                </div>
            </div>

            {/* Stats Row */}
            <div className="border-b border-base-300">
                <div className="grid grid-cols-3 divide-x divide-base-300">
                    {/* Match Score */}
                    <div className="flex flex-col items-center justify-center px-1.5 py-4 gap-1 text-center min-w-0 overflow-hidden">
                        <i
                            className={`fa-duotone fa-regular fa-bullseye text-sm ${matchScoreColor(application.matchScore)}`}
                        />
                        <span
                            className={`text-base font-black leading-none truncate w-full ${matchScoreColor(application.matchScore)}`}
                        >
                            {application.matchScore}%
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wide text-base-content/30 leading-none">
                            Match
                        </span>
                    </div>

                    {/* Split Agreed */}
                    <div className="flex flex-col items-center justify-center px-1.5 py-4 gap-1 text-center min-w-0 overflow-hidden">
                        <i className="fa-duotone fa-regular fa-handshake text-sm text-primary" />
                        <span className="text-base font-black text-base-content leading-none truncate w-full">
                            {application.splitAgreed}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wide text-base-content/30 leading-none">
                            Split
                        </span>
                    </div>

                    {/* Last Activity */}
                    <div className="flex flex-col items-center justify-center px-1.5 py-4 gap-1 text-center min-w-0 overflow-hidden">
                        <i className="fa-duotone fa-regular fa-clock text-sm text-primary" />
                        <span className="text-base font-black text-base-content leading-none truncate w-full">
                            {daysSince(application.lastActivity)}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-wide text-base-content/30 leading-none">
                            Activity
                        </span>
                    </div>
                </div>
            </div>

            {/* Notes */}
            {application.notes && (
                <div className="px-6 py-5 border-b border-base-300">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
                        Notes
                    </p>
                    <p className="text-sm text-base-content/70 leading-relaxed line-clamp-2">
                        {application.notes}
                    </p>
                </div>
            )}

            {/* Bottom: Submitted by badge */}
            <div className="px-6 py-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-3">
                    Submitted By
                </p>
                <BaselBadge color="primary" icon="fa-user-tie">
                    {application.submittedBy}
                </BaselBadge>
            </div>
        </article>
    );
}
