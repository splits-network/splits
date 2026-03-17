"use client";

import type { Invitation } from "../../types";
import { BaselSplitView } from "@splits-network/basel-ui";
import { InvitationDetail } from "../shared/invitation-detail";
import { SplitItem } from "./split-item";

export function SplitView({
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
    return (
        <BaselSplitView
            items={invitations}
            selectedId={selectedId}
            getItemId={(inv) => inv.id}
            estimatedItemHeight={80}
            renderItem={(invitation, isSelected) => (
                <SplitItem
                    invitation={invitation}
                    isSelected={isSelected}
                    onSelect={() => onSelect(invitation)}
                />
            )}
            renderDetail={(invitation) => (
                <InvitationDetail
                    invitation={invitation}
                    onClose={() => onSelect(invitation)}
                    onRefresh={onRefresh}
                />
            )}
            emptyIcon="fa-hand-pointer"
            emptyTitle="Select an Invitation"
            emptyDescription="Click an invitation on the left to view details"
            initialListWidth={40}
            onMobileClose={() => {
                const selected = invitations.find((i) => i.id === selectedId);
                if (selected) onSelect(selected);
            }}
        />
    );
}
