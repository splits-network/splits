"use client";

import type { Job } from "../../types";
import { statusBadgeColor } from "../shared/status-color";
import { BaselBadge } from "@splits-network/basel-ui";
import { employmentBadge, commuteBadges, thirdPartyBadge } from "../shared/role-badges";
import {
    salaryDisplay,
    formatStatus,
    isNew,
    postedAgo,
    companyName,
} from "../shared/helpers";
import RoleActionsToolbar from "../shared/actions-toolbar";
import { SaveBookmark } from "@/components/save-bookmark";
import { useUserProfile } from "@/contexts/user-profile-context";

export function SplitItem({
    job,
    isSelected,
    onSelect,
    onRefresh,
    onUpdateItem,
}: {
    job: Job;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
    onUpdateItem?: (id: string, patch: Partial<Job>) => void;
}) {
    const { isRecruiter } = useUserProfile();
    const emp = employmentBadge(job.employment_type);
    const commutes = commuteBadges(job.commute_types);
    const thirdParty = thirdPartyBadge(job);

    return (
        <div
            onClick={onSelect}
            className={`relative cursor-pointer px-4 py-2.5 border-b border-base-200 hover:bg-base-200/50 transition-colors border-l-4 ${
                isSelected
                    ? "bg-primary/5 border-l-primary"
                    : "bg-base-100 border-transparent"
            }`}
        >
            {/* Row 1: title + posted time */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                    {isNew(job) && (
                        <i className="fa-duotone fa-regular fa-star text-primary text-sm flex-shrink-0" />
                    )}
                    <h4 className="font-bold text-sm tracking-tight truncate text-base-content">
                        {job.title}
                    </h4>
                    {isRecruiter && (
                        <SaveBookmark
                            entityType="job"
                            entityId={job.id}
                            isSaved={!!job.is_saved}
                            savedRecordId={job.saved_record_id ?? null}
                            size="xs"
                            onToggle={(saved, recordId) => onUpdateItem?.(job.id, { is_saved: saved, saved_record_id: recordId })}
                        />
                    )}
                </div>
                <span className="text-sm font-bold flex-shrink-0 whitespace-nowrap text-base-content/40">
                    {postedAgo(job)}
                </span>
            </div>

            {/* Row 2: company name */}
            <div className="text-xs text-base-content/60 truncate mt-0.5">
                {companyName(job)}
            </div>

            {/* Row 3: salary + fee % + apps */}
            <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-bold text-base-content/60">
                    {salaryDisplay(job) || "Competitive"}
                </span>
                <span className="text-xs font-bold text-accent">
                    {job.fee_percentage}%
                </span>
                <span className="text-xs text-base-content/40">
                    {job.application_count ?? 0} apps
                </span>
            </div>

            {/* Row 4: badge bar — status, employment type, commute, 3rd party */}
            <div className="flex flex-wrap items-center gap-1 mt-1.5 pr-10">
                <BaselBadge color={statusBadgeColor(job.status)} size="xs" variant="soft">
                    {formatStatus(job.status)}
                </BaselBadge>
                {job.is_early_access && (
                    <BaselBadge color="accent" size="xs" variant="soft">
                        Early
                    </BaselBadge>
                )}
                {job.is_priority && (
                    <BaselBadge color="primary" size="xs" variant="soft">
                        Priority
                    </BaselBadge>
                )}
                {emp && (
                    <BaselBadge color={emp.color} size="xs">
                        {emp.label}
                    </BaselBadge>
                )}
                {commutes.map((c) => (
                    <BaselBadge key={c.label} color={c.color} size="xs" variant="outline">
                        {c.label}
                    </BaselBadge>
                ))}
                {thirdParty && (
                    <BaselBadge color={thirdParty.color} size="xs" variant="soft">
                        {thirdParty.label}
                    </BaselBadge>
                )}
            </div>

            {/* Actions */}
            <div className="absolute bottom-2 right-2" onClick={(e) => e.stopPropagation()}>
                <RoleActionsToolbar
                    job={job}
                    variant="icon-only"
                    size="xs"
                    showActions={{ viewDetails: false }}
                    onRefresh={onRefresh}
                />
            </div>
        </div>
    );
}
