"use client";

import type { Recruiter } from "../marketplace-client";
import GridCard from "./grid-card";

interface GridViewProps {
    recruiters: Recruiter[];
    selectedRecruiter: Recruiter | null;
    onSelect: (recruiter: Recruiter) => void;
}

export default function GridView({
    recruiters,
    selectedRecruiter,
    onSelect,
}: GridViewProps) {
    return (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {recruiters.map((recruiter) => (
                <GridCard
                    key={recruiter.id}
                    recruiter={recruiter}
                    isSelected={selectedRecruiter?.id === recruiter.id}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
}
