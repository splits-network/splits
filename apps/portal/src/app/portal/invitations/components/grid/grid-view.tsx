"use client";

import { useEffect, useRef } from "react";
import { useDrawer } from "@/contexts";
import type { Invitation } from "../../types";
import { InvitationDetail } from "../shared/invitation-detail";
import { GridCard } from "./grid-card";

export function GridView({
    invitations,
    onSelect,
    selectedId,
    onRefresh,
}: {
    invitations: Invitation[];
    onSelect: (inv: Invitation) => void;
    selectedId: string | null;
    onRefresh?: () => void;
}) {
    const selectedInvitation = invitations.find((inv) => inv.id === selectedId);
    const { open, close, isOpen } = useDrawer();
    const wasOpen = useRef(false);

    useEffect(() => {
        if (wasOpen.current && !isOpen && selectedInvitation) {
            onSelect(selectedInvitation);
        }
        wasOpen.current = isOpen;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    useEffect(() => {
        if (selectedInvitation) {
            open(
                <InvitationDetail
                    invitation={selectedInvitation}
                    onClose={() => onSelect(selectedInvitation)}
                    onRefresh={onRefresh}
                />,
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
                    onSelect={() => onSelect(invitation)}
                    onRefresh={onRefresh}
                />
            ))}
        </div>
    );
}
