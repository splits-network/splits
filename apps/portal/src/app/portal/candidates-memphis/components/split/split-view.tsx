"use client";

import type { Candidate } from "../../types";
import { ACCENT, accentAt } from "../shared/accent";
import { DetailLoader } from "../shared/candidate-detail";
import { SplitItem } from "./split-item";

export function SplitView({
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
        <div className="flex gap-0 border-4 border-dark" style={{ minHeight: 600 }}>
            {/* Left list */}
            <div className="w-2/5 border-r-4 border-dark overflow-y-auto">
                {candidates.map((candidate, idx) => (
                    <SplitItem
                        key={candidate.id}
                        candidate={candidate}
                        accent={accentAt(idx)}
                        isSelected={selectedId === candidate.id}
                        onSelect={() => onSelect(candidate)}
                    />
                ))}
            </div>

            {/* Right detail */}
            <div className="w-3/5 bg-white overflow-y-auto">
                {selectedCandidate ? (
                    <DetailLoader
                        candidateId={selectedCandidate.id}
                        accent={selectedAc}
                        onClose={() => onSelect(selectedCandidate)}
                        onRefresh={onRefresh}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center p-12">
                        <div className="text-center">
                            <div className="flex justify-center gap-3 mb-6">
                                <div className="w-8 h-8 rotate-12 bg-coral" />
                                <div className="w-8 h-8 rounded-full bg-teal" />
                                <div className="w-8 h-8 rotate-45 bg-yellow" />
                            </div>
                            <h3 className="font-black text-xl uppercase tracking-tight mb-2 text-dark">
                                Select a Candidate
                            </h3>
                            <p className="text-sm text-dark/50">
                                Click a candidate on the left to view details
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
