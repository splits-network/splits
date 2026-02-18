"use client";

import type { RecruiterCompanyRelationship } from "../../types";
import { ACCENT, accentAt } from "../shared/accent";
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
    const selectedInvitation = invitations.find((inv) => inv.id === selectedId);
    const selectedAc = selectedInvitation
        ? accentAt(invitations.indexOf(selectedInvitation))
        : ACCENT[0];

    return (
        <div className="flex gap-0 border-4 border-dark min-h-[600px]">
            {/* Left list */}
            <div className="w-2/5 border-r-4 border-dark overflow-y-auto">
                {invitations.map((invitation, idx) => (
                    <SplitItem
                        key={invitation.id}
                        invitation={invitation}
                        accent={accentAt(idx)}
                        isSelected={selectedId === invitation.id}
                        onSelect={() => onSelect(invitation)}
                    />
                ))}
            </div>

            {/* Right detail */}
            <div className="w-3/5 bg-white overflow-y-auto">
                {selectedInvitation ? (
                    <ConnectionDetail
                        invitation={selectedInvitation}
                        accent={selectedAc}
                        onClose={() => onSelect(selectedInvitation)}
                        onRefresh={onRefresh}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center p-12">
                        <div className="text-center">
                            <div className="flex justify-center gap-3 mb-6">
                                <div className="w-8 h-8 rotate-12 bg-coral" />
                                <div className="w-8 h-8 rounded-full bg-teal" />
                                <div className="w-8 h-8 rotate-45 bg-yellow" />
                            </div>
                            <h3 className="font-black text-xl uppercase tracking-tight mb-2 text-dark">
                                Select a Connection
                            </h3>
                            <p className="text-sm text-dark/50">
                                Click a connection on the left to view details
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
