"use client";

import type { CompanyInvitation } from "../../types";
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

    return (
        <div className="relative">
            {/* Grid */}
            <div className="grid gap-4 w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5">
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

            {/* Detail Drawer */}
            {selectedInv && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/30 transition-opacity"
                        onClick={() => onSelectAction(selectedInv)}
                    />
                    <div className="fixed top-0 right-0 z-50 h-full w-full md:w-[480px] lg:w-[540px] bg-base-100 shadow-2xl border-l border-base-300 overflow-y-auto animate-slide-in-right">
                        <InvitationDetail
                            invitation={selectedInv}
                            onClose={() => onSelectAction(selectedInv)}
                            onRefresh={onRefreshAction}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
