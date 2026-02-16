"use client";

import { Badge, Card } from "@splits-network/memphis-ui";
import type { Job } from "../../types";
import { formatJobLevel } from "../../types";
import type { AccentClasses } from "../shared/accent";
import { accentAt, statusVariant } from "../shared/accent";
import {
    salaryDisplay,
    formatEmploymentType,
    formatStatus,
    isNew,
    companyName,
    companyInitials,
} from "../shared/helpers";
import RoleActionsToolbar from "../shared/actions-toolbar";

export function GridCard({
    job,
    accent,
    isSelected,
    onSelect,
    onRefresh,
}: {
    job: Job;
    accent: AccentClasses;
    isSelected: boolean;
    onSelect: () => void;
    onRefresh?: () => void;
}) {
    const ac = accent;

    return (
        <Card
            onClick={onSelect}
            className={`cursor-pointer border-4 transition-transform hover:-translate-y-1 relative ${isSelected ? ac.border : "border-dark/30"}`}
        >
            {/* Corner accent */}
            <div
                className={`absolute top-0 right-0 w-8 h-8 ${ac.bg}`}
            />

            <div className="card-body">
                {isNew(job) && (
                    <Badge
                        variant="yellow"
                        className="mb-2"
                    >
                        <i className="fa-duotone fa-regular fa-sparkles mr-1" />
                        New
                    </Badge>
                )}
                <h3 className="font-black text-base uppercase tracking-tight leading-tight mb-1 text-dark">
                    {job.title}
                </h3>
                <div
                    className={`text-sm font-bold mb-2 ${ac.text}`}
                >
                    {companyName(job)}
                </div>

                {job.location && (
                    <div className="flex items-center gap-1 text-sm mb-3 text-dark/60">
                        <i className="fa-duotone fa-regular fa-location-dot" />
                        {job.location}
                    </div>
                )}

                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-black text-dark">
                        {salaryDisplay(job) ||
                            "Competitive"}
                    </span>
                    <Badge
                        variant={statusVariant(job.status)}
                    >
                        {formatStatus(job.status)}
                    </Badge>
                </div>

                {/* Fee + Apps row */}
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-bold text-purple">
                        <i className="fa-duotone fa-regular fa-percent mr-1" />
                        {job.fee_percentage}% fee
                    </span>
                    <span className="text-sm font-bold text-dark/60">
                        <i className="fa-duotone fa-regular fa-users mr-1" />
                        {job.application_count ?? 0} apps
                    </span>
                </div>

                <div className="flex flex-wrap gap-1">
                    {job.employment_type && (
                        <Badge
                            variant={
                                accentAt(0) === ac
                                    ? "teal"
                                    : "coral"
                            }
                            style="outline"
                        >
                            {formatEmploymentType(
                                job.employment_type,
                            )}
                        </Badge>
                    )}
                    {job.job_level && (
                        <Badge
                            variant="purple"
                            style="outline"
                        >
                            {formatJobLevel(job.job_level)}
                        </Badge>
                    )}
                </div>
            </div>
            <div
                className={`card-actions justify-between gap-3 pt-3 border-t-2 ${ac.border}/30`}
            >
                {/* Company footer */}
                <div className="flex flex-row items-center gap-2 mt-2 min-w-0">
                    {job.company?.logo_url ? (
                        <img
                            src={job.company.logo_url}
                            alt={companyName(job)}
                            className={`w-10 h-10 shrink-0 object-contain bg-cream border-2 ${ac.border} p-1`}
                        />
                    ) : (
                        <div
                            className={`w-10 h-10 shrink-0 flex items-center justify-center border-2 ${ac.border} bg-cream text-sm font-bold text-dark`}
                        >
                            {companyInitials(
                                companyName(job),
                            )}
                        </div>
                    )}
                    <div className="min-w-0">
                        <div className="text-sm font-bold text-dark truncate">
                            {companyName(job)}
                        </div>
                        {job.company?.industry && (
                            <div className="text-sm text-dark/50 truncate">
                                {job.company.industry}
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-2 shrink-0">
                    <RoleActionsToolbar
                        job={job}
                        variant="icon-only"
                        size="sm"
                        onRefresh={onRefresh}
                        showActions={{
                            viewDetails: false,
                            statusActions: true,
                            share: false,
                        }}
                    />
                </div>
            </div>
        </Card>
    );
}
