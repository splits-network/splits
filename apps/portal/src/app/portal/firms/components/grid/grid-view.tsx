"use client";

import type { Firm } from "../../types";
import { MobileDetailOverlay } from "@/components/standard-lists";
import { FirmDetailLoader } from "../shared/firm-detail";
import { GridCard } from "./grid-card";

export function GridView({
    firms,
    onSelectAction,
    selectedId,
    onRefreshAction,
}: {
    firms: Firm[];
    onSelectAction: (t: Firm) => void;
    selectedId: string | null;
    onRefreshAction?: () => void;
}) {
    const selectedFirm = firms.find((t) => t.id === selectedId) ?? null;

    return (
        <div className="flex gap-6">
            {/* Card grid -- hidden on mobile when a detail is open */}
            <div
                className={`flex flex-col w-full ${selectedFirm ? "hidden md:flex" : "flex"}`}
            >
                <div
                    className={`grid gap-4 w-full ${
                        selectedFirm
                            ? "grid-cols-1 lg:grid-cols-2 3xl:grid-cols-3"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5"
                    }`}
                >
                    {firms.map((firm) => (
                        <GridCard
                            key={firm.id}
                            firm={firm}
                            isSelected={selectedId === firm.id}
                            onSelect={() => onSelectAction(firm)}
                            onRefresh={onRefreshAction}
                        />
                    ))}
                </div>
            </div>

            {/* Detail sidebar -- 50% width on desktop, full-screen overlay on mobile */}
            {selectedFirm && (
                <MobileDetailOverlay
                    isOpen
                    className="md:w-1/2 md:border-2 md:border-base-300 md:flex-shrink-0 md:self-start bg-base-100"
                >
                    <FirmDetailLoader
                        firmId={selectedFirm.id}
                        onClose={() => onSelectAction(selectedFirm)}
                        onRefresh={onRefreshAction}
                    />
                </MobileDetailOverlay>
            )}
        </div>
    );
}
