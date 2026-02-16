"use client";

import type { Candidate } from "../../types";
import { ACCENT, accentAt } from "../shared/accent";
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
    const selectedCandidate = candidates.find((c) => c.id === selectedId);
    const selectedAc = selectedCandidate
        ? accentAt(candidates.indexOf(selectedCandidate))
        : ACCENT[0];

    return (
        <div className="flex gap-6">
            <div className="flex flex-col w-full">
                <div
                    className={`grid gap-4 w-full ${
                        selectedCandidate
                            ? "grid-cols-1 lg:grid-cols-2"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    }`}
                >
                    {candidates.map((candidate, idx) => (
                        <GridCard
                            key={candidate.id}
                            candidate={candidate}
                            accent={accentAt(idx)}
                            isSelected={selectedId === candidate.id}
                            onSelect={() => onSelect(candidate)}
                            onRefresh={onRefresh}
                        />
                    ))}
                </div>
            </div>

            {/* Detail Sidebar */}
            {selectedCandidate && (
                <div
                    className={`w-1/2 border-4 flex-shrink-0 self-start bg-white overflow-y-auto ${selectedAc.border}`}
                    style={{ maxHeight: 800 }}
                >
                    <DetailLoader
                        candidateId={selectedCandidate.id}
                        accent={selectedAc}
                        onClose={() => onSelect(selectedCandidate)}
                        onRefresh={onRefresh}
                    />
                </div>
            )}
        </div>
    );
}
