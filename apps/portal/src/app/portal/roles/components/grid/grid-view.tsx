"use client";

import type { Job } from "../../types";
import { DetailLoader } from "../shared/job-detail";
import { GridCard } from "./grid-card";

export function GridView({
    jobs,
    onSelectAction,
    selectedId,
    onRefreshAction,
    onUpdateItemAction,
}: {
    jobs: Job[];
    onSelectAction: (j: Job) => void;
    selectedId: string | null;
    onRefreshAction?: () => void;
    onUpdateItemAction?: (id: string, patch: Partial<Job>) => void;
}) {
    const selectedJob = jobs.find((j) => j.id === selectedId) ?? null;

    return (
        <div className="relative">
            {/* Grid */}
            <div className="grid gap-4 w-full grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {jobs.map((job) => (
                    <GridCard
                        key={job.id}
                        job={job}
                        isSelected={selectedId === job.id}
                        onSelect={() => onSelectAction(job)}
                        onRefresh={onRefreshAction}
                        onUpdateItem={onUpdateItemAction}
                    />
                ))}
            </div>

            {/* Detail Drawer */}
            {selectedJob && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/30 transition-opacity"
                        onClick={() => onSelectAction(selectedJob)}
                    />
                    <div className="fixed top-0 right-0 z-50 h-full w-full md:w-1/2 bg-base-100 shadow-2xl border-l border-base-300 overflow-y-auto animate-slide-in-right">
                        <DetailLoader
                            jobId={selectedJob.id}
                            onClose={() => onSelectAction(selectedJob)}
                            onRefresh={onRefreshAction}
                            onUpdateItem={onUpdateItemAction}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
