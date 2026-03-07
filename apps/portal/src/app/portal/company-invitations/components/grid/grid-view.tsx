"use client";

import type { RecruiterCompanyRelationship } from "../../types";
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
    const selectedInvitation = invitations.find((inv) => inv.id === selectedId) ?? null;

    return (
        <div className="drawer drawer-end">
            <input type="checkbox" className="drawer-toggle" checked={!!selectedInvitation} readOnly />
            <div className="drawer-content">
                {/* Grid */}
                <div className="grid gap-4 w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5">
                    {invitations.map((invitation) => (
                        <GridCard
                            key={invitation.id}
                            invitation={invitation}
                            isSelected={selectedId === invitation.id}
                            onSelect={() => onSelectAction(invitation)}
                            onRefresh={onRefreshAction}
                        />
                    ))}
                </div>
            </div>
            <div className="drawer-side z-50">
                <div className="drawer-overlay" onClick={() => selectedInvitation && onSelectAction(selectedInvitation)} aria-label="close drawer" />
                <div className="bg-base-100 w-full md:w-[480px] lg:w-[540px] min-h-full overflow-y-auto shadow-2xl">
                    {selectedInvitation && (
                        <ConnectionDetail
                            invitation={selectedInvitation}
                            onClose={() => onSelectAction(selectedInvitation)}
                            onRefresh={onRefreshAction}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
