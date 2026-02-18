"use client";

import type { Invitation } from "../../types";
import { ACCENT, accentAt } from "../shared/accent";
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
    const selectedInvitation = invitations.find(
        (inv) => inv.id === selectedId,
    );
    const selectedAc = selectedInvitation
        ? accentAt(invitations.indexOf(selectedInvitation))
        : ACCENT[0];

    return (
        <div className="flex gap-6">
            <div className="flex flex-col w-full">
                <div
                    className={`grid gap-4 w-full ${
                        selectedInvitation
                            ? "grid-cols-1 lg:grid-cols-2 3xl:grid-cols-3"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5"
                    }`}
                >
                    {invitations.map((invitation, idx) => (
                        <GridCard
                            key={invitation.id}
                            invitation={invitation}
                            accent={accentAt(idx)}
                            isSelected={selectedId === invitation.id}
                            onSelect={() => onSelect(invitation)}
                            onRefresh={onRefresh}
                        />
                    ))}
                </div>
            </div>

            {/* Detail Sidebar */}
            {selectedInvitation && (
                <div
                    className={`w-1/2 border-4 flex-shrink-0 self-start bg-white ${selectedAc.border}`}
                >
                    <InvitationDetail
                        invitation={selectedInvitation}
                        accent={selectedAc}
                        onClose={() => onSelect(selectedInvitation)}
                        onRefresh={onRefresh}
                    />
                </div>
            )}
        </div>
    );
}
