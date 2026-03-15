"use client";

import { useStandardList, PaginationControls } from "@/hooks/use-standard-list";
import type { JobActivityItem } from "../../types";
import { TimelineItem } from "./timeline-item";

/* ─── Types ──────────────────────────────────────────────────────────── */

interface JobTimelineTabProps {
    jobId: string;
}

/* ─── Component ──────────────────────────────────────────────────────── */

export function JobTimelineTab({ jobId }: JobTimelineTabProps) {
    const {
        data: activities,
        loading,
        page,
        limit,
        goToPage,
        setLimit,
        total,
        totalPages,
    } = useStandardList<JobActivityItem>({
        endpoint: `/jobs/${jobId}/activity`,
        defaultSortBy: "created_at",
        defaultSortOrder: "desc",
        defaultLimit: 25,
        syncToUrl: false,
    });

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold">Activity Timeline</h3>

            {/* Loading */}
            {loading && activities.length === 0 && (
                <div className="py-12 text-center">
                    <span className="loading loading-spinner loading-lg text-primary mb-4 block" />
                    <p className="text-sm uppercase tracking-[0.2em] font-bold text-base-content/40">
                        Loading activity...
                    </p>
                </div>
            )}

            {/* Empty */}
            {!loading && activities.length === 0 && (
                <div className="py-12 text-center">
                    <i className="fa-duotone fa-regular fa-clock-rotate-left text-4xl text-info/20 mb-4 block" />
                    <p className="text-base-content/50">No activity recorded yet.</p>
                </div>
            )}

            {/* Timeline */}
            {activities.length > 0 && (
                <ul className="timeline timeline-vertical timeline-compact">
                    {activities.map((item) => (
                        <TimelineItem key={item.id} item={item} />
                    ))}
                </ul>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <PaginationControls
                    page={page}
                    totalPages={totalPages}
                    total={total}
                    limit={limit}
                    onPageChange={goToPage}
                    onLimitChange={setLimit}
                    loading={loading}
                />
            )}
        </div>
    );
}
