"use client";

import type { Placement } from "../../types";
import { accentAt, ACCENT } from "../shared/accent";
import { SplitCard } from "./split-card";
import { DetailLoader } from "../shared/detail-loader";

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
    const selectedPlacement = placements.find((p) => p.id === selectedId);
    const selectedAc = selectedPlacement
        ? accentAt(placements.indexOf(selectedPlacement))
        : ACCENT[0];

    return (
        <div className="flex gap-0 border-4 border-dark" style={{ minHeight: 600 }}>
            {/* Left list */}
            <div className="w-2/5 overflow-y-auto border-r-4 border-dark bg-cream" style={{ maxHeight: "calc(100vh - 16rem)" }}>
                {placements.map((placement, idx) => (
                    <SplitCard
                        key={placement.id}
                        placement={placement}
                        accent={accentAt(idx)}
                        isSelected={selectedId === placement.id}
                        onSelect={() => onSelect(placement)}
                    />
                ))}
            </div>

            {/* Right detail */}
            <div className="w-3/5 overflow-hidden bg-white">
                {selectedPlacement ? (
                    <DetailLoader
                        placement={selectedPlacement}
                        accent={selectedAc}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center p-12">
                        <div className="text-center">
                            {/* Memphis decoration */}
                            <div className="flex justify-center gap-3 mb-6">
                                <div className="w-8 h-8 rotate-12 bg-coral" />
                                <div className="w-8 h-8 rounded-full bg-teal" />
                                <div className="w-8 h-8 rotate-45 bg-yellow" />
                            </div>
                            <h3 className="font-black text-xl uppercase tracking-tight mb-2 text-dark">
                                Select a Placement
                            </h3>
                            <p className="text-sm text-dark/50">
                                Click a placement on the left to view details
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
