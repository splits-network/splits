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
        <div className="relative">
            {/* Grid */}
            <div className="grid gap-4 w-full grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
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

            {/* Detail Drawer */}
            {selectedCandidate && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/30 transition-opacity"
                        onClick={() => onSelect(selectedCandidate)}
                    />
                    <div className="fixed top-0 right-0 z-50 h-full w-full md:w-1/2 bg-base-100 shadow-2xl border-l border-base-300 overflow-y-auto animate-slide-in-right">
                        <DetailLoader
                            candidateId={selectedCandidate.id}
                            onClose={() => onSelect(selectedCandidate)}
                            onRefresh={onRefresh}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
