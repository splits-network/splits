"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { MarkdownRenderer } from "@splits-network/shared-ui";
import type { Job } from "../../types";
import { formatCommuteTypes, formatJobLevel } from "../../types";
import { statusColor } from "./status-color";
import {
    salaryDisplay,
    formatEmploymentType,
    formatStatus,
    isNew,
    companyName,
    companyInitials,
} from "./helpers";
import RoleActionsToolbar from "./actions-toolbar";

/* ─── Detail Panel ───────────────────────────────────────────────────────── */

export function JobDetail({
    job,
    onClose,
    onRefresh,
    onUpdateItem,
    accent: _accent,
}: {
    job: Job;
    onClose?: () => void;
    onRefresh?: () => void;
    onUpdateItem?: (id: string, patch: Partial<Job>) => void;
    /** @deprecated Basel ignores this prop. Kept for backward compatibility with Memphis consumers. */
    accent?: unknown;
}) {
    const name = companyName(job);
    const salary = salaryDisplay(job);
    const commute = formatCommuteTypes(job.commute_types);
    const level = formatJobLevel(job.job_level);

    const mandatoryReqs = (job.requirements || [])
        .filter((r) => r.requirement_type === "mandatory")
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    const preferredReqs = (job.requirements || [])
        .filter((r) => r.requirement_type === "preferred")
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

    return (
        <div>
            {/* Header */}
            <div className="sticky top-0 z-10 bg-base-100 border-b-2 border-base-300 px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span
                                className={`text-[10px] uppercase tracking-[0.2em] font-bold px-2 py-1 ${statusColor(job.status)}`}
                            >
                                {formatStatus(job.status)}
                            </span>
                            {isNew(job) && (
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold px-2 py-1 bg-warning/15 text-warning">
                                    New
                                </span>
                            )}
                            {job.employment_type && (
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold px-2 py-1 bg-base-200 text-base-content/50">
                                    {formatEmploymentType(job.employment_type)}
                                </span>
                            )}
                            {level && (
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold px-2 py-1 bg-base-200 text-base-content/50">
                                    {level}
                                </span>
                            )}
                        </div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-2">
                            {job.department || name}
                        </p>
                        <h2 className="text-2xl lg:text-3xl font-black leading-[0.95] tracking-tight mb-3">
                            {job.title}
                        </h2>
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
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="btn btn-sm btn-square btn-ghost"
                        >
                            <i className="fa-duotone fa-regular fa-xmark text-lg" />
                        </button>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-4">
                    <RoleActionsToolbar
                        job={job}
                        variant="descriptive"
                        size="sm"
                        onRefresh={onRefresh}
                        onUpdateItem={onUpdateItem}
                        showActions={{ viewDetails: false }}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-[2px] bg-base-300">
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Compensation
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {salary || "N/A"}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Fee
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {job.fee_percentage}%
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Candidates
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {job.application_count ?? 0}
                        </p>
                    </div>
                </div>

                {/* Recruiter Brief */}
                {job.recruiter_description && (
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Recruiter Brief
                        </h3>
                        <MarkdownRenderer
                            content={job.recruiter_description}
                            className="prose prose-sm max-w-none text-base-content/70"
                        />
                    </div>
                )}

                {/* Description */}
                {(job.description || job.candidate_description) && (
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Role Overview
                        </h3>
                        <MarkdownRenderer
                            content={
                                (job.description || job.candidate_description)!
                            }
                            className="prose prose-sm max-w-none text-base-content/70 leading-relaxed"
                        />
                    </div>
                )}

                {/* Details grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-base-300">
                    {commute && (
                        <div className="bg-base-100 p-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                Commute
                            </p>
                            <p className="font-bold text-sm">{commute}</p>
                        </div>
                    )}
                    {job.department && (
                        <div className="bg-base-100 p-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                Department
                            </p>
                            <p className="font-bold text-sm">
                                {job.department}
                            </p>
                        </div>
                    )}
                    {job.guarantee_days !== undefined &&
                        job.guarantee_days !== null && (
                            <div className="bg-base-100 p-4">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                    Guarantee
                                </p>
                                <p className="font-bold text-sm">
                                    {job.guarantee_days} days
                                </p>
                            </div>
                        )}
                    {job.open_to_relocation && (
                        <div className="bg-base-100 p-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                Relocation
                            </p>
                            <p className="font-bold text-sm text-secondary">
                                Open to relocation
                            </p>
                        </div>
                    )}
                </div>

                {/* Mandatory Requirements */}
                {mandatoryReqs.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Must Have
                        </h3>
                        <ul className="space-y-2">
                            {mandatoryReqs.map((req) => (
                                <li
                                    key={req.id}
                                    className="flex items-start gap-3 text-base-content/70"
                                >
                                    <i className="fa-duotone fa-regular fa-check text-primary text-xs mt-1.5 flex-shrink-0" />
                                    <span className="leading-relaxed">
                                        {req.description}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Preferred Requirements */}
                {preferredReqs.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Preferred
                        </h3>
                        <ul className="space-y-2">
                            {preferredReqs.map((req) => (
                                <li
                                    key={req.id}
                                    className="flex items-start gap-3 text-base-content/70"
                                >
                                    <i className="fa-duotone fa-regular fa-arrow-right text-secondary text-xs mt-1.5 flex-shrink-0" />
                                    <span className="leading-relaxed">
                                        {req.description}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Company Info */}
                <div className="border-t-2 border-base-300 pt-6">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-4">
                        Hiring Company
                    </h3>
                    <div className="flex items-center gap-4">
                        {job.company?.logo_url ? (
                            <img
                                src={job.company.logo_url}
                                alt={name}
                                className="w-12 h-12 object-cover"
                            />
                        ) : (
                            <div className="w-12 h-12 flex items-center justify-center border-2 border-base-300 bg-base-200 font-bold text-sm">
                                {companyInitials(name)}
                            </div>
                        )}
                        <div>
                            <p className="font-bold">{name}</p>
                            {job.company?.industry && (
                                <p className="text-sm text-base-content/50">
                                    {job.company.industry}
                                </p>
                            )}
                            {job.company?.headquarters_location && (
                                <p className="text-sm text-base-content/50">
                                    {job.company.headquarters_location}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Detail Loading Wrapper ─────────────────────────────────────────────── */

export function DetailLoader({
    jobId,
    onClose,
    onRefresh,
    onUpdateItem,
}: {
    jobId: string;
    onClose: () => void;
    onRefresh?: () => void;
    onUpdateItem?: (id: string, patch: Partial<Job>) => void;
}) {
    const { getToken } = useAuth();
    const [job, setJob] = useState<Job | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        (async () => {
            try {
                const token = await getToken();
                if (!token || cancelled) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get<{ data: Job }>(`/jobs/${jobId}`, {
                    params: { include: "company,requirements" },
                });
                if (!cancelled) setJob(res.data);
            } catch (err) {
                console.error("Failed to fetch job detail:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [jobId]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-12">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-primary mb-4 block" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40">
                        Loading role...
                    </span>
                </div>
            </div>
        );
    }

    if (!job) return null;

    return (
        <JobDetail
            job={job}
            onClose={onClose}
            onRefresh={onRefresh}
            onUpdateItem={onUpdateItem}
        />
    );
}
