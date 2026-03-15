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
    onUpdateItem,
}: {
    candidates: Candidate[];
    onSelect: (c: Candidate) => void;
    selectedId: string | null;
    onRefresh?: () => void;
    onUpdateItem?: (id: string, patch: Partial<Candidate>) => void;
}) {
    const selectedCandidate = candidates.find((c) => c.id === selectedId) ?? null;

    return (
        <div className="flex border-2 border-base-300" style={{ minHeight: 600 }}>
            {/* Left list -- hidden on mobile when a candidate is selected */}
            <div
                className={`w-full md:w-1/3 border-r border-base-300 overflow-y-auto ${
                    selectedId ? "hidden md:block" : "block"
                }`}
            >
                {candidates.map((candidate) => (
                    <SplitItem
                        key={candidate.id}
                        candidate={candidate}
                        isSelected={selectedId === candidate.id}
                        onSelect={() => onSelect(candidate)}
                        onUpdateItem={onUpdateItem}
                    />
                ))}
            </div>

            {/* Right detail -- MobileDetailOverlay handles mobile portal */}
            <MobileDetailOverlay
                isOpen={!!selectedCandidate}
                className="md:w-2/3 w-full bg-base-100"
            >
                {selectedCandidate ? (
                    <DetailLoader
                        candidateId={selectedCandidate.id}
                        onClose={() => onSelect(selectedCandidate)}
                        onRefresh={onRefresh}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center p-12">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-user text-2xl text-primary" />
                            </div>
                            <h3 className="font-black text-xl tracking-tight mb-2">Select a Candidate</h3>
                            <p className="text-sm text-base-content/50">Click a candidate on the left to view their profile</p>
                        </div>
                    </div>
                )}
            </MobileDetailOverlay>
        </div>
    );
}
