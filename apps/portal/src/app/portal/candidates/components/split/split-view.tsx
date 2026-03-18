"use client";

import type { Candidate } from "../../types";
import { BaselSplitView } from "@splits-network/basel-ui";
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
    return (
        <BaselSplitView
            items={candidates}
            selectedId={selectedId}
            getItemId={(c) => c.id}
            estimatedItemHeight={110}
            renderItem={(candidate, isSelected) => (
                <SplitItem
                    candidate={candidate}
                    isSelected={isSelected}
                    onSelect={() => onSelect(candidate)}
                    onUpdateItem={onUpdateItem}
                />
            )}
            renderDetail={(candidate) => (
                <DetailLoader
                    candidateId={candidate.id}
                    onClose={() => onSelect(candidate)}
                    onRefresh={onRefresh}
                />
            )}
            emptyIcon="fa-user"
            emptyTitle="Select a Candidate"
            emptyDescription="Click a candidate on the left to view their profile"
            onMobileClose={() => {
                const selected = candidates.find((c) => c.id === selectedId);
                if (selected) onSelect(selected);
            }}
        />
    );
}
