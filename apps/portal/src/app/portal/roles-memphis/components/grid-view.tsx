"use client";

import { Badge } from "@splits-network/memphis-ui";
import type { Job } from "../../roles/types";
import { formatJobLevel } from "../../roles/types";
import { ACCENT, accentAt, statusVariant } from "./accent";
import {
    salaryDisplay,
    formatEmploymentType,
    formatStatus,
    isNew,
    companyName,
    companyInitials,
} from "./helpers";
import { DetailLoader } from "./job-detail";
import RoleActionsToolbar from "./actions-toolbar";

export function GridView({
    jobs,
    onSelect,
    selectedId,
    onRefresh,
}: {
    jobs: Job[];
    onSelect: (j: Job) => void;
    selectedId: string | null;
    onRefresh?: () => void;
}) {
    const selectedJob = jobs.find((j) => j.id === selectedId);
    const selectedAc = selectedJob ? accentAt(jobs.indexOf(selectedJob)) : ACCENT[0];

    return (
        <div className="flex gap-6">
            <div
                className={`grid gap-4 ${
                    selectedJob
                        ? "w-1/2 grid-cols-1 lg:grid-cols-2"
                        : "w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                }`}
            >
                {jobs.map((job, idx) => {
                    const ac = accentAt(idx);
                    const isSelected = selectedId === job.id;
                    return (
                        <div
                            key={job.id}
                            onClick={() => onSelect(job)}
                            className={`cursor-pointer border-4 p-5 transition-transform hover:-translate-y-1 relative bg-white ${
                                isSelected ? ac.border : "border-dark/30"
                            }`}
                        >
                            {/* Corner accent */}
                            <div className={`absolute top-0 right-0 w-8 h-8 ${ac.bg}`} />

                            {isNew(job) && (
                                <Badge variant="yellow" className="mb-2">
                                    <i className="fa-duotone fa-regular fa-sparkles mr-1" />
                                    New
                                </Badge>
                            )}

                            <h3 className="font-black text-base uppercase tracking-tight leading-tight mb-1 text-dark">
                                {job.title}
                            </h3>
                            <div className={`text-sm font-bold mb-2 ${ac.text}`}>
                                {companyName(job)}
                            </div>

                            {job.location && (
                                <div className="flex items-center gap-1 text-xs mb-3 text-dark/60">
                                    <i className="fa-duotone fa-regular fa-location-dot" />
                                    {job.location}
                                </div>
                            )}

                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-black text-dark">
                                    {salaryDisplay(job) || "Competitive"}
                                </span>
                                <Badge variant={statusVariant(job.status)}>
                                    {formatStatus(job.status)}
                                </Badge>
                            </div>

                            {/* Fee + Apps row */}
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-xs font-bold text-purple">
                                    <i className="fa-duotone fa-regular fa-percent mr-1" />
                                    {job.fee_percentage}% fee
                                </span>
                                <span className="text-xs font-bold text-dark/60">
                                    <i className="fa-duotone fa-regular fa-users mr-1" />
                                    {job.application_count ?? 0} apps
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {job.employment_type && (
                                    <Badge variant={accentAt(0) === ac ? "teal" : "coral"} outline className="text-[10px]">
                                        {formatEmploymentType(job.employment_type)}
                                    </Badge>
                                )}
                                {job.job_level && (
                                    <Badge variant="purple" outline className="text-[10px]">
                                        {formatJobLevel(job.job_level)}
                                    </Badge>
                                )}
                            </div>

                            {/* Company footer */}
                            <div className={`flex items-center justify-between gap-3 mt-3 pt-3 border-t-2 ${ac.border}/30`}>
                                <div className="flex items-center gap-3">
                                    {job.company?.logo_url ? (
                                        <img
                                            src={job.company.logo_url}
                                            alt={companyName(job)}
                                            className={`w-7 h-7 object-cover border-2 ${ac.border}`}
                                        />
                                    ) : (
                                        <div className={`w-7 h-7 flex items-center justify-center border-2 ${ac.border} bg-cream text-[10px] font-bold text-dark`}>
                                            {companyInitials(companyName(job))}
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-xs font-bold text-dark">{companyName(job)}</div>
                                        {job.company?.industry && (
                                            <div className="text-[10px] text-dark/50">{job.company.industry}</div>
                                        )}
                                    </div>
                                </div>
                                <div onClick={(e) => e.stopPropagation()}>
                                    <RoleActionsToolbar
                                        job={job}
                                        variant="icon-only"
                                        size="xs"
                                        onRefresh={onRefresh}
                                        showActions={{
                                            viewDetails: false,
                                            statusActions: false,
                                            share: false,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Detail Sidebar */}
            {selectedJob && (
                <div
                    className={`w-1/2 border-4 flex-shrink-0 sticky top-4 self-start bg-white ${selectedAc.border}`}
                    style={{ maxHeight: "calc(100vh - 2rem)" }}
                >
                    <DetailLoader
                        jobId={selectedJob.id}
                        accent={selectedAc}
                        onClose={() => onSelect(selectedJob)}
                        onRefresh={onRefresh}
                    />
                </div>
            )}
        </div>
    );
}
