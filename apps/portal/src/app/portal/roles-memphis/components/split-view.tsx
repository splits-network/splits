"use client";

import { Badge } from "@splits-network/memphis-ui";
import type { Job } from "../../roles/types";
import { ACCENT, accentAt, statusVariant } from "./accent";
import {
    salaryDisplay,
    formatStatus,
    isNew,
    postedAgo,
    companyName,
} from "./helpers";
import { DetailLoader } from "./job-detail";

export function SplitView({
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
        <div className="flex gap-0 border-4 border-dark" style={{ minHeight: 600 }}>
            {/* Left list */}
            <div
                className="w-2/5 overflow-y-auto border-r-4 border-dark"
                style={{ maxHeight: "calc(100vh - 16rem)" }}
            >
                {jobs.map((job, idx) => {
                    const ac = accentAt(idx);
                    const isSelected = selectedId === job.id;
                    return (
                        <div
                            key={job.id}
                            onClick={() => onSelect(job)}
                            className={`cursor-pointer p-4 transition-colors border-b-2 border-dark/10 border-l-4 ${
                                isSelected
                                    ? `${ac.bgLight} ${ac.border}`
                                    : "bg-white border-transparent"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="flex items-center gap-2 min-w-0">
                                    {isNew(job) && (
                                        <i className="fa-duotone fa-regular fa-sparkles text-[10px] flex-shrink-0 text-yellow" />
                                    )}
                                    <h4 className="font-black text-sm uppercase tracking-tight truncate text-dark">
                                        {job.title}
                                    </h4>
                                </div>
                                <span className="text-[10px] font-bold flex-shrink-0 whitespace-nowrap text-dark/40">
                                    {postedAgo(job)}
                                </span>
                            </div>
                            <div className={`text-xs font-bold mb-1 ${ac.text}`}>
                                {companyName(job)}
                            </div>
                            <div className="flex items-center justify-between">
                                {job.location && (
                                    <span className="text-[11px] text-dark/50">
                                        <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                                        {job.location}
                                    </span>
                                )}
                                <Badge variant={statusVariant(job.status)} className="text-[9px]">
                                    {formatStatus(job.status)}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs font-bold text-dark/70">
                                    {salaryDisplay(job) || "Competitive"}
                                </span>
                                <span className="text-[10px] font-bold text-purple">
                                    {job.fee_percentage}%
                                </span>
                                <span className="text-[10px] text-dark/40">
                                    {job.application_count ?? 0} apps
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Right detail */}
            <div className="w-3/5 overflow-hidden bg-white">
                {selectedJob ? (
                    <DetailLoader jobId={selectedJob.id} accent={selectedAc} onClose={() => onSelect(selectedJob)} onRefresh={onRefresh} />
                ) : (
                    <div className="h-full flex items-center justify-center p-12">
                        <div className="text-center">
                            <div className="flex justify-center gap-3 mb-6">
                                <div className="w-8 h-8 rotate-12 bg-coral" />
                                <div className="w-8 h-8 rounded-full bg-teal" />
                                <div className="w-8 h-8 rotate-45 bg-yellow" />
                            </div>
                            <h3 className="font-black text-xl uppercase tracking-tight mb-2 text-dark">
                                Select a Role
                            </h3>
                            <p className="text-sm text-dark/50">
                                Click a listing on the left to view details
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
