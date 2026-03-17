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
                className={`w-full md:w-1/3 border-r border-base-300 overflow-y-auto ${
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
                className="md:w-2/3 w-full bg-base-100 overflow-y-auto"
            >
                {selectedInvitation ? (
                    <ConnectionDetail
                        invitation={selectedInvitation}
                        onClose={() => onSelect(selectedInvitation)}
                        onRefresh={onRefresh}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center p-12">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-handshake text-2xl text-primary" />
                            </div>
                            <h3 className="font-black text-xl tracking-tight mb-2">
                                Select a Connection
                            </h3>
                            <p className="text-sm text-base-content/50">
                                Click a connection on the left to view details
                            </p>
                        </div>
                    </div>
                )}
            </MobileDetailOverlay>
        </div>
    );
}
