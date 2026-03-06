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
        <div className="relative">
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

            {/* Detail Drawer */}
            {selectedInvitation && (
                <>
                    <div
                        className="fixed inset-0 bg-black/30 transition-opacity"
                        onClick={() => onSelectAction(selectedInvitation)}
                    />
                    <div className="fixed top-0 right-0 h-full w-full md:w-[480px] lg:w-[540px] bg-base-100 shadow-2xl border-l border-base-300 overflow-y-auto animate-slide-in-right">
                        <ConnectionDetail
                            invitation={selectedInvitation}
                            onClose={() => onSelectAction(selectedInvitation)}
                            onRefresh={onRefreshAction}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
