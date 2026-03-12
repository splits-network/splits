"use client";

import { useEffect } from "react";
import { useDrawer } from "@/contexts";
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
    const { open, close } = useDrawer();

    useEffect(() => {
        if (selectedCode) {
            open(
                <ReferralCodeDetailLoader
                    codeId={selectedCode.id}
                    onClose={() => onSelect(selectedCode)}
                    onRefresh={onRefresh}
                />,
            );
        } else {
            close();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCode?.id]);

    return (
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
    );
}
