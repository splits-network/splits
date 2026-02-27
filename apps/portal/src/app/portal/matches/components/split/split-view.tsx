"use client";

import type { EnrichedMatch } from "../../types";
import { MobileDetailOverlay } from "@/components/standard-lists";
import { SplitItem } from "./split-item";
import { MatchDetailPanel } from "../shared/match-detail-panel";

export function SplitView({
    matches,
    onSelect,
    selectedId,
    isPartner,
    onDismiss,
    dismissing,
}: {
    matches: EnrichedMatch[];
    onSelect: (m: EnrichedMatch) => void;
    selectedId: string | null;
    isPartner: boolean;
    onDismiss?: (id: string) => void;
    dismissing?: boolean;
}) {
    const selectedMatch = matches.find((m) => m.id === selectedId) ?? null;

    return (
        <div className="flex border-2 border-base-300" style={{ minHeight: 600 }}>
            {/* Left list -- hidden on mobile when a match is selected */}
            <div
                className={`w-full md:w-2/5 border-r-2 border-base-300 overflow-y-auto ${
                    selectedId ? "hidden md:block" : "block"
                }`}
            >
                {matches.map((match) => (
                    <SplitItem
                        key={match.id}
                        match={match}
                        isSelected={selectedId === match.id}
                        onSelect={() => onSelect(match)}
                    />
                ))}
            </div>

            {/* Right detail -- MobileDetailOverlay handles mobile portal */}
            <MobileDetailOverlay
                isOpen={!!selectedMatch}
                className="md:w-3/5 w-full bg-base-100"
            >
                {selectedMatch ? (
                    <MatchDetailPanel
                        match={selectedMatch}
                        isPartner={isPartner}
                        onClose={() => onSelect(selectedMatch)}
                        onDismiss={onDismiss}
                        dismissing={dismissing}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center p-12">
                        <div className="text-center">
                            <i className="fa-duotone fa-regular fa-hand-pointer text-5xl text-base-content/30 mb-4" />
                            <h3 className="font-bold text-base text-base-content/30 tracking-tight">
                                Select a match to view details
                            </h3>
                        </div>
                    </div>
                )}
            </MobileDetailOverlay>
        </div>
    );
}
