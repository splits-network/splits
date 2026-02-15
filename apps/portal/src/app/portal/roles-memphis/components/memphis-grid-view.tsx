"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
    Pagination,
    EmptyState,
    GeometricDecoration,
    getAccentColor,
} from "@splits-network/memphis-ui";
import { MemphisRoleCard } from "./memphis-role-card";
import MemphisInlineDetail from "./memphis-inline-detail";
import MemphisPipelineSidebar from "./memphis-pipeline-sidebar";
import { useRolesFilter } from "../../roles/contexts/roles-filter-context";

export default function MemphisGridView() {
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
        canManageRole,
    } = useRolesFilter();

    // Selection state (URL-driven)
    const selectedId = searchParams.get("roleId");

    // Pipeline sidebar state
    const [pipelineRoleId, setPipelineRoleId] = useState<string | null>(null);
    const [pipelineRoleTitle, setPipelineRoleTitle] = useState<string>("");

    const handleSelect = useCallback(
        (jobId: string) => {
            const params = new URLSearchParams(searchParams);
            // Toggle: click same card to deselect
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

    // Find selected job index for accent color
    const selectedIndex = useMemo(
        () => jobs.findIndex((j) => j.id === selectedId),
        [jobs, selectedId],
    );

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
                    <p className="text-sm font-black uppercase tracking-wider text-dark/50">
                        Loading roles...
                    </p>
                </div>
            )}

            {/* Grid + Inline Detail (side by side) */}
            {!loading && jobs.length > 0 && (
                <div className="flex gap-6">
                    {/* Cards grid — shrinks when detail is open */}
                    <div
                        className={`grid gap-6 ${
                            selectedId
                                ? "w-1/2 grid-cols-1 lg:grid-cols-2"
                                : "w-full grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                        }`}
                    >
                        {jobs.map((job, index) => (
                            <MemphisRoleCard
                                key={job.id}
                                job={job}
                                accent={getAccentColor(index)}
                                userRole={userRole}
                                canManageRole={canManageRole}
                                onViewDetails={handleSelect}
                                onViewPipeline={handleViewPipeline}
                            />
                        ))}
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

            {/* Pipeline Sidebar (keep as overlay since it's a separate concern) */}
            <MemphisPipelineSidebar
                roleId={pipelineRoleId}
                roleTitle={pipelineRoleTitle}
                onClose={handleClosePipeline}
            />
        </div>
    );
}
