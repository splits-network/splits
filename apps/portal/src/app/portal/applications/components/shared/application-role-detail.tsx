"use client";

import { useState } from "react";
import { BaselModal, BaselModalBody } from "@splits-network/basel-ui";
import { ModalPortal } from "@splits-network/shared-ui";
import { DetailLoader as JobDetailLoader } from "@/app/portal/roles/components/shared/job-detail";
import type { Job } from "@/app/portal/roles/types";
import { formatCommuteTypes } from "@/app/portal/roles/types";
import {
    salaryDisplay,
    formatEmploymentType,
    companyName,
} from "@/app/portal/roles/components/shared/helpers";

/* ─── Application Role Detail (Summary) ───────────────────────────────── */

export function ApplicationRoleDetail({ job }: { job: Job }) {
    const [showFullBrief, setShowFullBrief] = useState(false);

    const name = companyName(job);
    const salary = salaryDisplay(job);
    const commute = formatCommuteTypes(job.commute_types);

    const mandatoryReqs = (job.requirements || [])
        .filter((r) => r.requirement_type === "mandatory")
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .slice(0, 3);

    return (
        <>
            <div className="space-y-6">
                {/* Company & Location */}
                <div className="flex flex-wrap gap-3 text-sm text-base-content/60">
                    <span>
                        <i className="fa-duotone fa-regular fa-building mr-1" />
                        {name}
                    </span>
                    {job.location && (
                        <span>
                            <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                            {job.location}
                        </span>
                    )}
                    {job.employment_type && (
                        <span>
                            <i className="fa-duotone fa-regular fa-briefcase mr-1" />
                            {formatEmploymentType(job.employment_type)}
                        </span>
                    )}
                    {commute && (
                        <span>
                            <i className="fa-duotone fa-regular fa-car mr-1" />
                            {commute}
                        </span>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-[2px] bg-base-300">
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Compensation
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {salary || "N/A"}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Fee
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {job.fee_percentage}%
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            {job.guarantee_days != null ? "Guarantee" : "Candidates"}
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {job.guarantee_days != null
                                ? `${job.guarantee_days} days`
                                : String(job.application_count ?? 0)}
                        </p>
                    </div>
                </div>

                {/* Top Requirements */}
                {mandatoryReqs.length > 0 && (
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Must Have
                        </h3>
                        <ul className="space-y-2">
                            {mandatoryReqs.map((req) => (
                                <li
                                    key={req.id}
                                    className="flex items-start gap-3 text-base-content/70"
                                >
                                    <i className="fa-duotone fa-regular fa-check text-primary text-sm mt-0.5 flex-shrink-0" />
                                    <span className="text-sm leading-relaxed">
                                        {req.description}
                                    </span>
                                </li>
                            ))}
                            {(job.requirements || []).filter((r) => r.requirement_type === "mandatory").length > 3 && (
                                <li className="text-sm text-base-content/40 pl-6">
                                    +{(job.requirements || []).filter((r) => r.requirement_type === "mandatory").length - 3} more requirements
                                </li>
                            )}
                        </ul>
                    </div>
                )}

                {/* View Full Brief */}
                <button
                    type="button"
                    className="btn btn-primary btn-sm w-full"
                    onClick={() => setShowFullBrief(true)}
                >
                    <i className="fa-duotone fa-regular fa-briefcase mr-1" />
                    View Full Brief
                </button>
            </div>

            {/* Full Role Detail Modal */}
            {showFullBrief && (
                <ModalPortal>
                    <BaselModal
                        isOpen
                        onClose={() => setShowFullBrief(false)}
                        maxWidth="max-w-5xl"
                        className="h-[90vh]"
                    >
                        <BaselModalBody padding="p-0" scrollable>
                            <JobDetailLoader
                                jobId={job.id}
                                onClose={() => setShowFullBrief(false)}
                            />
                        </BaselModalBody>
                    </BaselModal>
                </ModalPortal>
            )}
        </>
    );
}
