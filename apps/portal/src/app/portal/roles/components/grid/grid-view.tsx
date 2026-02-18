"use client";

import type { Job } from "../../types";
import { ACCENT, accentAt } from "../shared/accent";
import { DetailLoader } from "../shared/job-detail";
import { MobileDetailOverlay } from "@/components/standard-lists";
import { GridCard } from "./grid-card";

export function GridView({
    jobs,
    onSelectAction,
    selectedId,
    onRefreshAction,
}: {
    jobs: Job[];
    onSelectAction: (j: Job) => void;
    selectedId: string | null;
    onRefreshAction?: () => void;
}) {
    const selectedJob = jobs.find((j) => j.id === selectedId);
    const selectedAc = selectedJob
        ? accentAt(jobs.indexOf(selectedJob))
        : ACCENT[0];

    return (
        <div className="flex gap-6">
            <div className={`flex flex-col w-full ${selectedJob ? "hidden md:flex" : "flex"}`}>
                <div
                    className={`grid gap-4 w-full ${
                        selectedJob
                            ? "grid-cols-1 lg:grid-cols-2 3xl:grid-cols-3"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5"
                    }`}
                >
                    {jobs.map((job, idx) => (
                        <GridCard
                            key={job.id}
                            job={job}
                            accent={accentAt(idx)}
                            isSelected={selectedId === job.id}
                            onSelect={() => onSelectAction(job)}
                            onRefresh={onRefreshAction}
                        />
                    ))}
                </div>
            </div>

            {/* Detail Sidebar */}
            {selectedJob && (
                <MobileDetailOverlay
                    isOpen
                    className={`md:w-1/2 md:border-4 md:flex-shrink-0 md:self-start bg-white ${selectedAc.border}`}
                >
                    <DetailLoader
                        jobId={selectedJob.id}
                        accent={selectedAc}
                        onClose={() => onSelectAction(selectedJob)}
                        onRefresh={onRefreshAction}
                    />
                </MobileDetailOverlay>
            )}
        </div>
    );
}
