"use client";

import { useEffect } from "react";
import { useDrawer } from "@/contexts";
import type { RecruiterCompanyRelationship } from "../../types";
import { ConnectionDetail } from "../shared/connection-detail";
import { GridCard } from "./grid-card";

export function GridView({
    invitations,
    onSelectAction,
    selectedId,
    onRefreshAction,
}: {
    invitations: RecruiterCompanyRelationship[];
    onSelectAction: (inv: RecruiterCompanyRelationship) => void;
    selectedId: string | null;
    onRefreshAction?: () => void;
}) {
    const selectedInvitation = invitations.find((inv) => inv.id === selectedId) ?? null;
    const { open, close } = useDrawer();

    useEffect(() => {
        if (selectedInvitation) {
            open(
                <ConnectionDetail
                    invitation={selectedInvitation}
                    onClose={() => onSelectAction(selectedInvitation)}
                    onRefresh={onRefreshAction}
                />,
                { width: "narrow" },
            );
        } else {
            close();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedInvitation?.id]);

    return (
        <div className="grid gap-4 w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5">
            {invitations.map((invitation) => (
                <GridCard
                    key={invitation.id}
                    invitation={invitation}
                    isSelected={selectedId === invitation.id}
                    onSelect={() => onSelectAction(invitation)}
                    onRefresh={onRefreshAction}
                />
            ))}
        </div>
    );
}
