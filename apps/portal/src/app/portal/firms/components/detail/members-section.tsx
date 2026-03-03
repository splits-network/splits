"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import { BaselConfirmModal, BaselEmptyState } from "@splits-network/basel-ui";
import { ModalPortal } from "@splits-network/shared-ui";
import type { Firm, FirmMember, FirmInvitation } from "../../types";
import { formatMemberRole, formatMemberStatus, formatDate } from "../../types";
import { memberRoleColor, memberStatusColor } from "../shared/status-color";
import { firmInitials } from "../shared/helpers";
import { InviteMemberModal } from "../modals/invite-member-modal";
import { LevelBadge, useGamification } from "@splits-network/shared-gamification";

interface MembersSectionProps {
    firm: Firm;
    members: FirmMember[];
    invitations: FirmInvitation[];
    onRefresh: () => void;
}

export function MembersSection({
    firm,
    members,
    invitations,
    onRefresh,
}: MembersSectionProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const { getLevel } = useGamification();
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [removingMember, setRemovingMember] = useState<FirmMember | null>(
        null,
    );
    const [cancellingInvitation, setCancellingInvitation] =
        useState<FirmInvitation | null>(null);
    const [confirming, setConfirming] = useState(false);
    const [resendingId, setResendingId] = useState<string | null>(null);

    const pendingInvitations = invitations.filter(
        (inv) => inv.status === "pending",
    );

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

    const handleCancelInvitation = async () => {
        if (!cancellingInvitation) return;
        try {
            setConfirming(true);
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            await client.delete(
                `/firms/${firm.id}/invitations/${cancellingInvitation.id}`,
            );
            toast.success(
                `Cancelled invitation for ${cancellingInvitation.email}`,
            );
            setCancellingInvitation(null);
            onRefresh();
        } catch (err: any) {
            toast.error(err.message || "Failed to cancel invitation");
        } finally {
            setConfirming(false);
        }
    };

    const handleResendInvitation = async (invitation: FirmInvitation) => {
        try {
            setResendingId(invitation.id);
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            await client.post(
                `/firms/${firm.id}/invitations/${invitation.id}/resend`,
            );
            toast.success(`Resent invitation to ${invitation.email}`);
            onRefresh();
        } catch (err: any) {
            toast.error(err.message || "Failed to resend invitation");
        } finally {
            setResendingId(null);
        }
    };

    const isExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

    return (
        <div className="space-y-10">
            {/* ── Active Members Section ── */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40">
                        Active Members
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
                                <div className="relative flex-shrink-0">
                                    <div
                                        className="w-10 h-10 bg-base-200 border border-base-300 flex items-center justify-center text-sm font-bold"
                                        style={{ borderRadius: 0 }}
                                    >
                                        {firmInitials(
                                            member.recruiter.user?.name ?? "",
                                        )}
                                    </div>
                                    {member.recruiter_id && getLevel(member.recruiter_id) && (
                                        <div className="absolute -bottom-1 -right-1">
                                            <LevelBadge level={getLevel(member.recruiter_id)!} size="sm" />
                                        </div>
                                    )}
                                </div>

                                {/* Name + email */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm truncate">
                                        {member.recruiter.user?.name}
                                    </p>
                                    <p className="text-sm text-base-content/50 truncate">
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
                                        onClick={() =>
                                            setRemovingMember(member)
                                        }
                                        title="Remove member"
                                    >
                                        <i className="fa-duotone fa-regular fa-xmark text-base-content/40" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ── Pending Invitations Section ── */}
            {pendingInvitations.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40">
                            Pending Invitations
                            <span className="ml-2 text-base-content/30">
                                ({pendingInvitations.length})
                            </span>
                        </h3>
                    </div>

                    <div className="border border-base-300">
                        {pendingInvitations.map((invitation, idx) => {
                            const expired = isExpired(invitation.expires_at);
                            return (
                                <div
                                    key={invitation.id}
                                    className={`flex items-center gap-4 p-4 ${
                                        idx < pendingInvitations.length - 1
                                            ? "border-b border-base-200"
                                            : ""
                                    }`}
                                >
                                    {/* Envelope avatar */}
                                    <div
                                        className="w-10 h-10 bg-base-200 border border-base-300 border-dashed flex items-center justify-center text-sm flex-shrink-0"
                                        style={{ borderRadius: 0 }}
                                    >
                                        <i className="fa-duotone fa-regular fa-envelope text-base-content/40" />
                                    </div>

                                    {/* Email + invite date */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm truncate text-base-content/70">
                                            {invitation.email}
                                        </p>
                                        <p className="text-sm text-base-content/40 truncate">
                                            Invited{" "}
                                            {formatDate(
                                                invitation.created_at,
                                            )}
                                            {expired && (
                                                <span className="text-warning ml-2">
                                                    (expired)
                                                </span>
                                            )}
                                        </p>
                                    </div>

                                    {/* Role badge */}
                                    <span
                                        className={`text-sm uppercase tracking-[0.15em] font-bold px-2 py-1 ${memberRoleColor(invitation.role)}`}
                                    >
                                        {formatMemberRole(invitation.role)}
                                    </span>

                                    {/* Status badge */}
                                    <span
                                        className={`text-sm uppercase tracking-[0.15em] font-bold px-2 py-1 ${
                                            expired
                                                ? "text-warning/70 bg-warning/10"
                                                : "text-info/70 bg-info/10"
                                        }`}
                                    >
                                        {expired ? "Expired" : "Pending"}
                                    </span>

                                    {/* Resend button */}
                                    <button
                                        className="btn btn-ghost btn-xs"
                                        style={{ borderRadius: 0 }}
                                        onClick={() =>
                                            handleResendInvitation(invitation)
                                        }
                                        disabled={resendingId === invitation.id}
                                        title="Resend invitation"
                                    >
                                        {resendingId === invitation.id ? (
                                            <span className="loading loading-spinner loading-xs" />
                                        ) : (
                                            <i className="fa-duotone fa-regular fa-paper-plane text-base-content/40" />
                                        )}
                                    </button>

                                    {/* Cancel button */}
                                    <button
                                        className="btn btn-ghost btn-xs btn-square"
                                        style={{ borderRadius: 0 }}
                                        onClick={() =>
                                            setCancellingInvitation(invitation)
                                        }
                                        title="Cancel invitation"
                                    >
                                        <i className="fa-duotone fa-regular fa-xmark text-base-content/40" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </section>
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

            {/* Remove member confirmation modal */}
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

            {/* Cancel invitation confirmation modal */}
            <BaselConfirmModal
                isOpen={!!cancellingInvitation}
                onClose={() => setCancellingInvitation(null)}
                onConfirm={handleCancelInvitation}
                title="Cancel Invitation"
                subtitle="Firm Action"
                icon="fa-envelope-circle-xmark"
                confirmLabel="Cancel Invitation"
                confirmColor="btn-error"
                confirming={confirming}
                confirmingLabel="Cancelling..."
            >
                <p className="text-sm text-base-content/70">
                    Cancel the invitation for{" "}
                    <strong>{cancellingInvitation?.email}</strong>? They will no
                    longer be able to join the firm with this invitation.
                </p>
            </BaselConfirmModal>
        </div>
    );
}
