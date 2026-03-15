"use client";

import { useEffect, useRef } from "react";
import { useDrawer } from "@/contexts";
import type { Placement } from "../../types";
import { GridCard } from "./grid-card";
import { DetailLoader } from "../shared/placement-detail";

export function GridView({
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
    const selectedPlacement =
        placements.find((p) => p.id === selectedId) ?? null;
    const { open, close, isOpen } = useDrawer();
    const wasOpen = useRef(false);

    useEffect(() => {
        if (wasOpen.current && !isOpen && selectedPlacement) {
            onSelect(selectedPlacement);
        }
        wasOpen.current = isOpen;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    useEffect(() => {
        if (selectedPlacement) {
            open(
                <DetailLoader
                    placementId={selectedPlacement.id}
                    onClose={() => onSelect(selectedPlacement)}
                    onRefresh={onRefresh}
                />,
            );
        } else {
            close();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPlacement?.id]);

    return (
        <div className="grid gap-4 w-full grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
            {placements.map((placement) => (
                <GridCard
                    key={placement.id}
                    placement={placement}
                    isSelected={selectedId === placement.id}
                    onSelect={() => onSelect(placement)}
                />
            ))}
        </div>
    );
}
