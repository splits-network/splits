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
        <div className="drawer drawer-end">
            <input type="checkbox" className="drawer-toggle" checked={!!selectedJob} readOnly />
            <div className="drawer-content">
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
            </div>
            <div className="drawer-side z-50">
                <div className="drawer-overlay" onClick={() => selectedJob && onSelectAction(selectedJob)} aria-label="close drawer" />
                <div className="bg-base-100 w-full md:w-1/2 min-h-full overflow-y-auto shadow-2xl">
                    {selectedJob && (
                        <DetailLoader
                            jobId={selectedJob.id}
                            onClose={() => onSelectAction(selectedJob)}
                            onRefresh={onRefreshAction}
                            onUpdateItem={onUpdateItemAction}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
