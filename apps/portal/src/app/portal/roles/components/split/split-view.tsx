"use client";

import type { Job } from "../../types";
import { BaselSplitView } from "@splits-network/basel-ui";
import { DetailLoader } from "../shared/job-detail";
import { SplitItem } from "./split-item";

export function SplitView({
    jobs,
    onSelect,
    selectedId,
    onRefresh,
    onUpdateItem,
}: {
    jobs: Job[];
    onSelect: (j: Job) => void;
    selectedId: string | null;
    onRefresh?: () => void;
    onUpdateItem?: (id: string, patch: Partial<Job>) => void;
}) {
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
                    onUpdateItem={onUpdateItem}
                />
            )}
            renderDetail={(job) => (
                <DetailLoader
                    jobId={job.id}
                    onClose={() => onSelect(job)}
                    onRefresh={onRefresh}
                    onUpdateItem={onUpdateItem}
                />
            )}
            emptyIcon="fa-hand-pointer"
            emptyTitle="Select a role to view details"
            initialListWidth={33}
            onMobileClose={() => {
                const selected = jobs.find((j) => j.id === selectedId);
                if (selected) onSelect(selected);
            }}
        />
    );
}
