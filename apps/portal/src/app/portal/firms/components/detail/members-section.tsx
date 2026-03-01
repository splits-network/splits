"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { BaselConfirmModal, BaselEmptyState } from "@splits-network/basel-ui";
import { ModalPortal } from "@splits-network/shared-ui";
import type { Firm, FirmMember } from "../../types";
import { formatMemberRole, formatMemberStatus } from "../../types";
import { memberRoleColor, memberStatusColor } from "../shared/status-color";
import { firmInitials } from "../shared/helpers";
import { InviteMemberModal } from "../modals/invite-member-modal";

interface MembersSectionProps {
    firm: Firm;
    members: FirmMember[];
    onRefresh: () => void;
}

export function MembersSection({
    firm,
    members,
    onRefresh,
}: MembersSectionProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [removingMember, setRemovingMember] = useState<FirmMember | null>(
        null,
    );
    const [confirming, setConfirming] = useState(false);

    const handleRemoveMember = async () => {
        if (!removingMember) return;
        try {
            setConfirming(true);
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            await client.delete(
                `/firms/${firm.id}/members/${removingMember.id}`,
            );
            toast.success(
                `Removed ${removingMember.recruiter.user?.name ?? "member"} from firm`,
            );
            setRemovingMember(null);
            onRefresh();
        } catch (err: any) {
            toast.error(err.message || "Failed to remove member");
        } finally {
            setConfirming(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Section heading */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40">
                    Firm Members
                </h3>
                <button
                    className="btn btn-sm btn-primary"
                    style={{ borderRadius: 0 }}
                    onClick={() => setShowInviteModal(true)}
                >
                    <i className="fa-duotone fa-regular fa-user-plus mr-1" />
                    Invite
                </button>
            </div>

            {/* Members list */}
            {members.length === 0 ? (
                <BaselEmptyState
                    icon="fa-duotone fa-regular fa-users"
                    title="No members yet"
                    description="Invite recruiters to join this firm and start collaborating."
                    actions={[
                        {
                            label: "Invite Member",
                            style: "btn-primary",
                            icon: "fa-duotone fa-regular fa-user-plus",
                            onClick: () => setShowInviteModal(true),
                        },
                    ]}
                />
            ) : (
                <div className="border border-base-300">
                    {members.map((member, idx) => (
                        <div
                            key={member.id}
                            className={`flex items-center gap-4 p-4 ${
                                idx < members.length - 1
                                    ? "border-b border-base-200"
                                    : ""
                            }`}
                        >
                            {/* Initials avatar */}
                            <div
                                className="w-10 h-10 bg-base-200 border border-base-300 flex items-center justify-center text-sm font-bold flex-shrink-0"
                                style={{ borderRadius: 0 }}
                            >
                                {firmInitials(
                                    member.recruiter.user?.name ?? "",
                                )}
                            </div>

                            {/* Name + email */}
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">
                                    {member.recruiter.user?.name}
                                </p>
                                <p className="text-xs text-base-content/50 truncate">
                                    {member.recruiter.user?.email}
                                </p>
                            </div>

                            {/* Role badge */}
                            <span
                                className={`text-sm uppercase tracking-[0.15em] font-bold px-2 py-1 ${memberRoleColor(member.role)}`}
                            >
                                {formatMemberRole(member.role)}
                            </span>

                            {/* Status badge */}
                            <span
                                className={`text-sm uppercase tracking-[0.15em] font-bold px-2 py-1 ${memberStatusColor(member.status)}`}
                            >
                                {formatMemberStatus(member.status)}
                            </span>

                            {/* Remove button (non-owner only) */}
                            {member.role !== "owner" && (
                                <button
                                    className="btn btn-ghost btn-xs btn-square"
                                    style={{ borderRadius: 0 }}
                                    onClick={() => setRemovingMember(member)}
                                    title="Remove member"
                                >
                                    <i className="fa-duotone fa-regular fa-xmark text-base-content/40" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Invite modal */}
            <ModalPortal>
                {showInviteModal && (
                    <InviteMemberModal
                        firmId={firm.id}
                        onClose={() => setShowInviteModal(false)}
                        onSuccess={() => {
                            setShowInviteModal(false);
                            onRefresh();
                        }}
                    />
                )}
            </ModalPortal>

            {/* Remove confirmation modal */}
            <BaselConfirmModal
                isOpen={!!removingMember}
                onClose={() => setRemovingMember(null)}
                onConfirm={handleRemoveMember}
                title="Remove Member"
                subtitle="Firm Action"
                icon="fa-user-minus"
                confirmLabel="Remove"
                confirmColor="btn-error"
                confirming={confirming}
                confirmingLabel="Removing..."
            >
                <p className="text-sm text-base-content/70">
                    Remove this member from the firm? They will lose access to
                    firm placements and split distributions.
                </p>
            </BaselConfirmModal>
        </div>
    );
}
