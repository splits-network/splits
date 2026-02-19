"use client";

import type { RecruiterCompanyRelationship } from "../../types";
import { MobileDetailOverlay } from "@/components/standard-lists";
import { ConnectionDetail } from "../shared/connection-detail";
import { SplitItem } from "./split-item";

export function SplitView({
    invitations,
    onSelect,
    selectedId,
    onRefresh,
}: {
    invitations: RecruiterCompanyRelationship[];
    onSelect: (inv: RecruiterCompanyRelationship) => void;
    selectedId: string | null;
    onRefresh?: () => void;
}) {
    const selectedInvitation = invitations.find((inv) => inv.id === selectedId) ?? null;

    return (
        <div className="flex border-2 border-base-300" style={{ minHeight: 600 }}>
            {/* Left list - hidden on mobile when an invitation is selected */}
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

            {/* Right detail - MobileDetailOverlay handles mobile portal */}
            <MobileDetailOverlay
                isOpen={!!selectedInvitation}
                className="md:w-3/5 w-full bg-base-100"
            >
                {selectedInvitation ? (
                    <ConnectionDetail
                        invitation={selectedInvitation}
                        onClose={() => onSelect(selectedInvitation)}
                        onRefresh={onRefresh}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center p-12">
                        <div className="text-center">
                            <i className="fa-duotone fa-regular fa-hand-pointer text-5xl text-base-content/30 mb-4" />
                            <h3 className="font-bold text-base text-base-content/30 tracking-tight">
                                Select a connection to view details
                            </h3>
                        </div>
                    </div>
                )}
            </MobileDetailOverlay>
        </div>
    );
}
