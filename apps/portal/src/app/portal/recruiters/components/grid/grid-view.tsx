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
        <div className="relative">
            {/* Masonry Grid */}
            <div className="columns-1 sm:columns-2 lg:columns-3 3xl:columns-4 gap-4 w-full">
                {recruiters.map((recruiter) => (
                    <div key={recruiter.id} className="break-inside-avoid mb-4">
                        <GridCard
                            recruiter={recruiter}
                            isSelected={selectedId === recruiter.id}
                            onSelect={() => onSelectAction(recruiter)}
                            onRefresh={onRefreshAction}
                        />
                    </div>
                ))}
            </div>

            {/* Detail Drawer */}
            {selectedRecruiter && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40 bg-black/30 transition-opacity"
                        onClick={() => onSelectAction(selectedRecruiter)}
                    />

                    {/* Slide-over Panel */}
                    <div className="fixed top-0 right-0 z-50 h-full w-full md:w-[480px] lg:w-[540px] bg-base-100 shadow-2xl border-l border-base-300 overflow-y-auto animate-slide-in-right">
                        <DetailLoader
                            recruiterId={selectedRecruiter.id}
                            onClose={() => onSelectAction(selectedRecruiter)}
                            onRefresh={onRefreshAction}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
