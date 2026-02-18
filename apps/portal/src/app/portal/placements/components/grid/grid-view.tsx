"use client";

import type { Placement } from "../../types";
import { ACCENT, accentAt } from "../shared/accent";
import { MobileDetailOverlay } from "@/components/standard-lists";
import { GridCard } from "./grid-card";
import { DetailLoader } from "../shared/detail-loader";

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
    const selectedPlacement = placements.find((p) => p.id === selectedId);
    const selectedAc = selectedPlacement
        ? accentAt(placements.indexOf(selectedPlacement))
        : ACCENT[0];

    return (
        <div className="flex gap-6">
            <div className={`flex flex-col w-full ${selectedPlacement ? "hidden md:flex" : "flex"}`}>
                <div
                    className={`grid gap-4 w-full ${
                        selectedPlacement
                            ? "grid-cols-1 lg:grid-cols-2"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    }`}
                >
                    {placements.map((placement, idx) => (
                        <GridCard
                            key={placement.id}
                            placement={placement}
                            accent={accentAt(idx)}
                            isSelected={selectedId === placement.id}
                            onSelectAction={() => onSelect(placement)}
                        />
                    ))}
                </div>
            </div>

            {/* Detail Sidebar */}
            {selectedPlacement && (
                <MobileDetailOverlay
                    isOpen
                    className={`md:w-1/2 md:border-4 md:flex-shrink-0 md:self-start bg-white ${selectedAc.border}`}
                >
                    <DetailLoader
                        placement={selectedPlacement}
                        accent={selectedAc}
                        onCloseAction={() => onSelect(selectedPlacement)}
                    />
                </MobileDetailOverlay>
            )}
        </div>
    );
}
