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
        <div className="drawer drawer-end">
            <input type="checkbox" className="drawer-toggle" checked={!!selectedMatch} readOnly />
            <div className="drawer-content">
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
            </div>
            <div className="drawer-side z-50">
                <div className="drawer-overlay" onClick={() => selectedMatch && onSelect(selectedMatch)} aria-label="close drawer" />
                <div className="bg-base-100 w-full md:w-1/2 min-h-full overflow-y-auto shadow-2xl">
                    {selectedMatch && (
                        <MatchDetailLoader
                            matchId={selectedMatch.id}
                            isPartner={isPartner}
                            onClose={() => onSelect(selectedMatch)}
                            onDismiss={onDismiss}
                            dismissing={dismissing}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
