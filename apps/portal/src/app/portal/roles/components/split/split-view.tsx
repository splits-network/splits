"use client";

import type { Job } from "../../types";
import { ACCENT, accentAt } from "../shared/accent";
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
    const selectedJob = jobs.find((j) => j.id === selectedId);
    const selectedAc = selectedJob ? accentAt(jobs.indexOf(selectedJob)) : ACCENT[0];

    return (
        <div className="flex gap-0 border-4 border-dark" style={{ minHeight: 600 }}>
            {/* Left list */}
            <div className="w-2/5 border-r-4 border-dark">
                {jobs.map((job, idx) => (
                    <SplitItem
                        key={job.id}
                        job={job}
                        accent={accentAt(idx)}
                        isSelected={selectedId === job.id}
                        onSelect={() => onSelect(job)}
                    />
                ))}
            </div>

            {/* Right detail */}
            <div className="w-3/5 bg-white">
                {selectedJob ? (
                    <DetailLoader jobId={selectedJob.id} accent={selectedAc} onClose={() => onSelect(selectedJob)} onRefresh={onRefresh} />
                ) : (
                    <div className="h-full flex items-center justify-center p-12">
                        <div className="text-center">
                            <div className="flex justify-center gap-3 mb-6">
                                <div className="w-8 h-8 rotate-12 bg-coral" />
                                <div className="w-8 h-8 rounded-full bg-teal" />
                                <div className="w-8 h-8 rotate-45 bg-yellow" />
                            </div>
                            <h3 className="font-black text-xl uppercase tracking-tight mb-2 text-dark">
                                Select a Role
                            </h3>
                            <p className="text-sm text-dark/50">
                                Click a listing on the left to view details
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
