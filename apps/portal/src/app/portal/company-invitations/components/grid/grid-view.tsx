"use client";

import type { RecruiterCompanyRelationship } from "../../types";
import { ACCENT, accentAt } from "../shared/accent";
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
    const selectedInvitation = invitations.find((inv) => inv.id === selectedId);
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
                            onSelect={() => onSelectAction(invitation)}
                            onRefresh={onRefreshAction}
                        />
                    ))}
                </div>
            </div>

            {/* Detail Sidebar */}
            {selectedInvitation && (
                <div
                    className={`w-1/2 border-4 flex-shrink-0 self-start bg-white ${selectedAc.border}`}
                >
                    <ConnectionDetail
                        invitation={selectedInvitation}
                        accent={selectedAc}
                        onClose={() => onSelectAction(selectedInvitation)}
                        onRefresh={onRefreshAction}
                    />
                </div>
            )}
        </div>
    );
}
