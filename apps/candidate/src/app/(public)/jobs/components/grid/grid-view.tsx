"use client";

import { useEffect, useRef } from "react";
import { useDrawer } from "@/contexts";
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
    const { open, close, isOpen } = useDrawer();
    const wasOpen = useRef(false);

    useEffect(() => {
        if (wasOpen.current && !isOpen && selectedJob) {
            onSelect(selectedJob);
        }
        wasOpen.current = isOpen;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    useEffect(() => {
        if (selectedJob) {
            open(
                <JobDetailLoader
                    jobId={selectedJob.id}
                    onClose={() => onSelect(selectedJob)}
                />,
            );
        } else {
            close();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedJob?.id]);

    return (
        <div className="grid gap-4 w-full grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {jobs.map((job) => (
                <GridCard
                    key={job.id}
                    job={job}
                    isSelected={selectedId === job.id}
                    onSelect={() => onSelect(job)}
                />
            ))}
        </div>
    );
}
