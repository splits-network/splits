"use client";

import { useEffect } from "react";
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
    const { open, close } = useDrawer();

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
        <div className="grid gap-4 w-full grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
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
