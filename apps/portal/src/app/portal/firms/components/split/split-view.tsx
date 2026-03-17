"use client";

import type { Firm } from "../../types";
import { MobileDetailOverlay } from "@/components/standard-lists";
import { FirmDetailLoader } from "../shared/firm-detail-loader";
import { SplitItem } from "./split-item";

export function SplitView({
    firms,
    onSelect,
    selectedId,
    onRefresh,
}: {
    firms: Firm[];
    onSelect: (t: Firm) => void;
    selectedId: string | null;
    onRefresh?: () => void;
}) {
    const selectedFirm = firms.find((t) => t.id === selectedId) ?? null;

    return (
        <div className="p-4">
            <div
                className="flex border-2 border-base-300"
                style={{ minHeight: 600 }}
            >
                {/* Left list -- hidden on mobile when a firm is selected */}
                <div
                    className={`w-full md:w-1/4 border-r-2 border-base-300 overflow-y-auto ${
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

                {/* Right detail -- MobileDetailOverlay handles mobile portal */}
                <MobileDetailOverlay
                    isOpen={!!selectedFirm}
                    className="md:w-3/4 w-full bg-base-100"
                >
                    {selectedFirm ? (
                        <FirmDetailLoader
                            firmId={selectedFirm.id}
                            onClose={() => onSelect(selectedFirm)}
                            onRefresh={onRefresh}
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center p-12">
                            <div className="text-center">
                                <i className="fa-duotone fa-regular fa-hand-pointer text-5xl text-base-content/30 mb-4" />
                                <h3 className="font-bold text-base text-base-content/30 tracking-tight">
                                    Select a firm to view details
                                </h3>
                            </div>
                        </div>
                    )}
                </MobileDetailOverlay>
            </div>
        </div>
    );
}
