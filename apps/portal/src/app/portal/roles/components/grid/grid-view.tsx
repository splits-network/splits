"use client";

import { useEffect, useRef } from "react";
import { useDrawer } from "@/contexts";
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
    const { open, close, isOpen } = useDrawer();
    const wasOpen = useRef(false);

    // Clear selection when drawer is closed externally (escape, backdrop)
    useEffect(() => {
        if (wasOpen.current && !isOpen && selectedJob) {
            onSelectAction(selectedJob);
        }
        wasOpen.current = isOpen;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    useEffect(() => {
        if (selectedJob) {
            open(
                <DetailLoader
                    jobId={selectedJob.id}
                    onClose={() => onSelectAction(selectedJob)}
                    onRefresh={onRefreshAction}
                    onUpdateItem={onUpdateItemAction}
                />,
            );
        } else {
            close();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedJob?.id]);

    return (
        <div className="grid gap-4 w-full grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
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
    );
}
