"use client";

import type { Job } from "../../types";
import { MobileDetailOverlay } from "@/components/standard-lists";
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
        <div className="flex gap-6">
            {/* Card grid — hidden on mobile when a detail is open */}
            <div
                className={`flex flex-col w-full ${selectedJob ? "hidden md:flex" : "flex"}`}
            >
                <div
                    className={`grid gap-4 w-full ${
                        selectedJob
                            ? "grid-cols-1 lg:grid-cols-2 3xl:grid-cols-3"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5"
                    }`}
                >
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

            {/* Detail sidebar — 50 % width on desktop, full-screen overlay on mobile */}
            {selectedJob && (
                <MobileDetailOverlay
                    isOpen
                    className="md:w-1/2 md:border-2 md:border-base-300 md:flex-shrink-0 md:self-start bg-base-100"
                >
                    <DetailLoader
                        jobId={selectedJob.id}
                        onClose={() => onSelectAction(selectedJob)}
                        onRefresh={onRefreshAction}
                        onUpdateItem={onUpdateItemAction}
                    />
                </MobileDetailOverlay>
            )}
        </div>
    );
}
