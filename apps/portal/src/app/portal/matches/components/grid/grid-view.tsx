"use client";

import type { EnrichedMatch } from "../../types";
import { GridCard } from "./grid-card";
import { MatchDetailLoader } from "../shared/match-detail-loader";

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
        <div className="relative">
            {/* Grid */}
            <div className="grid gap-4 w-full grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {matches.map((match) => (
                    <GridCard
                        key={match.id}
                        match={match}
                        isSelected={selectedId === match.id}
                        onSelect={() => onSelect(match)}
                    />
                ))}
            </div>

            {/* Detail Drawer */}
            {selectedMatch && (
                <>
                    <div
                        className="fixed inset-0 bg-black/30 transition-opacity"
                        onClick={() => onSelect(selectedMatch)}
                    />
                    <div className="fixed top-0 right-0 h-full w-full md:w-[480px] lg:w-[540px] bg-base-100 shadow-2xl border-l border-base-300 overflow-y-auto animate-slide-in-right">
                        <MatchDetailLoader
                            matchId={selectedMatch.id}
                            isPartner={isPartner}
                            onClose={() => onSelect(selectedMatch)}
                            onDismiss={onDismiss}
                            dismissing={dismissing}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
