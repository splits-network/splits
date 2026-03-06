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
        <div className="relative">
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

            {/* Detail Drawer */}
            {selectedCode && (
                <>
                    <div
                        className="fixed inset-0 bg-black/30 transition-opacity"
                        onClick={() => onSelect(selectedCode)}
                    />
                    <div className="fixed top-0 right-0 h-full w-full md:w-1/2 bg-base-100 shadow-2xl border-l border-base-300 overflow-y-auto animate-slide-in-right">
                        <ReferralCodeDetailLoader
                            codeId={selectedCode.id}
                            onClose={() => onSelect(selectedCode)}
                            onRefresh={onRefresh}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
