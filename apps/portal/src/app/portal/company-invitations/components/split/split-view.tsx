"use client";

import type { RecruiterCompanyRelationship } from "../../types";
import { BaselSplitView } from "@splits-network/basel-ui";
import { ConnectionDetail } from "../shared/connection-detail";
import { SplitItem } from "./split-item";

export function SplitView({
    invitations,
    onSelect,
    selectedId,
    onRefresh,
}: {
    invitations: RecruiterCompanyRelationship[];
    onSelect: (inv: RecruiterCompanyRelationship) => void;
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
                <ConnectionDetail
                    invitation={invitation}
                    onClose={() => onSelect(invitation)}
                    onRefresh={onRefresh}
                />
            )}
            emptyIcon="fa-handshake"
            emptyTitle="Select a Connection"
            emptyDescription="Click a connection on the left to view details"
            onMobileClose={() => {
                const selected = invitations.find((i) => i.id === selectedId);
                if (selected) onSelect(selected);
            }}
        />
    );
}
