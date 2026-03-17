"use client";

import { useEffect, useRef } from "react";
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
    const { open, close, isOpen } = useDrawer();
    const wasOpen = useRef(false);

    useEffect(() => {
        if (wasOpen.current && !isOpen && selectedInvitation) {
            onSelectAction(selectedInvitation);
        }
        wasOpen.current = isOpen;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

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
        <div className="grid gap-4 w-full grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5">
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
