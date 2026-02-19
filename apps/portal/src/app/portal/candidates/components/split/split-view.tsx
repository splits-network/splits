"use client";

import type { Candidate } from "../../types";
import { MobileDetailOverlay } from "@/components/standard-lists";
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
    const selectedCandidate = candidates.find((c) => c.id === selectedId) ?? null;

    return (
        <div className="flex border-2 border-base-300" style={{ minHeight: 600 }}>
            {/* Left list -- hidden on mobile when a candidate is selected */}
            <div
                className={`w-full md:w-2/5 border-r-2 border-base-300 overflow-y-auto ${
                    selectedId ? "hidden md:block" : "block"
                }`}
            >
                {candidates.map((candidate) => (
                    <SplitItem
                        key={candidate.id}
                        candidate={candidate}
                        isSelected={selectedId === candidate.id}
                        onSelect={() => onSelect(candidate)}
                    />
                ))}
            </div>

            {/* Right detail -- MobileDetailOverlay handles mobile portal */}
            <MobileDetailOverlay
                isOpen={!!selectedCandidate}
                className="md:w-3/5 w-full bg-base-100"
            >
                {selectedCandidate ? (
                    <DetailLoader
                        candidateId={selectedCandidate.id}
                        onClose={() => onSelect(selectedCandidate)}
                        onRefresh={onRefresh}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center p-12">
                        <div className="text-center">
                            <i className="fa-duotone fa-regular fa-hand-pointer text-5xl text-base-content/30 mb-4" />
                            <h3 className="font-bold text-base text-base-content/30 tracking-tight">
                                Select a candidate to view details
                            </h3>
                        </div>
                    </div>
                )}
            </MobileDetailOverlay>
        </div>
    );
}
