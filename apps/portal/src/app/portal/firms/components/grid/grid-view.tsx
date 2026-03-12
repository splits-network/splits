"use client";

import { useEffect } from "react";
import { useDrawer } from "@/contexts";
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
    const { open, close } = useDrawer();

    useEffect(() => {
        if (selectedFirm) {
            open(
                <FirmDetailLoader
                    firmId={selectedFirm.id}
                    onClose={() => onSelectAction(selectedFirm)}
                    onRefresh={onRefreshAction}
                />,
            );
        } else {
            close();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFirm?.id]);

    return (
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
    );
}
