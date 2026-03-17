"use client";

import Link from "next/link";
import {
    BaselSectionHeading,
    BaselSidebarCard,
    BaselStatusPill,
} from "@splits-network/basel-ui";
import { ChartLoadingState } from "@splits-network/shared-ui";
import type { RoleBreakdown } from "@/app/portal/dashboard/hooks/use-role-breakdown";
import type { CompanyActivity } from "@/app/portal/dashboard/hooks/use-company-activity";

interface CompanyOperationsProps {
    roles: RoleBreakdown[];
    rolesLoading: boolean;
    activities: CompanyActivity[];
    activityLoading: boolean;
}

const STATUS_COLORS: Record<string, "success" | "warning" | "error" | "info"> =
    {
        active: "success",
        closed: "error",
        expired: "warning",
        draft: "info",
    };

const STAGE_ICONS: Record<
    string,
    { icon: string; color: string; bg: string }
> = {
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

export function CompanyOperations({
    roles,
    rolesLoading,
    activities,
    activityLoading,
}: CompanyOperationsProps) {
    return (
        <section className="bg-base-200 py-4 lg:py-6 px-4 lg:px-6">
            <BaselSectionHeading
                kicker="OPERATIONS"
                title="Role Status"
                className="section-heading mb-4"
            />
            <div className="grid lg:grid-cols-5 gap-4">
                {/* Roles table */}
                <div className="lg:col-span-3 bg-base-100 p-4 overflow-x-auto">
                    {rolesLoading ? (
                        <ChartLoadingState height={300} />
                    ) : roles.length === 0 ? (
                        <p className="text-sm text-base-content/40 py-8 text-center">
                            No active roles. Post a role to start receiving
                            candidates.
                        </p>
                    ) : (
                        <table className="table table-sm w-full">
                            <thead>
                                <tr>
                                    <th className="text-sm font-black uppercase tracking-wider text-base-content/50">
                                        Role
                                    </th>
                                    <th className="text-sm font-black uppercase tracking-wider text-base-content/50 hidden md:table-cell">
                                        Location
                                    </th>
                                    <th className="text-sm font-black uppercase tracking-wider text-base-content/50 text-right">
                                        Days
                                    </th>
                                    <th className="text-sm font-black uppercase tracking-wider text-base-content/50 text-right">
                                        Pipeline
                                    </th>
                                    <th className="text-sm font-black uppercase tracking-wider text-base-content/50">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {roles
                                    .slice(0, 10)
                                    .map((role: RoleBreakdown) => (
                                        <tr key={role.id} className="hover">
                                            <td>
                                                <Link
                                                    href={`/portal/roles?roleId=${role.id}`}
                                                    className="text-sm font-semibold hover:text-primary transition-colors"
                                                >
                                                    {role.title}
                                                </Link>
                                            </td>
                                            <td className="text-sm text-base-content/50 hidden md:table-cell">
                                                {role.location}
                                            </td>
                                            <td className="text-right">
                                                <DaysOpenBadge
                                                    days={role.days_open}
                                                />
                                            </td>
                                            <td className="text-right">
                                                <PipelineMiniBar
                                                    role={role}
                                                />
                                            </td>
                                            <td>
                                                <BaselStatusPill
                                                    color={
                                                        STATUS_COLORS[
                                                            role.status
                                                        ] || "info"
                                                    }
                                                >
                                                    {role.status}
                                                </BaselStatusPill>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Recent Activity sidebar */}
                <div className="lg:col-span-2">
                    <BaselSidebarCard
                        title="Latest Updates"
                        accentColor="accent"
                    >
                        {activityLoading ? (
                            <ChartLoadingState height={200} />
                        ) : activities.length === 0 ? (
                            <p className="text-sm text-base-content/40 py-4 text-center">
                                No activity yet. Updates appear as candidates
                                move through your pipeline.
                            </p>
                        ) : (
                            <div>
                                {activities
                                    .slice(0, 6)
                                    .map(
                                        (
                                            activity: CompanyActivity,
                                            i: number,
                                        ) => {
                                            const style =
                                                STAGE_ICONS[activity.stage] ||
                                                DEFAULT_STAGE;
                                            return (
                                                <Link
                                                    key={activity.id || i}
                                                    href={`/portal/applications?applicationId=${activity.id}`}
                                                    className="block"
                                                >
                                                    <div className="flex items-center gap-3 py-3 border-b border-base-300 hover:bg-base-300/50 transition-colors">
                                                        <div
                                                            className={`w-8 h-8 ${style.bg} flex items-center justify-center flex-shrink-0`}
                                                        >
                                                            <i
                                                                className={`${style.icon} ${style.color} text-sm`}
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold truncate">
                                                                {activity
                                                                    .candidate
                                                                    ?.full_name ||
                                                                    "Candidate"}
                                                            </p>
                                                            <p className="text-sm text-base-content/40">
                                                                {activity.job
                                                                    ?.title ||
                                                                    "Role"}{" "}
                                                                --{" "}
                                                                {activity.stage?.replace(
                                                                    "_",
                                                                    " ",
                                                                )}{" "}
                                                                --{" "}
                                                                {timeAgo(
                                                                    activity.updated_at,
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        },
                                    )}
                            </div>
                        )}
                    </BaselSidebarCard>
                </div>
            </div>
        </section>
    );
}

/** Visual urgency indicator for how long a role has been open */
function DaysOpenBadge({ days }: { days: number }) {
    let colorClass: string;
    if (days > 60) colorClass = "badge-error";
    else if (days > 30) colorClass = "badge-warning";
    else colorClass = "badge-ghost";

    return (
        <span className={`badge badge-sm ${colorClass} tabular-nums`}>
            {days}d
        </span>
    );
}

/** Tiny inline pipeline progress showing submission → interview → offer → hire */
function PipelineMiniBar({ role }: { role: RoleBreakdown }) {
    const total = role.applications_count || 1;
    const segments = [
        {
            count: role.applications_count - role.interview_count,
            color: "bg-primary/40",
            label: "Applied",
        },
        {
            count: role.interview_count - role.offer_count,
            color: "bg-accent/60",
            label: "Interview",
        },
        {
            count: role.offer_count - role.hire_count,
            color: "bg-warning/60",
            label: "Offer",
        },
        { count: role.hire_count, color: "bg-success", label: "Hired" },
    ];

    return (
        <div className="flex items-center gap-1.5">
            <div className="flex h-2 w-16 overflow-hidden bg-base-300">
                {segments.map(
                    (seg) =>
                        seg.count > 0 && (
                            <div
                                key={seg.label}
                                className={seg.color}
                                style={{
                                    width: `${(seg.count / total) * 100}%`,
                                }}
                                title={`${seg.label}: ${seg.count}`}
                            />
                        ),
                )}
            </div>
            <span className="text-sm tabular-nums font-semibold">
                {role.applications_count}
            </span>
        </div>
    );
}
