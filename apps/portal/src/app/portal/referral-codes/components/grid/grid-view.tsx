"use client";

import type { RecruiterCode } from "../../types";
import { ReferralCodeDetailLoader } from "../shared/referral-code-detail-loader";
import { GridCard } from "./grid-card";

export function GridView({
    codes,
    onSelect,
    selectedId,
    onRefresh,
}: {
    codes: RecruiterCode[];
    onSelect: (code: RecruiterCode) => void;
    selectedId: string | null;
    onRefresh?: () => void;
}) {
    const selectedCode = codes.find((c) => c.id === selectedId);

    return (
        <div className="drawer drawer-end">
            <input type="checkbox" className="drawer-toggle" checked={!!selectedCode} readOnly />
            <div className="drawer-content">
                <div className="grid gap-4 w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                    {codes.map((code) => (
                        <GridCard
                            key={code.id}
                            code={code}
                            isSelected={selectedId === code.id}
                            onSelect={() => onSelect(code)}
                        />
                    ))}
                </div>
            </div>
            <div className="drawer-side z-50">
                <div className="drawer-overlay" onClick={() => selectedCode && onSelect(selectedCode)} aria-label="close drawer" />
                <div className="bg-base-100 w-full md:w-1/2 min-h-full overflow-y-auto shadow-2xl">
                    {selectedCode && (
                        <ReferralCodeDetailLoader
                            codeId={selectedCode.id}
                            onClose={() => onSelect(selectedCode)}
                            onRefresh={onRefresh}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
