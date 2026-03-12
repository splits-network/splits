"use client";

import { useEffect } from "react";
import { useDrawer } from "@/contexts";
import type { CompanyInvitation } from "../../types";
import { InvitationDetailLoader } from "../shared/invitation-detail-loader";
import { GridCard } from "./grid-card";

export function GridView({
    invitations,
    onSelectAction,
    selectedId,
    onRefreshAction,
}: {
    invitations: CompanyInvitation[];
    onSelectAction: (inv: CompanyInvitation) => void;
    selectedId: string | null;
    onRefreshAction?: () => void;
}) {
    const selectedInv = invitations.find((inv) => inv.id === selectedId);
    const { open, close } = useDrawer();

    useEffect(() => {
        if (selectedInv) {
            open(
                <InvitationDetailLoader
                    invitationId={selectedInv.id}
                    onClose={() => onSelectAction(selectedInv)}
                    onRefresh={onRefreshAction}
                />,
            );
        } else {
            close();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedInv?.id]);

    return (
        <div className="grid gap-4 w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {invitations.map((inv) => (
                <GridCard
                    key={inv.id}
                    invitation={inv}
                    isSelected={selectedId === inv.id}
                    onSelect={() => onSelectAction(inv)}
                    onRefresh={onRefreshAction}
                />
            ))}
        </div>
    );
}
