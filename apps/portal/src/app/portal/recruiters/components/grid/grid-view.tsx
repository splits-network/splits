"use client";

import type { RecruiterWithUser } from "../../types";
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

    return (
        <div className="drawer drawer-end">
            <input type="checkbox" className="drawer-toggle" checked={!!selectedRecruiter} readOnly />
            <div className="drawer-content">
                <div className="grid gap-4 w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
                    {recruiters.map((recruiter) => (
                        <GridCard
                            key={recruiter.id}
                            recruiter={recruiter}
                            isSelected={selectedId === recruiter.id}
                            onSelect={() => onSelectAction(recruiter)}
                            onRefresh={onRefreshAction}
                        />
                    ))}
                </div>
            </div>
            <div className="drawer-side z-50">
                <div className="drawer-overlay" onClick={() => selectedRecruiter && onSelectAction(selectedRecruiter)} aria-label="close drawer" />
                <div className="bg-base-100 w-full md:w-1/2 min-h-full overflow-y-auto shadow-2xl">
                    {selectedRecruiter && (
                        <DetailLoader
                            recruiterId={selectedRecruiter.id}
                            onClose={() => onSelectAction(selectedRecruiter)}
                            onRefresh={onRefreshAction}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
