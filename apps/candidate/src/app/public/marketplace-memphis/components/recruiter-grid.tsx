"use client";

import RecruiterCardMemphis from "./recruiter-card-memphis";
import type { Recruiter } from "../marketplace-memphis-client";

interface RecruiterGridProps {
    recruiters: Recruiter[];
    selectedRecruiter: Recruiter | null;
    onSelect: (recruiter: Recruiter) => void;
}

export default function RecruiterGrid({
    recruiters,
    selectedRecruiter,
    onSelect,
}: RecruiterGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recruiters.map((recruiter, index) => (
                <RecruiterCardMemphis
                    key={recruiter.id}
                    recruiter={recruiter}
                    isSelected={selectedRecruiter?.id === recruiter.id}
                    onClick={() => onSelect(recruiter)}
                    index={index}
                />
            ))}
        </div>
    );
}
