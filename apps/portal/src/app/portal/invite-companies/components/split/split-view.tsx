"use client";

import type { CompanyInvitation } from "../../types";
import { MobileDetailOverlay } from "@/components/standard-lists";
import { InvitationDetail } from "../shared/invitation-detail";
import { SplitItem } from "./split-item";

export function SplitView({
    invitations,
    onSelect,
    selectedId,
    onRefresh,
}: {
    invitations: CompanyInvitation[];
    onSelect: (inv: CompanyInvitation) => void;
    selectedId: string | null;
    onRefresh?: () => void;
}) {
    const selectedInv = invitations.find((inv) => inv.id === selectedId);

    return (
        <div className="flex gap-0 border-2 border-base-300" style={{ minHeight: 600 }}>
            {/* Left list */}
            <div className={`w-full md:w-2/5 border-r-2 border-base-300 ${selectedId ? "hidden md:block" : "block"}`}>
                {invitations.map((inv) => (
                    <SplitItem
                        key={inv.id}
                        invitation={inv}
                        isSelected={selectedId === inv.id}
                        onSelect={() => onSelect(inv)}
                    />
                ))}
            </div>

            {/* Right detail */}
            <MobileDetailOverlay
                isOpen={!!selectedInv}
                className="md:w-3/5 w-full bg-base-100"
            >
                {selectedInv ? (
                    <InvitationDetail
                        invitation={selectedInv}
                        onClose={() => onSelect(selectedInv)}
                        onRefresh={onRefresh}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center p-12">
                        <div className="text-center">
                            <i className="fa-duotone fa-regular fa-building-user text-5xl text-base-content/15 mb-6 block" />
                            <h3 className="text-xl font-black tracking-tight mb-2">
                                Select an Invitation
                            </h3>
                            <p className="text-sm text-base-content/50">
                                Click an invitation on the left to view details
                            </p>
                        </div>
                    </div>
                )}
            </MobileDetailOverlay>
        </div>
    );
}
