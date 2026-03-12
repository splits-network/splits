"use client";

import { useEffect } from "react";
import { useDrawer } from "@/contexts";
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
    const { open, close } = useDrawer();

    useEffect(() => {
        if (selectedMatch) {
            open(
                <MatchDetailLoader
                    matchId={selectedMatch.id}
                    isPartner={isPartner}
                    onClose={() => onSelect(selectedMatch)}
                    onDismiss={onDismiss}
                    dismissing={dismissing}
                />,
            );
        } else {
            close();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedMatch?.id]);

    return (
        <div className="grid gap-4 w-full grid-cols-1 md:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4">
            {matches.map((match) => (
                <GridCard
                    key={match.id}
                    match={match}
                    isSelected={selectedId === match.id}
                    onSelect={() => onSelect(match)}
                />
            ))}
        </div>
    );
}
