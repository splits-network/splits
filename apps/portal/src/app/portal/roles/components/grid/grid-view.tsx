"use client";

import type { Job } from "../../types";
import { ACCENT, accentAt } from "../shared/accent";
import { DetailLoader } from "../shared/job-detail";
import { GridCard } from "./grid-card";

export function GridView({
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
    const selectedJob = jobs.find((j) => j.id === selectedId);
    const selectedAc = selectedJob
        ? accentAt(jobs.indexOf(selectedJob))
        : ACCENT[0];

    return (
        <div className="flex gap-6">
            <div className="flex flex-col w-full">
                <div
                    className={`grid gap-4 w-full ${
                        selectedJob
                            ? "grid-cols-1 lg:grid-cols-2"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    }`}
                >
                    {jobs.map((job, idx) => (
                        <GridCard
                            key={job.id}
                            job={job}
                            accent={accentAt(idx)}
                            isSelected={selectedId === job.id}
                            onSelect={() => onSelect(job)}
                            onRefresh={onRefresh}
                        />
                    ))}
                </div>
            </div>

            {/* Detail Sidebar */}
            {selectedJob && (
                <div
                    className={`w-1/2 border-4 flex-shrink-0 self-start bg-white ${selectedAc.border}`}
                >
                    <DetailLoader
                        jobId={selectedJob.id}
                        accent={selectedAc}
                        onClose={() => onSelect(selectedJob)}
                        onRefresh={onRefresh}
                    />
                </div>
            )}
        </div>
    );
}
