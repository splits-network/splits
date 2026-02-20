"use client";

import type { Job } from "../../types";
import { SplitItem } from "./split-item";
import { JobDetailLoader } from "../shared/job-detail";

interface SplitViewProps {
    jobs: Job[];
    selectedId: string | null;
    onSelect: (job: Job) => void;
}

export function SplitView({ jobs, selectedId, onSelect }: SplitViewProps) {
    const selectedJob = jobs.find((j) => j.id === selectedId) ?? null;

    return (
        <div
            className="flex border-2 border-base-300"
            style={{ minHeight: 600 }}
        >
            {/* Left list (40%) -- hidden on mobile when detail is selected */}
            <div
                className={`w-full md:w-2/5 border-r-2 border-base-300 overflow-y-auto ${
                    selectedId ? "hidden md:block" : "block"
                }`}
            >
                {jobs.map((job) => (
                    <SplitItem
                        key={job.id}
                        job={job}
                        isSelected={selectedId === job.id}
                        onSelect={() => onSelect(job)}
                    />
                ))}
            </div>

            {/* Right detail (60%) */}
            <div className="flex-1 bg-base-100">
                {selectedJob ? (
                    <>
                        {/* Mobile: full-screen overlay */}
                        <div className="fixed inset-0 z-[999] flex flex-col bg-base-100 md:hidden">
                            <div className="flex-1 overflow-y-auto">
                                <JobDetailLoader
                                    jobId={selectedJob.id}
                                    onClose={() => onSelect(selectedJob)}
                                />
                            </div>
                        </div>

                        {/* Desktop: inline panel */}
                        <div className="hidden md:block h-full overflow-y-auto">
                            <JobDetailLoader
                                jobId={selectedJob.id}
                                onClose={() => onSelect(selectedJob)}
                            />
                        </div>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center p-12">
                        <div className="text-center">
                            <i className="fa-duotone fa-regular fa-hand-pointer text-5xl text-base-content/20 mb-4 block" />
                            <h3 className="font-bold text-base text-base-content/30 tracking-tight">
                                Select a job to view details
                            </h3>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
