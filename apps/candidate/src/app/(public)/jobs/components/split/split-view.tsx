"use client";

import type { Job } from "../../types";
import { BaselSplitView } from "@splits-network/basel-ui";
import { JobDetailLoader } from "../shared/job-detail";
import { SplitItem } from "./split-item";

interface SplitViewProps {
    jobs: Job[];
    selectedId: string | null;
    onSelect: (job: Job) => void;
}

export function SplitView({ jobs, selectedId, onSelect }: SplitViewProps) {
    return (
        <BaselSplitView
            items={jobs}
            selectedId={selectedId}
            getItemId={(j) => j.id}
            estimatedItemHeight={90}
            renderItem={(job, isSelected) => (
                <SplitItem
                    job={job}
                    isSelected={isSelected}
                    onSelect={() => onSelect(job)}
                />
            )}
            renderDetail={(job) => (
                <JobDetailLoader
                    jobId={job.id}
                    onClose={() => onSelect(job)}
                />
            )}
            emptyIcon="fa-hand-pointer"
            emptyTitle="Select a job to view details"
            onMobileClose={() => {
                const selected = jobs.find((j) => j.id === selectedId);
                if (selected) onSelect(selected);
            }}
        />
    );
}
