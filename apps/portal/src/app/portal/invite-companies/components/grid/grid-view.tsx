"use client";

import type { CompanyInvitation } from "../../types";
import { ACCENT, accentAt } from "../shared/accent";
import { InvitationDetail } from "../shared/invitation-detail";
import { GridCard } from "./grid-card";

export function GridView({
    invitations,
    onSelectAction,
    selectedId,
    onRefreshAction,
}: {
    invitations: CompanyInvitation[];
    onSelectAction: (inv: CompanyInvitation) => void;
    selectedId: string | null;
    onRefreshAction?: () => void;
}) {
    const selectedInv = invitations.find((inv) => inv.id === selectedId);
    const selectedAc = selectedInv
        ? accentAt(invitations.indexOf(selectedInv))
        : ACCENT[0];

    return (
        <div className="flex gap-6">
            <div className="flex flex-col w-full">
                <div
                    className={`grid gap-4 w-full ${
                        selectedInv
                            ? "grid-cols-1 lg:grid-cols-2 3xl:grid-cols-3"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5"
                    }`}
                >
                    {invitations.map((inv, idx) => (
                        <GridCard
                            key={inv.id}
                            invitation={inv}
                            accent={accentAt(idx)}
                            isSelected={selectedId === inv.id}
                            onSelect={() => onSelectAction(inv)}
                            onRefresh={onRefreshAction}
                        />
                    ))}
                </div>
            </div>

            {/* Detail Sidebar */}
            {selectedInv && (
                <div
                    className={`w-1/2 border-4 flex-shrink-0 self-start bg-white ${selectedAc.border}`}
                >
                    <InvitationDetail
                        invitation={selectedInv}
                        accent={selectedAc}
                        onClose={() => onSelectAction(selectedInv)}
                        onRefresh={onRefreshAction}
                    />
                </div>
            )}
        </div>
    );
}
