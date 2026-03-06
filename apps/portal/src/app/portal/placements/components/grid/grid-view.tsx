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
        <div className="relative">
            {/* Grid */}
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

            {/* Detail Drawer */}
            {selectedPlacement && (
                <>
                    <div
                        className="fixed inset-0 bg-black/30 transition-opacity"
                        onClick={() => onSelect(selectedPlacement)}
                    />
                    <div className="fixed top-0 right-0 h-full w-full md:w-1/2 bg-base-100 shadow-2xl border-l border-base-300 overflow-y-auto animate-slide-in-right">
                        <DetailLoader
                            placementId={selectedPlacement.id}
                            onClose={() => onSelect(selectedPlacement)}
                            onRefresh={onRefresh}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
