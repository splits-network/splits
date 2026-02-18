"use client";

import type { RecruiterWithUser } from "../../types";
import { ACCENT, accentAt } from "../shared/accent";
import { DetailLoader } from "../shared/recruiter-detail";
import { GridCard } from "./grid-card";

export function GridView({
    recruiters,
    onSelectAction,
    selectedId,
    onRefreshAction,
}: {
    recruiters: RecruiterWithUser[];
    onSelectAction: (r: RecruiterWithUser) => void;
    selectedId: string | null;
    onRefreshAction?: () => void;
}) {
    const selectedRecruiter = recruiters.find((r) => r.id === selectedId);
    const selectedAc = selectedRecruiter
        ? accentAt(recruiters.indexOf(selectedRecruiter))
        : ACCENT[0];

    return (
        <div className="flex gap-6">
            <div className="flex flex-col w-full">
                <div
                    className={`grid gap-4 w-full ${
                        selectedRecruiter
                            ? "grid-cols-1 lg:grid-cols-2 3xl:grid-cols-3"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5"
                    }`}
                >
                    {recruiters.map((recruiter, idx) => (
                        <GridCard
                            key={recruiter.id}
                            recruiter={recruiter}
                            accent={accentAt(idx)}
                            isSelected={selectedId === recruiter.id}
                            onSelect={() => onSelectAction(recruiter)}
                            onRefresh={onRefreshAction}
                        />
                    ))}
                </div>
            </div>

            {/* Detail Sidebar */}
            {selectedRecruiter && (
                <div
                    className={`w-1/2 border-4 flex-shrink-0 self-start bg-white ${selectedAc.border}`}
                >
                    <DetailLoader
                        recruiterId={selectedRecruiter.id}
                        accent={selectedAc}
                        onClose={() => onSelectAction(selectedRecruiter)}
                        onRefresh={onRefreshAction}
                    />
                </div>
            )}
        </div>
    );
}
