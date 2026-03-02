"use client";

import type { Firm } from "../../types";
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
        <div className="relative">
            {/* Grid */}
            <div className="grid gap-4 w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5">
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

            {/* Detail Drawer */}
            {selectedFirm && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/30 transition-opacity"
                        onClick={() => onSelectAction(selectedFirm)}
                    />
                    <div className="fixed top-0 right-0 z-50 h-full w-full md:w-[480px] lg:w-[540px] bg-base-100 shadow-2xl border-l border-base-300 overflow-y-auto animate-slide-in-right">
                        <FirmDetailLoader
                            firmId={selectedFirm.id}
                            onClose={() => onSelectAction(selectedFirm)}
                            onRefresh={onRefreshAction}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
