"use client";

import Link from "next/link";
import {
    BaselSectionHeading,
    BaselActivityItem,
    BaselSidebarCard,
} from "@splits-network/basel-ui";
import { ChartLoadingState } from "@splits-network/shared-ui";
import { MatchScoreBadge } from "@/components/matches/match-score-badge";
import type { PipelineApplication } from "@/app/portal/dashboard/hooks/use-pipeline-activity";
import type { EnrichedMatch } from "@splits-network/shared-types";

interface RecruiterActivityFeedProps {
    applications: PipelineApplication[];
    pipelineLoading: boolean;
    roles: {
        id: string;
        title: string;
        company?: { name: string };
        location?: string;
        candidate_count?: number;
    }[];
    rolesLoading: boolean;
    matches: EnrichedMatch[];
    matchesLoading: boolean;
}

const STAGE_ICONS: Record<string, { icon: string; color: string; bg: string }> =
    {
        submitted: {
            icon: "fa-duotone fa-regular fa-paper-plane",
            color: "text-primary",
            bg: "bg-primary/10",
        },
        screen: {
            icon: "fa-duotone fa-regular fa-eye",
            color: "text-info",
            bg: "bg-info/10",
        },
        interview: {
            icon: "fa-duotone fa-regular fa-comments",
            color: "text-accent",
            bg: "bg-accent/10",
        },
        offer: {
            icon: "fa-duotone fa-regular fa-handshake",
            color: "text-warning",
            bg: "bg-warning/10",
        },
        hired: {
            icon: "fa-duotone fa-regular fa-trophy",
            color: "text-success",
            bg: "bg-success/10",
        },
        company_review: {
            icon: "fa-duotone fa-regular fa-building",
            color: "text-secondary",
            bg: "bg-secondary/10",
        },
    };

const DEFAULT_STAGE = {
    icon: "fa-duotone fa-regular fa-circle",
    color: "text-primary",
    bg: "bg-primary/10",
};

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

export function RecruiterActivityFeed({
    applications,
    pipelineLoading,
    roles,
    rolesLoading,
    matches,
    matchesLoading,
}: RecruiterActivityFeedProps) {
    return (
        <section className="bg-base-200 py-4 lg:py-6 px-4 lg:px-6">
            <BaselSectionHeading
                kicker="LIVE FEED"
                title="Pipeline Activity"
                className="section-heading mb-4"
            />
            <div className="grid lg:grid-cols-5 gap-4">
                {/* Pipeline activity feed */}
                <div className="lg:col-span-3 bg-base-100 p-4">
                    {pipelineLoading ? (
                        <ChartLoadingState height={300} />
                    ) : applications.length === 0 ? (
                        <p className="text-sm text-base-content/40 py-8 text-center">
                            No pipeline activity yet. Submit a candidate to a
                            role to begin tracking.
                        </p>
                    ) : (
                        <div>
                            {applications
                                .slice(0, 8)
                                .map((app: PipelineApplication, i: number) => {
                                    const style =
                                        STAGE_ICONS[app.stage] || DEFAULT_STAGE;
                                    return (
                                        <BaselActivityItem
                                            key={app.id || i}
                                            icon={style.icon}
                                            iconColor={style.color}
                                            iconBg={style.bg}
                                            title={`${app.candidate?.full_name || "Candidate"} - ${app.job?.title || "Role"}`}
                                            meta={`${app.job?.company?.name || ""} -- ${app.stage?.replace("_", " ")} -- ${timeAgo(app.updated_at)}`}
                                        />
                                    );
                                })}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-2">
                    <BaselSidebarCard
                        title="Highest Activity Roles"
                        accentColor="primary"
                    >
                        {rolesLoading ? (
                            <ChartLoadingState height={200} />
                        ) : roles.length === 0 ? (
                            <p className="text-sm text-base-content/40 py-4 text-center">
                                No active roles. Browse open roles to start
                                submitting candidates.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {roles.slice(0, 5).map((role, i) => (
                                    <Link
                                        key={role.id}
                                        href={`/portal/roles?roledId=${role.id}`}
                                        className="flex items-center gap-3 py-2 border-b border-base-300 last:border-0 hover:bg-base-300/50 transition-colors group"
                                    >
                                        <span className="w-6 h-6 bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                                            {i + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                                                {role.title}
                                            </p>
                                            <p className="text-xs text-base-content/40 truncate">
                                                {role.company?.name}
                                                {role.location &&
                                                    ` -- ${role.location}`}
                                            </p>
                                        </div>
                                        {(role.candidate_count ?? 0) > 0 && (
                                            <span className="px-2 py-0.5 text-sm font-bold bg-success/10 text-success">
                                                {role.candidate_count}
                                            </span>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </BaselSidebarCard>

                    <BaselSidebarCard
                        title="Top Matches"
                        accentColor="secondary"
                    >
                        {matchesLoading ? (
                            <ChartLoadingState height={200} />
                        ) : matches.length === 0 ? (
                            <p className="text-sm text-base-content/40 py-4 text-center">
                                No matches yet. Matches appear when candidates
                                are scored against roles.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {matches.map((match) => {
                                    const fullName =
                                        match.candidate?.full_name ??
                                        "Unknown";
                                    const initials =
                                        fullName
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .slice(0, 2) || "?";
                                    return (
                                        <Link
                                            key={match.id}
                                            href={`/portal/matches?matchId=${match.id}`}
                                            className="flex items-center gap-3 hover:bg-base-200/50 p-2 -mx-2 rounded transition-colors"
                                        >
                                            <div className="avatar avatar-placeholder">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
                                                    {initials.toUpperCase()}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-sm truncate">
                                                    {fullName}
                                                </p>
                                                <p className="text-sm text-base-content/60 truncate">
                                                    {match.job?.title ||
                                                        "Unknown Role"}
                                                </p>
                                            </div>
                                            <MatchScoreBadge
                                                score={match.match_score}
                                                size="sm"
                                            />
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                        <div className="mt-3 pt-3 border-t border-base-200 text-center">
                            <Link
                                href="/portal/matches"
                                className="btn btn-sm btn-ghost btn-block"
                            >
                                View all matches{" "}
                                <i className="fa-duotone fa-regular fa-arrow-right ml-1" />
                            </Link>
                        </div>
                    </BaselSidebarCard>
                </div>
            </div>
        </section>
    );
}
