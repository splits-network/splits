"use client";

import type { CompanyInvitation } from "../../types";
import { ACCENT, accentAt } from "../shared/accent";
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
    const selectedAc = selectedInv ? accentAt(invitations.indexOf(selectedInv)) : ACCENT[0];

    return (
        <div className="flex gap-0 border-4 border-dark" style={{ minHeight: 600 }}>
            {/* Left list */}
            <div className="w-2/5 border-r-4 border-dark">
                {invitations.map((inv, idx) => (
                    <SplitItem
                        key={inv.id}
                        invitation={inv}
                        accent={accentAt(idx)}
                        isSelected={selectedId === inv.id}
                        onSelect={() => onSelect(inv)}
                    />
                ))}
            </div>

            {/* Right detail */}
            <div className="w-3/5 bg-white">
                {selectedInv ? (
                    <InvitationDetail
                        invitation={selectedInv}
                        accent={selectedAc}
                        onClose={() => onSelect(selectedInv)}
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
                                Select an Invitation
                            </h3>
                            <p className="text-sm text-dark/50">
                                Click an invitation on the left to view details
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
