"use client";

import type { CompanyInvitation } from "../../types";
import { InvitationDetailLoader } from "../shared/invitation-detail-loader";
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

    return (
        <div className="drawer drawer-end">
            <input type="checkbox" className="drawer-toggle" checked={!!selectedInv} readOnly />
            <div className="drawer-content">
                {/* Grid */}
                <div className="grid gap-4 w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                    {invitations.map((inv) => (
                        <GridCard
                            key={inv.id}
                            invitation={inv}
                            isSelected={selectedId === inv.id}
                            onSelect={() => onSelectAction(inv)}
                            onRefresh={onRefreshAction}
                        />
                    ))}
                </div>
            </div>
            <div className="drawer-side z-50">
                <div className="drawer-overlay" onClick={() => selectedInv && onSelectAction(selectedInv)} aria-label="close drawer" />
                <div className="bg-base-100 w-full md:w-1/2 min-h-full overflow-y-auto shadow-2xl">
                    {selectedInv && (
                        <InvitationDetailLoader
                            invitationId={selectedInv.id}
                            onClose={() => onSelectAction(selectedInv)}
                            onRefresh={onRefreshAction}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
