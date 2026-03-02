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
        <div className="relative">
            {/* Grid */}
            <div className="grid gap-4 w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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

            {/* Detail Drawer */}
            {selectedInvitation && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/30 transition-opacity"
                        onClick={() => onSelect(selectedInvitation)}
                    />
                    <div className="fixed top-0 right-0 z-50 h-full w-full md:w-[480px] lg:w-[540px] bg-base-100 shadow-2xl border-l border-base-300 overflow-y-auto animate-slide-in-right">
                        <InvitationDetail
                            invitation={selectedInvitation}
                            onClose={() => onSelect(selectedInvitation)}
                            onRefresh={onRefresh}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
