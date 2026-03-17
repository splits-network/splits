"use client";

import type { Placement } from "../../types";
import { BaselSplitView } from "@splits-network/basel-ui";
import { DetailLoader } from "../shared/placement-detail";
import { SplitItem } from "./split-item";

export function SplitView({
    placements,
    onSelect,
    selectedId,
    onRefresh,
}: {
    placements: Placement[];
    onSelect: (p: Placement) => void;
    selectedId: string | null;
    onRefresh?: () => void;
}) {
    return (
        <BaselSplitView
            items={placements}
            selectedId={selectedId}
            getItemId={(p) => p.id}
            estimatedItemHeight={90}
            renderItem={(placement, isSelected) => (
                <SplitItem
                    placement={placement}
                    isSelected={isSelected}
                    onSelect={() => onSelect(placement)}
                />
            )}
            renderDetail={(placement) => (
                <DetailLoader
                    placementId={placement.id}
                    onClose={() => onSelect(placement)}
                    onRefresh={onRefresh}
                />
            )}
            emptyIcon="fa-hand-pointer"
            emptyTitle="Select a placement to view details"
            initialListWidth={40}
            onMobileClose={() => {
                const selected = placements.find((p) => p.id === selectedId);
                if (selected) onSelect(selected);
            }}
        />
    );
}
