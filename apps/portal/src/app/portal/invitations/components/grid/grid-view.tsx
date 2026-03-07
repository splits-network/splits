"use client";

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

    return (
        <div className="drawer drawer-end">
            <input type="checkbox" className="drawer-toggle" checked={!!selectedInvitation} readOnly />
            <div className="drawer-content">
                {/* Grid */}
                <div className="grid gap-4 w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
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
            </div>
            <div className="drawer-side z-50">
                <div className="drawer-overlay" onClick={() => selectedInvitation && onSelect(selectedInvitation)} aria-label="close drawer" />
                <div className="bg-base-100 w-full md:w-1/2 min-h-full overflow-y-auto shadow-2xl">
                    {selectedInvitation && (
                        <InvitationDetail
                            invitation={selectedInvitation}
                            onClose={() => onSelect(selectedInvitation)}
                            onRefresh={onRefresh}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
