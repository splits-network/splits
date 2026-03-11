"use client";

import type { Candidate } from "../../types";
import { DetailLoader } from "../shared/candidate-detail";
import { GridCard } from "./grid-card";

export function GridView({
    candidates,
    onSelect,
    selectedId,
    onRefresh,
}: {
    candidates: Candidate[];
    onSelect: (c: Candidate) => void;
    selectedId: string | null;
    onRefresh?: () => void;
}) {
    const selectedCandidate =
        candidates.find((c) => c.id === selectedId) ?? null;

    return (
        <div className="drawer drawer-end">
            <input
                type="checkbox"
                className="drawer-toggle"
                checked={!!selectedCandidate}
                readOnly
            />
            <div className="drawer-content">
                {/* Grid */}
                <div className="grid gap-4 w-full grid-cols-1 md:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4">
                    {candidates.map((candidate) => (
                        <GridCard
                            key={candidate.id}
                            candidate={candidate}
                            isSelected={selectedId === candidate.id}
                            onSelect={() => onSelect(candidate)}
                            onRefresh={onRefresh}
                        />
                    ))}
                </div>
            </div>
            <div className="drawer-side z-50">
                <div
                    className="drawer-overlay"
                    onClick={() =>
                        selectedCandidate && onSelect(selectedCandidate)
                    }
                    aria-label="close drawer"
                />
                <div className="bg-base-100 w-full md:w-1/2 min-h-full overflow-y-auto shadow-2xl">
                    {selectedCandidate && (
                        <DetailLoader
                            candidateId={selectedCandidate.id}
                            onClose={() => onSelect(selectedCandidate)}
                            onRefresh={onRefresh}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
