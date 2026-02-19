"use client";

import type { Invitation } from "../../types";
import { ACCENT, accentAt } from "../shared/accent";
import { InvitationDetail } from "../shared/invitation-detail";
import { MobileDetailOverlay } from "@/components/standard-lists";
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
            <div className={`flex flex-col w-full ${selectedInvitation ? "hidden md:flex" : "flex"}`}>
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
                <MobileDetailOverlay
                    isOpen
                    className={`md:w-1/2 md:border-4 md:flex-shrink-0 md:self-start bg-white ${selectedAc.border}`}
                >
                    <InvitationDetail
                        invitation={selectedInvitation}
                        accent={selectedAc}
                        onClose={() => onSelect(selectedInvitation)}
                        onRefresh={onRefresh}
                    />
                </MobileDetailOverlay>
            )}
        </div>
    );
}
