"use client";

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

    return (
        <div className="drawer drawer-end">
            <input type="checkbox" className="drawer-toggle" checked={!!selectedPlacement} readOnly />
            <div className="drawer-content">
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
            </div>
            <div className="drawer-side z-50">
                <div className="drawer-overlay" onClick={() => selectedPlacement && onSelect(selectedPlacement)} aria-label="close drawer" />
                <div className="bg-base-100 w-full md:w-1/2 min-h-full overflow-y-auto shadow-2xl">
                    {selectedPlacement && (
                        <DetailLoader
                            placementId={selectedPlacement.id}
                            onClose={() => onSelect(selectedPlacement)}
                            onRefresh={onRefresh}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
