"use client";

import type { Invitation } from "../../types";
import { MobileDetailOverlay } from "@/components/standard-lists";
import { InvitationDetail } from "../shared/invitation-detail";
import { SplitItem } from "./split-item";

export function SplitView({
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

    return (
        <div
            className="flex border-2 border-base-300"
            style={{ minHeight: 600 }}
        >
            {/* Left list */}
            <div
                className={`w-full md:w-2/5 border-r-2 border-base-300 overflow-y-auto ${
                    selectedId ? "hidden md:block" : "block"
                }`}
            >
                {invitations.map((invitation) => (
                    <SplitItem
                        key={invitation.id}
                        invitation={invitation}
                        isSelected={selectedId === invitation.id}
                        onSelect={() => onSelect(invitation)}
                    />
                ))}
            </div>

            {/* Right detail */}
            <MobileDetailOverlay
                isOpen={!!selectedInvitation}
                className="md:w-3/5 w-full bg-base-100"
            >
                {selectedInvitation ? (
                    <InvitationDetail
                        invitation={selectedInvitation}
                        onClose={() => onSelect(selectedInvitation)}
                        onRefresh={onRefresh}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center p-12">
                        <div className="text-center">
                            <i className="fa-duotone fa-regular fa-hand-pointer text-5xl text-base-content/15 mb-4 block" />
                            <h3 className="text-2xl font-black tracking-tight mb-2">
                                Select an Invitation
                            </h3>
                            <p className="text-base-content/50">
                                Click an invitation on the left to view details
                            </p>
                        </div>
                    </div>
                )}
            </MobileDetailOverlay>
        </div>
    );
}
