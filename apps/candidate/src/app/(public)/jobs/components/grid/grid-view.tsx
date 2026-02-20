"use client";

import type { Job } from "../../types";
import { GridCard } from "./grid-card";
import { JobDetailLoader } from "../shared/job-detail";

interface GridViewProps {
    jobs: Job[];
    selectedId: string | null;
    onSelect: (job: Job) => void;
}

export function GridView({ jobs, selectedId, onSelect }: GridViewProps) {
    const selectedJob = jobs.find((j) => j.id === selectedId) ?? null;

    return (
        <div className="flex gap-6">
            {/* Card grid -- hidden on mobile when detail is open */}
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
                            onSelect={() => onSelect(job)}
                        />
                    ))}
                </div>
            </div>

            {/* Detail sidebar */}
            {selectedJob && selectedId && (
                <DetailSidebar
                    jobId={selectedId}
                    onClose={() => onSelect(selectedJob)}
                />
            )}
        </div>
    );
}

function DetailSidebar({
    jobId,
    onClose,
}: {
    jobId: string;
    onClose: () => void;
}) {
    return (
        <>
            {/* Mobile: full-screen overlay */}
            <div className="fixed inset-0 z-[999] flex flex-col bg-base-100 md:hidden">
                <div className="flex-1 overflow-y-auto">
                    <JobDetailLoader jobId={jobId} onClose={onClose} />
                </div>
            </div>

            {/* Desktop: inline sidebar */}
            <div className="hidden md:flex md:flex-col md:w-1/2 md:border-2 md:border-base-300 md:flex-shrink-0 md:self-start bg-base-100">
                <div className="flex-1 overflow-y-auto">
                    <JobDetailLoader jobId={jobId} onClose={onClose} />
                </div>
            </div>
        </>
    );
}
