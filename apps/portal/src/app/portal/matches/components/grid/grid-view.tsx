"use client";

import type { EnrichedMatch } from "../../types";
import { MobileDetailOverlay } from "@/components/standard-lists";
import { GridCard } from "./grid-card";
import { MatchDetailPanel } from "../shared/match-detail-panel";

export function GridView({
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
        <div className="flex gap-6">
            {/* Card grid -- hidden on mobile when a detail is open */}
            <div
                className={`flex flex-col w-full ${selectedMatch ? "hidden md:flex" : "flex"}`}
            >
                <div
                    className={`grid gap-4 w-full ${
                        selectedMatch
                            ? "grid-cols-1 lg:grid-cols-2 3xl:grid-cols-3"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5"
                    }`}
                >
                    {matches.map((match) => (
                        <GridCard
                            key={match.id}
                            match={match}
                            isSelected={selectedId === match.id}
                            onSelect={() => onSelect(match)}
                        />
                    ))}
                </div>
            </div>

            {/* Detail sidebar -- 50% width on desktop, full-screen overlay on mobile */}
            {selectedMatch && (
                <MobileDetailOverlay
                    isOpen
                    className="md:w-1/2 md:border-2 md:border-base-300 md:flex-shrink-0 md:self-start bg-base-100"
                >
                    <MatchDetailPanel
                        match={selectedMatch}
                        isPartner={isPartner}
                        onClose={() => onSelect(selectedMatch)}
                        onDismiss={onDismiss}
                        dismissing={dismissing}
                    />
                </MobileDetailOverlay>
            )}
        </div>
    );
}
