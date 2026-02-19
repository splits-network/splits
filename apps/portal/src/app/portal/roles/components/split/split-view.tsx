"use client";

import type { Job } from "../../types";
import { MobileDetailOverlay } from "@/components/standard-lists";
import { DetailLoader } from "../shared/job-detail";
import { SplitItem } from "./split-item";

export function SplitView({
    jobs,
    onSelect,
    selectedId,
    onRefresh,
}: {
    jobs: Job[];
    onSelect: (j: Job) => void;
    selectedId: string | null;
    onRefresh?: () => void;
}) {
    const selectedJob = jobs.find((j) => j.id === selectedId) ?? null;

    return (
        <div className="flex border-2 border-base-300" style={{ minHeight: 600 }}>
            {/* Left list — hidden on mobile when a job is selected */}
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

            {/* Right detail — MobileDetailOverlay handles mobile portal */}
            <MobileDetailOverlay
                isOpen={!!selectedJob}
                className="md:w-3/5 w-full bg-base-100"
            >
                {selectedJob ? (
                    <DetailLoader
                        jobId={selectedJob.id}
                        onClose={() => onSelect(selectedJob)}
                        onRefresh={onRefresh}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center p-12">
                        <div className="text-center">
                            <i className="fa-duotone fa-regular fa-hand-pointer text-5xl text-base-content/30 mb-4" />
                            <h3 className="font-bold text-base text-base-content/30 tracking-tight">
                                Select a role to view details
                            </h3>
                        </div>
                    </div>
                )}
            </MobileDetailOverlay>
        </div>
    );
}
