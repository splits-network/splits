"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
    Table,
    Badge,
    Pagination,
    EmptyState,
    GeometricDecoration,
    getAccentColor,
} from "@splits-network/memphis-ui";
import type { TableColumn, AccentColor } from "@splits-network/memphis-ui";
import { formatRelativeTime } from "@/lib/utils";
import { useRolesFilter } from "../../roles/contexts/roles-filter-context";
import { Job, formatCommuteTypes, formatJobLevel } from "../../roles/types";
import MemphisInlineDetail from "./memphis-inline-detail";
import MemphisPipelineSidebar from "./memphis-pipeline-sidebar";

const STATUS_ACCENT: Record<string, AccentColor> = {
    active: "teal",
    paused: "yellow",
    filled: "purple",
    closed: "coral",
};

export default function MemphisTableView() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const {
        data: jobs,
        loading,
        error,
        total,
        page,
        limit,
        totalPages,
        goToPage,
        refresh,
        userRole,
    } = useRolesFilter();

    // Selection state (URL-driven)
    const selectedId = searchParams.get("roleId");

    // Pipeline sidebar
    const [pipelineRoleId, setPipelineRoleId] = useState<string | null>(null);
    const [pipelineRoleTitle, setPipelineRoleTitle] = useState<string>("");

    const handleSelect = useCallback(
        (jobId: string) => {
            const params = new URLSearchParams(searchParams);
            if (params.get("roleId") === jobId) {
                params.delete("roleId");
            } else {
                params.set("roleId", jobId);
            }
            router.push(`${pathname}?${params.toString()}`);
        },
        [pathname, router, searchParams],
    );

    const handleClose = useCallback(() => {
        const params = new URLSearchParams(searchParams);
        params.delete("roleId");
        router.push(`${pathname}?${params.toString()}`);
    }, [pathname, router, searchParams]);

    const handleViewPipeline = (jobId: string) => {
        const job = jobs.find((j) => j.id === jobId);
        setPipelineRoleId(jobId);
        setPipelineRoleTitle(job?.title || "");
    };

    const handleClosePipeline = () => {
        setPipelineRoleId(null);
        setPipelineRoleTitle("");
    };

    const selectedIndex = useMemo(
        () => jobs.findIndex((j) => j.id === selectedId),
        [jobs, selectedId],
    );

    const isRecruiterView = userRole === "recruiter" || userRole === "platform_admin";

    const columns: TableColumn<Job>[] = [
        {
            key: "title",
            header: "Role",
            render: (job) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-memphis-detail border-dark/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {job.company?.logo_url ? (
                            <img src={job.company.logo_url} alt={job.company.name} className="w-full h-full object-contain" />
                        ) : (
                            <span className="text-[10px] font-black text-dark/50">
                                {(job.company?.name || "C")[0].toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-black uppercase tracking-wide text-dark truncate">{job.title}</p>
                        <p className="text-[10px] font-semibold text-dark/40 truncate">{job.company?.name || "Confidential"}</p>
                    </div>
                </div>
            ),
        },
        {
            key: "location",
            header: "Location",
            render: (job) => (
                <span className="text-xs font-semibold text-dark/60">{job.location || "\u2014"}</span>
            ),
        },
        {
            key: "salary",
            header: "Salary",
            render: (job) => (
                <span className="text-xs font-bold text-dark">
                    {job.salary_min && job.salary_max
                        ? `$${(job.salary_min / 1000).toFixed(0)}k\u2013$${(job.salary_max / 1000).toFixed(0)}k`
                        : "\u2014"}
                </span>
            ),
        },
        {
            key: "fee",
            header: isRecruiterView ? "Commission" : "Fee",
            render: (job) => {
                const maxPayout = job.salary_max ? Math.round((job.fee_percentage * job.salary_max) / 100) : null;
                return (
                    <div>
                        <span className="text-xs font-black text-coral">{job.fee_percentage}%</span>
                        {isRecruiterView && maxPayout && (
                            <span className="text-[10px] font-bold text-dark/40 ml-1">(${maxPayout.toLocaleString()})</span>
                        )}
                    </div>
                );
            },
        },
        {
            key: "status",
            header: "Status",
            render: (job) => (
                <Badge variant={STATUS_ACCENT[job.status] || "dark"}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </Badge>
            ),
        },
        {
            key: "applicants",
            header: "Applicants",
            render: (job) => <span className="text-xs font-bold text-dark/60">{job.application_count || 0}</span>,
        },
        {
            key: "posted",
            header: "Posted",
            render: (job) => (
                <span className="text-[10px] font-bold uppercase text-dark/40">{formatRelativeTime(job.created_at)}</span>
            ),
        },
        {
            key: "actions",
            header: "",
            className: "w-24",
            render: (job) => (
                <div className="flex items-center gap-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); handleViewPipeline(job.id); }}
                        className="w-7 h-7 flex items-center justify-center border-memphis-detail border-dark/15 text-dark/30 hover:border-teal hover:text-teal transition-colors"
                        title="Pipeline"
                    >
                        <i className="fa-duotone fa-regular fa-diagram-project text-[10px]" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleSelect(job.id); }}
                        className="w-7 h-7 flex items-center justify-center border-memphis-detail border-dark/15 text-dark/30 hover:border-coral hover:text-coral transition-colors"
                        title="Details"
                    >
                        <i className="fa-duotone fa-regular fa-arrow-right text-[10px]" />
                    </button>
                </div>
            ),
        },
    ];

    if (error) {
        return (
            <EmptyState
                icon="fa-duotone fa-regular fa-triangle-exclamation"
                title="Error Loading Roles"
                description={error}
                color="coral"
                action={
                    <button onClick={refresh} className="memphis-btn memphis-btn-sm btn-coral">
                        Try Again
                    </button>
                }
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Loading State */}
            {loading && jobs.length === 0 && (
                <div className="border-memphis border-dark bg-white p-12 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <GeometricDecoration shape="square" color="coral" size={24} className="animate-spin" />
                        <GeometricDecoration shape="circle" color="teal" size={24} className="animate-pulse" />
                        <GeometricDecoration shape="triangle" color="yellow" size={24} className="animate-bounce" />
                    </div>
                    <p className="text-sm font-black uppercase tracking-wider text-dark/50">Loading roles...</p>
                </div>
            )}

            {/* Table + Inline Detail (side by side) */}
            {!loading && jobs.length > 0 && (
                <div className="flex gap-6">
                    {/* Table — shrinks when detail is open */}
                    <div className={selectedId ? "w-1/2 min-w-0" : "w-full"}>
                        <Table<Job>
                            columns={columns}
                            data={jobs}
                            keyExtractor={(job) => job.id}
                            onRowClick={(job) => handleSelect(job.id)}
                            emptyMessage="No roles found"
                        />
                    </div>

                    {/* Inline detail panel — sticky on right */}
                    {selectedId && (
                        <div className="w-1/2 flex-shrink-0 sticky top-4 self-start">
                            <MemphisInlineDetail
                                id={selectedId}
                                accent={selectedIndex >= 0 ? getAccentColor(selectedIndex) : "coral"}
                                onClose={handleClose}
                                onViewPipeline={handleViewPipeline}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Empty State */}
            {!loading && jobs.length === 0 && (
                <EmptyState
                    icon="fa-duotone fa-regular fa-briefcase"
                    title="No Roles Found"
                    description="Try adjusting your search or filters"
                    color="teal"
                />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination
                    page={page}
                    totalPages={totalPages}
                    onChange={goToPage}
                    totalItems={total}
                    perPage={limit}
                    accent="coral"
                />
            )}

            {/* Pipeline Sidebar (overlay — separate concern) */}
            <MemphisPipelineSidebar
                roleId={pipelineRoleId}
                roleTitle={pipelineRoleTitle}
                onClose={handleClosePipeline}
            />
        </div>
    );
}
