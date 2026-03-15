"use client";

import type { Job } from "../../types";
import { formatJobLevel } from "../../types";
import { statusBadgeColor } from "./status-color";
import {
    salaryDisplay,
    formatEmploymentType,
    formatStatus,
    isNew,
    companyName,
    companyInitials,
} from "./helpers";
import { PanelHeader, type PanelHeaderBadge, type PanelStat } from "@splits-network/basel-ui";
import RoleActionsToolbar from "./actions-toolbar";
import { LevelBadge, useGamification } from "@splits-network/shared-gamification";

/* ─── Badge color → DaisyUI class mapping ────────────────────────────────── */

const BADGE_CLASS: Record<string, string> = {
    neutral: "badge-ghost",
    warning: "badge-warning badge-soft",
    accent: "badge-accent badge-soft",
    success: "badge-success badge-soft",
    primary: "badge-primary badge-soft",
    info: "badge-info badge-soft",
};

/* ─── Hero Header ────────────────────────────────────────────────────────── */

export function JobHeroHeader({
    job,
    onClose,
    onRefresh,
    onUpdateItem,
}: {
    job: Job;
    onClose?: () => void;
    onRefresh?: () => void;
    onUpdateItem?: (id: string, patch: Partial<Job>) => void;
}) {
    const { getLevel } = useGamification();
    const name = companyName(job);
    const salary = salaryDisplay(job);
    const level = formatJobLevel(job.job_level);
    const companyLevel = job.company_id ? getLevel(job.company_id) : undefined;

    /* Build header badges */
    const statusColor = statusBadgeColor(job.status);
    const badges: PanelHeaderBadge[] = [
        {
            label: formatStatus(job.status),
            className: BADGE_CLASS[statusColor] || "badge-ghost",
        },
        ...(isNew(job)
            ? [{ label: "New", className: "badge-warning badge-soft", icon: "sparkles" }]
            : []),
        ...(job.employment_type
            ? [{ label: formatEmploymentType(job.employment_type), className: "badge-ghost" }]
            : []),
        ...(level
            ? [{ label: level, className: "badge-ghost" }]
            : []),
    ];

    /* Build meta items */
    const meta = [
        { icon: "fa-duotone fa-regular fa-building", text: name },
        { icon: "fa-duotone fa-regular fa-location-dot", text: job.location || "Location not specified" },
    ];

    /* Build stats */
    const stats: PanelStat[] = [
        { label: "Compensation", value: salary || "N/A", icon: "fa-duotone fa-regular fa-sack-dollar" },
        { label: "Fee", value: `${job.fee_percentage}%`, icon: "fa-duotone fa-regular fa-percent" },
        { label: "Candidates", value: String(job.application_count ?? 0), icon: "fa-duotone fa-regular fa-users" },
    ];

    return (
        <PanelHeader
            kicker={job.department || name}
            badges={badges}
            avatar={{
                initials: companyInitials(name),
                imageUrl: job.company?.logo_url,
            }}
            avatarOverlay={
                companyLevel ? (
                    <div className="absolute -bottom-1 -right-1">
                        <LevelBadge level={companyLevel} size="sm" />
                    </div>
                ) : undefined
            }
            title={job.title}
            subtitle={name}
            meta={meta}
            stats={stats}
            actions={
                <RoleActionsToolbar
                    job={job}
                    variant="descriptive"
                    size="sm"
                    onRefresh={onRefresh}
                    onUpdateItem={onUpdateItem}
                    showActions={{ viewDetails: false }}
                />
            }
            onClose={onClose}
        />
    );
}