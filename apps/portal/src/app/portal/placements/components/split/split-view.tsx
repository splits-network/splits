"use client";

import type { Placement } from "../../types";
import { MobileDetailOverlay } from "@/components/standard-lists";
import { SplitItem } from "./split-item";
import { DetailPanel } from "../shared/detail-panel";

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
    const selectedPlacement = placements.find((p) => p.id === selectedId) ?? null;

    return (
        <div className="flex border-2 border-base-300" style={{ minHeight: 600 }}>
            {/* Left list — hidden on mobile when a placement is selected */}
            <div
                className={`w-full md:w-2/5 border-r-2 border-base-300 overflow-y-auto ${
                    selectedId ? "hidden md:block" : "block"
                }`}
            >
                {placements.map((placement) => (
                    <SplitItem
                        key={placement.id}
                        placement={placement}
                        isSelected={selectedId === placement.id}
                        onSelect={() => onSelect(placement)}
                    />
                ))}
            </div>

            {/* Right detail — MobileDetailOverlay handles mobile portal */}
            <MobileDetailOverlay
                isOpen={!!selectedPlacement}
                className="md:w-3/5 w-full bg-base-100"
            >
                {selectedPlacement ? (
                    <DetailPanel
                        placement={selectedPlacement}
                        onClose={() => onSelect(selectedPlacement)}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center p-12">
                        <div className="text-center">
                            <i className="fa-duotone fa-regular fa-hand-pointer text-5xl text-base-content/30 mb-4" />
                            <h3 className="font-bold text-base text-base-content/30 tracking-tight">
                                Select a placement to view details
                            </h3>
                        </div>
                    </div>
                )}
            </MobileDetailOverlay>
        </div>
    );
}
