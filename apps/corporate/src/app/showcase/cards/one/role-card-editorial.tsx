"use client";

import { BaselBadge } from "@splits-network/basel-ui";
import type { RoleCardData } from "./data";

const urgencyConfig: Record<string, { color: string; dotColor: string; label: string }> = {
    low: { color: "text-base-content/30", dotColor: "bg-base-content/30", label: "Low" },
    normal: { color: "text-info", dotColor: "bg-info", label: "Normal" },
    high: { color: "text-warning", dotColor: "bg-warning", label: "Urgent" },
    urgent: { color: "text-error", dotColor: "bg-error", label: "Critical" },
};

function daysSincePosted(postedDate: string): number {
    const posted = new Date(postedDate);
    const now = new Date();
    return Math.max(0, Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24)));
}

function formatPostedDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function RoleCardEditorial({ role }: { role: RoleCardData }) {
    const urgency = urgencyConfig[role.urgency] ?? urgencyConfig.normal;
    const daysPosted = daysSincePosted(role.postedDate);

    const stats = [
        {
            label: "Salary",
            value: role.salary,
            icon: "fa-duotone fa-regular fa-dollar-sign",
        },
        {
            label: "Split Fee",
            value: role.splitFee,
            icon: "fa-duotone fa-regular fa-handshake",
        },
        {
            label: "Applicants",
            value: String(role.applicantCount),
            icon: "fa-duotone fa-regular fa-users",
        },
        {
            label: "Time",
            value: `${daysPosted}d`,
            icon: "fa-duotone fa-regular fa-clock",
        },
    ];

    return (
        <article className="bg-base-100 border border-base-300 border-l-4 border-l-primary w-full max-w-md">
            {/* Header Band */}
            <div className="bg-base-300 border-b border-base-300 px-6 pt-6 pb-5">
                {/* Kicker row: industry + urgency */}
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/40">
                        {role.industry}
                    </p>
                    <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                        <span className={`inline-block w-2 h-2 ${urgency.dotColor}`} />
                        <span className={urgency.color}>
                            {urgency.label}
                        </span>
                    </span>
                </div>

                {/* Avatar + Title block */}
                <div className="flex items-end gap-4">
                    <div className="relative shrink-0">
                        <div className="w-16 h-16 bg-primary text-primary-content flex items-center justify-center text-xl font-black tracking-tight select-none">
                            {role.companyInitials}
                        </div>
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-0.5">
                            Role
                        </p>
                        <h2 className="text-3xl font-black tracking-tight leading-none text-base-content truncate">
                            {role.title}
                        </h2>
                    </div>
                </div>

                {/* Location + posted date */}
                <div className="flex items-center gap-4 mt-3 text-sm text-base-content/40">
                    <span className="flex items-center gap-1.5">
                        <i className="fa-duotone fa-regular fa-location-dot text-xs" />
                        {role.location}
                    </span>
                    <span className="text-base-content/20">|</span>
                    <span className="flex items-center gap-1.5">
                        <i className="fa-duotone fa-regular fa-calendar text-xs" />
                        Posted {formatPostedDate(role.postedDate)}
                    </span>
                </div>
            </div>

            {/* Description */}
            <div className="px-6 py-5 border-b border-base-300">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-2">
                    About
                </p>
                <p className="text-sm text-base-content/70 leading-relaxed line-clamp-2">
                    {role.description}
                </p>
            </div>

            {/* Stats Row */}
            <div className="border-b border-base-300">
                <div className="grid grid-cols-4 divide-x divide-base-300">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="flex flex-col items-center justify-center px-1.5 py-4 gap-1 text-center min-w-0 overflow-hidden"
                        >
                            <i
                                className={`${stat.icon} text-primary text-sm`}
                            />
                            <span className="text-base font-black text-base-content leading-none truncate w-full">
                                {stat.value}
                            </span>
                            <span className="text-xs font-semibold uppercase tracking-wide text-base-content/30 leading-none truncate w-full">
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Skills Tags */}
            <div className="px-6 py-5 border-b border-base-300">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-3">
                    Skills
                </p>
                <div className="flex flex-wrap gap-1.5">
                    {role.tags.map((tag) => (
                        <BaselBadge key={tag} variant="outline" size="sm">
                            {tag}
                        </BaselBadge>
                    ))}
                </div>
            </div>

            {/* Bottom Badges */}
            <div className="px-6 py-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-base-content/30 mb-3">
                    Details
                </p>
                <div className="flex flex-wrap gap-2">
                    <BaselBadge color="primary" icon="fa-briefcase">
                        {role.employmentType}
                    </BaselBadge>
                    <BaselBadge color="secondary" icon="fa-layer-group">
                        {role.experienceLevel}
                    </BaselBadge>
                </div>
            </div>
        </article>
    );
}
