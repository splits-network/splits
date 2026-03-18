"use client";

import type { EnrichedMatch } from "../../types";
import { BaselSplitView } from "@splits-network/basel-ui";
import { MatchDetailLoader } from "../shared/match-detail-loader";
import { SplitItem } from "./split-item";

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
    return (
        <BaselSplitView
            items={matches}
            selectedId={selectedId}
            getItemId={(m) => m.id}
            estimatedItemHeight={90}
            renderItem={(match, isSelected) => (
                <SplitItem
                    match={match}
                    isSelected={isSelected}
                    onSelect={() => onSelect(match)}
                />
            )}
            renderDetail={(match) => (
                <MatchDetailLoader
                    matchId={match.id}
                    isPartner={isPartner}
                    onClose={() => onSelect(match)}
                    onDismiss={onDismiss}
                    dismissing={dismissing}
                />
            )}
            emptyIcon="fa-hand-pointer"
            emptyTitle="Select a match to view details"
            onMobileClose={() => {
                const selected = matches.find((m) => m.id === selectedId);
                if (selected) onSelect(selected);
            }}
        />
    );
}
