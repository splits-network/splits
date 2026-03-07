"use client";

import type { Firm } from "../../types";
import { FirmDetailLoader } from "../shared/firm-detail-loader";
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
        <div className="drawer drawer-end">
            <input type="checkbox" className="drawer-toggle" checked={!!selectedFirm} readOnly />
            <div className="drawer-content">
                {/* Grid */}
                <div className="grid gap-4 w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4">
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
            <div className="drawer-side z-50">
                <div className="drawer-overlay" onClick={() => selectedFirm && onSelectAction(selectedFirm)} aria-label="close drawer" />
                <div className="bg-base-100 w-full md:w-1/2 min-h-full overflow-y-auto shadow-2xl">
                    {selectedFirm && (
                        <FirmDetailLoader
                            firmId={selectedFirm.id}
                            onClose={() => onSelectAction(selectedFirm)}
                            onRefresh={onRefreshAction}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
