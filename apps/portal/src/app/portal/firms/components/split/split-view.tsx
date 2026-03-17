"use client";

import type { Firm } from "../../types";
import { BaselSplitView } from "@splits-network/basel-ui";
import { FirmDetailLoader } from "../shared/firm-detail-loader";
import { SplitItem } from "./split-item";

export function SplitView({
    firms,
    onSelect,
    selectedId,
    onRefresh,
}: {
    firms: Firm[];
    onSelect: (t: Firm) => void;
    selectedId: string | null;
    onRefresh?: () => void;
}) {
    return (
        <BaselSplitView
            items={firms}
            selectedId={selectedId}
            getItemId={(f) => f.id}
            estimatedItemHeight={80}
            renderItem={(firm, isSelected) => (
                <SplitItem
                    firm={firm}
                    isSelected={isSelected}
                    onSelect={() => onSelect(firm)}
                />
            )}
            renderDetail={(firm) => (
                <FirmDetailLoader
                    firmId={firm.id}
                    onClose={() => onSelect(firm)}
                    onRefresh={onRefresh}
                />
            )}
            emptyIcon="fa-hand-pointer"
            emptyTitle="Select a firm to view details"
            initialListWidth={25}
            onMobileClose={() => {
                const selected = firms.find((f) => f.id === selectedId);
                if (selected) onSelect(selected);
            }}
        />
    );
}
