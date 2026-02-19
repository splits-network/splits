"use client";

import type { Candidate } from "../../types";
import { MobileDetailOverlay } from "@/components/standard-lists";
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
    const selectedCandidate = candidates.find((c) => c.id === selectedId) ?? null;

    return (
        <div className="flex gap-6">
            {/* Card grid -- hidden on mobile when a detail is open */}
            <div
                className={`flex flex-col w-full ${selectedCandidate ? "hidden md:flex" : "flex"}`}
            >
                <div
                    className={`grid gap-4 w-full ${
                        selectedCandidate
                            ? "grid-cols-1 lg:grid-cols-2 3xl:grid-cols-3"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5"
                    }`}
                >
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

            {/* Detail sidebar -- 50% width on desktop, full-screen overlay on mobile */}
            {selectedCandidate && (
                <MobileDetailOverlay
                    isOpen
                    className="md:w-1/2 md:border-2 md:border-base-300 md:flex-shrink-0 md:self-start bg-base-100"
                >
                    <DetailLoader
                        candidateId={selectedCandidate.id}
                        onClose={() => onSelect(selectedCandidate)}
                        onRefresh={onRefresh}
                    />
                </MobileDetailOverlay>
            )}
        </div>
    );
}
