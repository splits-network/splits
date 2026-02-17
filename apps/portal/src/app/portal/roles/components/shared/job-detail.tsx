"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { Badge } from "@splits-network/memphis-ui";
import { MarkdownRenderer } from "@splits-network/shared-ui";
import type { Job } from "../../types";
import { formatCommuteTypes, formatJobLevel } from "../../types";
import type { AccentClasses } from "./accent";
import { statusVariant } from "./accent";
import {
    salaryDisplay,
    formatEmploymentType,
    formatStatus,
    isNew,
    companyName,
    companyInitials,
} from "./helpers";
import RoleActionsToolbar from "./actions-toolbar";

// ─── Detail Panel ───────────────────────────────────────────────────────────

export function JobDetail({
    job,
    accent,
    onClose,
    onRefresh,
}: {
    job: Job;
    accent: AccentClasses;
    onClose?: () => void;
    onRefresh?: () => void;
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
            <div className={`p-6 border-b-4 ${accent.border}`}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        {isNew(job) && (
                            <Badge color="yellow" className="mb-3">
                                <i className="fa-duotone fa-regular fa-sparkles mr-1" />
                                New
                            </Badge>
                        )}
                        <h2 className="text-2xl font-black uppercase tracking-tight leading-tight mb-2 text-dark">
                            {job.title}
                        </h2>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className={`font-bold ${accent.text}`}>
                                {name}
                            </span>
                            <span className="text-dark/50">|</span>
                            {job.location && (
                                <span className="text-dark/70">
                                    <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                                    {job.location}
                                </span>
                            )}
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className={`btn btn-xs btn-square btn-ghost flex-shrink-0 ${accent.text}`}
                        >
                            <i className="fa-duotone fa-regular fa-xmark" />
                        </button>
                    )}
                </div>

                {/* Meta pills */}
                <div className="flex flex-wrap gap-2 mt-4">
                    <Badge color={statusVariant(job.status)} variant="outline">
                        {formatStatus(job.status)}
                    </Badge>
                    {job.employment_type && (
                        <Badge color="dark" variant="outline">
                            {formatEmploymentType(job.employment_type)}
                        </Badge>
                    )}
                    {level && (
                        <Badge color="dark" variant="outline">
                            {level}
                        </Badge>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-4">
                    <RoleActionsToolbar
                        job={job}
                        variant="descriptive"
                        size="sm"
                        onRefresh={onRefresh}
                        showActions={{
                            viewDetails: false,
                        }}
                    />
                </div>
            </div>

            {/* Stats Row */}
            <div className={`grid grid-cols-3 border-b-4 ${accent.border}`}>
                <div className="p-4 text-center border-r-2 border-dark/10">
                    <div className={`text-lg font-black ${accent.text}`}>
                        {salary || "N/A"}
                    </div>
                    <div className="text-sm font-bold uppercase tracking-wider text-dark/50">
                        Salary
                    </div>
                </div>
                <div className="p-4 text-center border-r-2 border-dark/10">
                    <div className={`text-lg font-black ${accent.text}`}>
                        {job.fee_percentage}%
                    </div>
                    <div className="text-sm font-bold uppercase tracking-wider text-dark/50">
                        Split Fee
                    </div>
                </div>
                <div className="p-4 text-center">
                    <div className={`text-lg font-black ${accent.text}`}>
                        {job.application_count ?? 0}
                    </div>
                    <div className="text-sm font-bold uppercase tracking-wider text-dark/50">
                        Applicants
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="p-6">
                {job.recruiter_description && (
                    <div className="mb-6">
                        <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2 text-dark">
                            <span className="badge badge-xs badge-purple">
                                <i className="fa-duotone fa-regular fa-user-tie" />
                            </span>
                            Recruiter Brief
                        </h3>
                        <MarkdownRenderer
                            content={job.recruiter_description}
                            className="prose prose-sm max-w-none text-dark/80"
                        />
                    </div>
                )}

                {(job.description || job.candidate_description) && (
                    <MarkdownRenderer
                        content={
                            (job.description || job.candidate_description)!
                        }
                        className="prose prose-sm max-w-none mb-6 text-dark/80"
                    />
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {commute && (
                        <div className="p-3 border-2 border-dark/20">
                            <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                                Commute
                            </div>
                            <div className="text-sm font-bold text-dark">
                                {commute}
                            </div>
                        </div>
                    )}
                    {job.department && (
                        <div className="p-3 border-2 border-dark/20">
                            <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                                Department
                            </div>
                            <div className="text-sm font-bold text-dark">
                                {job.department}
                            </div>
                        </div>
                    )}
                    {job.guarantee_days !== undefined &&
                        job.guarantee_days !== null && (
                            <div className="p-3 border-2 border-dark/20">
                                <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                                    Guarantee
                                </div>
                                <div className="text-sm font-bold text-dark">
                                    {job.guarantee_days} days
                                </div>
                            </div>
                        )}
                    {job.open_to_relocation && (
                        <div className="p-3 border-2 border-teal/40">
                            <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                                Relocation
                            </div>
                            <div className="text-sm font-bold text-teal">
                                Open to relocation
                            </div>
                        </div>
                    )}
                </div>

                {/* Mandatory Requirements */}
                {mandatoryReqs.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2 text-dark">
                            <span className="badge badge-xs badge-coral">
                                <i className="fa-duotone fa-regular fa-list-check" />
                            </span>
                            Requirements
                        </h3>
                        <ul className="space-y-2">
                            {mandatoryReqs.map((req) => (
                                <li
                                    key={req.id}
                                    className="flex items-start gap-2 text-sm text-dark/75"
                                >
                                    <i className="fa-duotone fa-regular fa-chevron-right mt-1 flex-shrink-0 text-sm text-coral" />
                                    {req.description}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Preferred Requirements */}
                {preferredReqs.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2 text-dark">
                            <span className="badge badge-xs badge-teal">
                                <i className="fa-duotone fa-regular fa-clipboard-list" />
                            </span>
                            Nice to Have
                        </h3>
                        <ul className="space-y-2">
                            {preferredReqs.map((req) => (
                                <li
                                    key={req.id}
                                    className="flex items-start gap-2 text-sm text-dark/75"
                                >
                                    <i className="fa-duotone fa-regular fa-chevron-right mt-1 flex-shrink-0 text-sm text-teal" />
                                    {req.description}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Company Info */}
                <div className={`p-4 border-4 ${accent.border}`}>
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 text-dark">
                        Company
                    </h3>
                    <div className="flex items-center gap-3">
                        {job.company?.logo_url ? (
                            <img
                                src={job.company.logo_url}
                                alt={name}
                                className={`w-12 h-12 object-cover ${accent.bg} border-2 ${accent.border}`}
                            />
                        ) : (
                            <div
                                className={`w-12 h-12 flex items-center justify-center border-2 ${accent.border} bg-cream font-bold text-sm text-dark`}
                            >
                                {companyInitials(name)}
                            </div>
                        )}
                        <div>
                            <div className="font-bold text-sm text-dark">
                                {name}
                            </div>
                            {job.company?.industry && (
                                <div className={`text-sm ${accent.text}`}>
                                    {job.company.industry}
                                </div>
                            )}
                            {job.company?.headquarters_location && (
                                <div className="text-sm text-dark/50">
                                    {job.company.headquarters_location}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Detail Loading Wrapper ─────────────────────────────────────────────────

export function DetailLoader({
    jobId,
    accent,
    onClose,
    onRefresh,
}: {
    jobId: string;
    accent: AccentClasses;
    onClose: () => void;
    onRefresh?: () => void;
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
                    <div className="flex justify-center gap-3 mb-4">
                        <div className="w-4 h-4 bg-coral animate-pulse" />
                        <div className="w-4 h-4 rounded-full bg-teal animate-pulse" />
                        <div className="w-4 h-4 rotate-45 bg-yellow animate-pulse" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider text-dark/50">
                        Loading details...
                    </span>
                </div>
            </div>
        );
    }

    if (!job) return null;

    return (
        <JobDetail
            job={job}
            accent={accent}
            onClose={onClose}
            onRefresh={onRefresh}
        />
    );
}
