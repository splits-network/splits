"use client";

import type { CompanyInvitation } from "../../types";
import { BaselSplitView } from "@splits-network/basel-ui";
import { InvitationDetailLoader } from "../shared/invitation-detail-loader";
import { SplitItem } from "./split-item";

export function SplitView({
    invitations,
    onSelect,
    selectedId,
    onRefresh,
}: {
    invitations: CompanyInvitation[];
    onSelect: (inv: CompanyInvitation) => void;
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
                <InvitationDetailLoader
                    invitationId={invitation.id}
                    onClose={() => onSelect(invitation)}
                    onRefresh={onRefresh}
                />
            )}
            emptyIcon="fa-building-user"
            emptyTitle="Select an Invitation"
            emptyDescription="Click an invitation on the left to view details"
            onMobileClose={() => {
                const selected = invitations.find((i) => i.id === selectedId);
                if (selected) onSelect(selected);
            }}
        />
    );
}
