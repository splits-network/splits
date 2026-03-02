"use client";

import type { PublicFirm } from "../../types";
import { GridCard } from "./grid-card";
import { FirmDetailPanel } from "../shared/firm-detail-panel";
import { MobileDetailOverlay } from "@/components/standard-lists";

interface GridViewProps {
    firms: PublicFirm[];
    selectedId: string | null;
    onSelect: (firm: PublicFirm) => void;
}

export function GridView({ firms, selectedId, onSelect }: GridViewProps) {
    const selectedFirm = firms.find((f) => f.id === selectedId) ?? null;

    return (
        <div className="flex gap-6">
            {/* Card grid */}
            <div
                className={`flex flex-col w-full ${selectedFirm ? "hidden md:flex" : "flex"}`}
            >
                <div
                    className={`grid gap-4 w-full ${
                        selectedFirm
                            ? "grid-cols-1 lg:grid-cols-2 3xl:grid-cols-3"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    }`}
                >
                    {firms.map((firm) => (
                        <GridCard
                            key={firm.id}
                            firm={firm}
                            isSelected={selectedId === firm.id}
                            onSelect={() => onSelect(firm)}
                        />
                    ))}
                </div>
            </div>

            {/* Detail sidebar */}
            {selectedFirm && (
                <MobileDetailOverlay
                    isOpen={!!selectedFirm}
                    className="md:w-1/2 md:border-2 md:border-base-300 md:flex-shrink-0 md:self-start bg-base-100"
                >
                    <FirmDetailPanel
                        firm={selectedFirm}
                        onClose={() => onSelect(selectedFirm)}
                    />
                </MobileDetailOverlay>
            )}
        </div>
    );
}
