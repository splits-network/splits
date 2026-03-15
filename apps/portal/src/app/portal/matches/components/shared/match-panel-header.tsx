"use client";

import type { EnrichedMatch } from "../../types";
import {
    candidateDisplayName,
    candidateInitials,
    jobDisplayTitle,
    companyDisplayName,
    formatMatchStatus,
    matchStatusBadgeColor,
    tierBadgeColor,
    tierLabel,
    timeAgoMatch,
} from "../../types";
import { MatchScoreBadge } from "@/components/matches/match-score-badge";
import { BaselBadge } from "@splits-network/basel-ui";

interface MatchPanelHeaderProps {
    match: EnrichedMatch;
    isPartner: boolean;
    onClose?: () => void;
    onDismiss?: (id: string) => void;
    dismissing?: boolean;
}

const ICON_STYLES = [
    "bg-primary text-primary-content",
    "bg-secondary text-secondary-content",
    "bg-accent text-accent-content",
    "bg-warning text-warning-content",
];

export function MatchPanelHeader({
    match,
    isPartner,
    onClose,
    onDismiss,
    dismissing,
}: MatchPanelHeaderProps) {
    const stats = [
        {
            label: "Overall",
            value: String(match.match_score),
            icon: "fa-duotone fa-regular fa-bullseye",
        },
        {
            label: "Rules",
            value: String(match.rule_score),
            icon: "fa-duotone fa-regular fa-list-check",
        },
        {
            label: "Skills",
            value: String(match.skills_score),
            icon: "fa-duotone fa-regular fa-code",
        },
        ...(isPartner && match.ai_score !== null
            ? [
                  {
                      label: "AI",
                      value: String(match.ai_score),
                      icon: "fa-duotone fa-regular fa-brain",
                  },
              ]
            : []),
    ];

    return (
        <header className="relative bg-base-300 text-base-content border-l-4 border-l-primary">
            {/* Diagonal accent */}
            <div
                className="absolute top-0 right-0 w-2/5 h-full bg-primary/10"
                style={{ clipPath: "polygon(15% 0,100% 0,100% 100%,0% 100%)" }}
            />

            <div className="relative px-6 pt-6 pb-0">
                {/* Kicker row */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/40 truncate">
                        {companyDisplayName(match)}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                        <MatchScoreBadge score={match.match_score} size="sm" />
                        <BaselBadge
                            color={tierBadgeColor(match.match_tier)}
                            size="xs"
                            variant="soft"
                        >
                            {tierLabel(match.match_tier)}
                        </BaselBadge>
                        <BaselBadge
                            color={matchStatusBadgeColor(match.status)}
                            size="xs"
                            variant="soft"
                        >
                            {formatMatchStatus(match.status)}
                        </BaselBadge>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="btn btn-sm btn-square btn-primary"
                            >
                                <i className="fa-duotone fa-regular fa-xmark text-lg" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Avatar + Identity */}
                <div className="flex items-end gap-5">
                    <div className="w-20 h-20 bg-primary text-primary-content flex items-center justify-center text-2xl font-black tracking-tight select-none shrink-0 border-2 border-primary">
                        {candidateInitials(match)}
                    </div>
                    <div className="min-w-0 pb-1">
                        <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary mb-1 truncate">
                            {jobDisplayTitle(match)}
                        </p>
                        <h2 className="text-3xl font-black tracking-tight leading-none text-base-content mb-2 truncate">
                            {candidateDisplayName(match)}
                        </h2>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-base-content/40">
                            <span className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-building text-xs" />
                                {companyDisplayName(match)}
                            </span>
                            {match.job?.location && (
                                <span className="flex items-center gap-1.5">
                                    <i className="fa-duotone fa-regular fa-location-dot text-xs" />
                                    {match.job.location}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-calendar text-xs" />
                                {timeAgoMatch(match.generated_at)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                {match.status === "active" && onDismiss && (
                    <div className="mt-5 flex items-center gap-2">
                        <button
                            onClick={() => onDismiss(match.id)}
                            disabled={dismissing}
                            className="btn btn-error btn-sm"
                        >
                            {dismissing ? (
                                <span className="loading loading-spinner loading-sm" />
                            ) : (
                                <i className="fa-duotone fa-regular fa-xmark" />
                            )}
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Stats strip */}
                <div
                    className="grid divide-x divide-neutral-content/10 border-t border-neutral-content/10 mt-6"
                    style={{
                        gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
                    }}
                >
                    {stats.map((stat, i) => (
                        <div
                            key={stat.label}
                            className="flex items-center gap-2.5 px-3 py-4"
                        >
                            <div
                                className={`w-9 h-9 flex items-center justify-center shrink-0 ${ICON_STYLES[i % ICON_STYLES.length]}`}
                            >
                                <i className={`${stat.icon} text-sm`} />
                            </div>
                            <div>
                                <span className="text-lg font-black text-base-content leading-none block">
                                    {stat.value}
                                </span>
                                <span className="text-xs font-bold uppercase tracking-[0.16em] text-base-content/40 leading-none">
                                    {stat.label}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </header>
    );
}
