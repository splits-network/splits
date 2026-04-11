"use client";

import { useState, useEffect, useRef } from "react";
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
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);
    const limit = 20;

    // Debounce search input and reset page
    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 300);
        return () => clearTimeout(debounceRef.current);
    }, [searchInput]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        const params: Record<string, any> = { page, limit };
        if (search) params.search = search;

        apiClient
            .get<StandardListResponse<Job>>(
                `/public/companies/${company.slug}/jobs`,
                { params },
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
    }, [company.slug, page, search]);

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="space-y-4">
            {/* Search input */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <i className="fa-duotone fa-regular fa-search absolute left-3 top-1/2 -translate-y-1/2 text-xs text-base-content/30" />
                    <input
                        type="text"
                        placeholder="Search open roles..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="input input-sm w-full pl-8 bg-base-200 border-base-300 text-sm"
                    />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 shrink-0">
                    {total} Role{total !== 1 ? "s" : ""}
                </p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <span className="loading loading-spinner loading-md text-primary" />
                </div>
            ) : jobs.length === 0 ? (
                <div className="scroll-reveal fade-up profile-section text-center py-16">
                    <i className="fa-duotone fa-regular fa-briefcase text-4xl text-base-content/15 mb-4 block" />
                    <p className="text-lg font-black text-base-content/60 mb-2">
                        {search ? "No matching roles" : "No Open Roles"}
                    </p>
                    <p className="text-sm text-base-content/40 max-w-sm mx-auto">
                        {search
                            ? "Try a different search term."
                            : `${company.name} doesn't have any open positions right now. Check back soon.`}
                    </p>
                    {search && (
                        <button
                            className="btn btn-primary btn-sm mt-4"
                            onClick={() => setSearchInput("")}
                        >
                            Clear Search
                        </button>
                    )}
                </div>
            ) : (
                <>
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
                </>
            )}
        </div>
    );
}
