"use client";

import type { RecruiterWithUser } from "../../types";
import { DetailLoader } from "../shared/recruiter-detail";
import { MobileDetailOverlay } from "@/components/standard-lists";
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
        <div className="flex gap-6">
            <div
                className={`flex flex-col w-full ${selectedRecruiter ? "hidden md:flex" : "flex"}`}
            >
                <div
                    className={`grid gap-4 w-full ${
                        selectedRecruiter
                            ? "grid-cols-1 lg:grid-cols-2 3xl:grid-cols-3"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5"
                    }`}
                >
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

            {/* Detail Sidebar */}
            {selectedRecruiter && (
                <MobileDetailOverlay
                    isOpen
                    className="md:w-1/2 md:border-2 md:border-base-300 md:flex-shrink-0 md:self-start bg-base-100 shadow-sm"
                >
                    <DetailLoader
                        recruiterId={selectedRecruiter.id}
                        onClose={() => onSelectAction(selectedRecruiter)}
                        onRefresh={onRefreshAction}
                    />
                </MobileDetailOverlay>
            )}
        </div>
    );
}
