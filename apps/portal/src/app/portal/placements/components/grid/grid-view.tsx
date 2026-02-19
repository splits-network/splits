"use client";

import type { Placement } from "../../types";
import { MobileDetailOverlay } from "@/components/standard-lists";
import { GridCard } from "./grid-card";
import { DetailPanel } from "../shared/detail-panel";

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
    const selectedPlacement = placements.find((p) => p.id === selectedId) ?? null;

    return (
        <div className="flex gap-6">
            {/* Card grid — hidden on mobile when a detail is open */}
            <div
                className={`flex flex-col w-full ${selectedPlacement ? "hidden md:flex" : "flex"}`}
            >
                <div
                    className={`grid gap-4 w-full ${
                        selectedPlacement
                            ? "grid-cols-1 lg:grid-cols-2 3xl:grid-cols-3"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5"
                    }`}
                >
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

            {/* Detail sidebar — 50% width on desktop, full-screen overlay on mobile */}
            {selectedPlacement && (
                <MobileDetailOverlay
                    isOpen
                    className="md:w-1/2 md:border-2 md:border-base-300 md:flex-shrink-0 md:self-start bg-base-100"
                >
                    <DetailPanel
                        placement={selectedPlacement}
                        onClose={() => onSelect(selectedPlacement)}
                    />
                </MobileDetailOverlay>
            )}
        </div>
    );
}
