"use client";

import type { PublicFirm } from "../../types";
import { SplitItem } from "./split-item";
import { FirmDetailPanel } from "../shared/firm-detail-panel";

interface SplitViewProps {
    firms: PublicFirm[];
    selectedId: string | null;
    onSelect: (firm: PublicFirm) => void;
}

export function SplitView({ firms, selectedId, onSelect }: SplitViewProps) {
    const selectedFirm = firms.find((f) => f.id === selectedId) ?? null;

    return (
        <div
            className="flex border-2 border-base-300"
            style={{ minHeight: 600 }}
        >
            {/* Left list (40%) */}
            <div
                className={`w-full md:w-2/5 border-r-2 border-base-300 overflow-y-auto ${
                    selectedId ? "hidden md:block" : "block"
                }`}
            >
                {firms.map((firm) => (
                    <SplitItem
                        key={firm.id}
                        firm={firm}
                        isSelected={selectedId === firm.id}
                        onSelect={() => onSelect(firm)}
                    />
                ))}
            </div>

            {/* Right detail (60%) */}
            <div className="flex-1 bg-base-100">
                {selectedFirm ? (
                    <>
                        {/* Mobile: full-screen overlay */}
                        <div className="fixed inset-0 z-[999] flex flex-col bg-base-100 md:hidden">
                            <div className="flex-1 overflow-y-auto">
                                <FirmDetailPanel
                                    firm={selectedFirm}
                                    onClose={() => onSelect(selectedFirm)}
                                />
                            </div>
                        </div>

                        {/* Desktop: inline panel */}
                        <div className="hidden md:block h-full overflow-y-auto">
                            <FirmDetailPanel
                                firm={selectedFirm}
                                onClose={() => onSelect(selectedFirm)}
                            />
                        </div>
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center p-12">
                        <div className="text-center">
                            <i className="fa-duotone fa-regular fa-hand-pointer text-5xl text-base-content/20 mb-4 block" />
                            <h3 className="font-bold text-base text-base-content/30 tracking-tight">
                                Select a firm to view details
                            </h3>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
