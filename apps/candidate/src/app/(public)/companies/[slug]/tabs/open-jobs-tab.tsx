"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import type { PublicCompany } from "../../types";
import type { Job } from "@/app/(public)/jobs/types";
import type { StandardListResponse } from "@splits-network/shared-types";
import { GridCard } from "@/app/(public)/jobs/components/grid/grid-card";

interface OpenJobsTabProps {
    company: PublicCompany;
}

export function OpenJobsTab({ company }: OpenJobsTabProps) {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const limit = 20;

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        apiClient
            .get<StandardListResponse<Job>>(
                `/public/companies/${company.slug}/jobs`,
                { params: { page, limit } },
            )
            .then((res) => {
                if (!cancelled) {
                    setJobs(res.data || []);
                    setTotal(res.pagination?.total || 0);
                }
            })
            .catch(() => {
                if (!cancelled) setJobs([]);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [company.slug, page]);

    const totalPages = Math.ceil(total / limit);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <span className="loading loading-spinner loading-md text-primary" />
            </div>
        );
    }

    if (jobs.length === 0) {
        return (
            <div className="scroll-reveal fade-up profile-section text-center py-16">
                <i className="fa-duotone fa-regular fa-briefcase text-4xl text-base-content/15 mb-4 block" />
                <p className="text-lg font-black text-base-content/60 mb-2">
                    No Open Roles
                </p>
                <p className="text-sm text-base-content/40 max-w-sm mx-auto">
                    {company.name} doesn&apos;t have any open positions right
                    now. Check back soon.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-4">
                {total} Open Role{total !== 1 ? "s" : ""}
            </p>

            <div className="grid gap-4 grid-cols-1">
                {jobs.map((job) => (
                    <GridCard
                        key={job.id}
                        job={job}
                        isSelected={selectedJobId === job.id}
                        onSelect={() => setSelectedJobId(job.id)}
                    />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                        className="btn btn-ghost btn-sm"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                    >
                        <i className="fa-duotone fa-regular fa-chevron-left text-xs" />
                    </button>
                    <span className="text-sm text-base-content/50">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        className="btn btn-ghost btn-sm"
                        disabled={page >= totalPages}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        <i className="fa-duotone fa-regular fa-chevron-right text-xs" />
                    </button>
                </div>
            )}
        </div>
    );
}
