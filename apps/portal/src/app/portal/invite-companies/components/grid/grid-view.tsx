"use client";

import type { CompanyInvitation } from "../../types";
import { MobileDetailOverlay } from "@/components/standard-lists";
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
        <div className="flex gap-6">
            <div className={`flex flex-col w-full ${selectedInv ? "hidden md:flex" : "flex"}`}>
                <div
                    className={`grid gap-4 w-full ${
                        selectedInv
                            ? "grid-cols-1 lg:grid-cols-2 3xl:grid-cols-3"
                            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5"
                    }`}
                >
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

            {/* Detail Sidebar */}
            {selectedInv && (
                <MobileDetailOverlay
                    isOpen
                    className="md:w-1/2 md:border-2 md:border-base-200 md:flex-shrink-0 md:self-start bg-base-100 shadow-md"
                >
                    <InvitationDetail
                        invitation={selectedInv}
                        onClose={() => onSelectAction(selectedInv)}
                        onRefresh={onRefreshAction}
                    />
                </MobileDetailOverlay>
            )}
        </div>
    );
}
