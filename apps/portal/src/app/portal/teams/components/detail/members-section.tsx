"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import {
    Badge,
    Button,
    DetailSection,
    Modal,
    EmptyState,
} from "@splits-network/memphis-ui";
import { ModalPortal } from "@splits-network/shared-ui";
import type { TeamMember } from "../../types";
import { formatMemberRole, formatMemberStatus, formatDate } from "../../types";
import { memberRoleVariant, memberStatusVariant } from "../shared/accent";
import { teamInitials } from "../shared/helpers";
import { InviteMemberModal } from "../modals/invite-member-modal";

interface MembersSectionProps {
    teamId: string;
    members: TeamMember[];
    onRefresh: () => void;
}

export function MembersSection({ teamId, members, onRefresh }: MembersSectionProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);

    const handleRemoveMember = (memberId: string, memberName: string) => {
        setConfirmModal({
            title: "Remove Team Member",
            message: `Are you sure you want to remove ${memberName} from this team?`,
            onConfirm: async () => {
                try {
                    const token = await getToken();
                    if (!token) return;
                    const client = createAuthenticatedClient(token);
                    await client.delete(`/teams/${teamId}/members/${memberId}`);
                    toast.success(`Removed ${memberName} from team`);
                    onRefresh();
                } catch (error: any) {
                    toast.error(error.message || "Failed to remove member");
                } finally {
                    setConfirmModal(null);
                }
            },
        });
    };

    return (
        <div className="space-y-8">
            {/* Invite Section */}
            <DetailSection
                title="Invite Team Member"
                icon="fa-duotone fa-regular fa-user-plus"
                accent="teal"
            >
                <p className="text-sm text-dark/60 mb-4">
                    Invite a recruiter to join your team by email address.
                </p>
                <Button
                    color="teal"
                    onClick={() => setShowInviteModal(true)}
                >
                    <i className="fa-duotone fa-regular fa-user-plus mr-2" />
                    Invite Member
                </Button>
            </DetailSection>

            {/* Members List */}
            <DetailSection
                title={`Team Members (${members.length})`}
                icon="fa-duotone fa-regular fa-users"
                accent="coral"
            >
                {members.length > 0 ? (
                    <div className="space-y-0">
                        {members.map((member, idx) => (
                            <div
                                key={member.id}
                                className={`flex items-center gap-4 p-4 ${idx < members.length - 1 ? "border-b-2 border-cream" : ""}`}
                            >
                                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center border-4 border-coral bg-coral">
                                    <span className="text-xs font-black text-white">
                                        {teamInitials(member.recruiter.name)}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-dark truncate">
                                        {member.recruiter.name}
                                    </p>
                                    <p className="text-xs text-dark/50 truncate">
                                        {member.recruiter.email}
                                    </p>
                                </div>
                                <Badge
                                    color={memberRoleVariant(member.role)}
                                    size="sm"
                                    variant="outline"
                                >
                                    {formatMemberRole(member.role)}
                                </Badge>
                                <Badge
                                    color={memberStatusVariant(member.status)}
                                    size="sm"
                                >
                                    {formatMemberStatus(member.status)}
                                </Badge>
                                <span className="text-xs text-dark/40 hidden md:block">
                                    {formatDate(member.joined_at)}
                                </span>
                                {member.role !== "owner" && member.status === "active" && (
                                    <Button
                                        color="coral"
                                        variant="ghost"
                                        size="xs"
                                        onClick={() =>
                                            handleRemoveMember(
                                                member.id,
                                                member.recruiter.name,
                                            )
                                        }
                                    >
                                        <i className="fa-duotone fa-regular fa-trash" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon="fa-duotone fa-regular fa-users"
                        title="No Team Members Yet"
                        description="Invite colleagues to join your team"
                        color="teal"
                    />
                )}
            </DetailSection>

            {/* Role Permissions */}
            <DetailSection
                title="Role Permissions"
                icon="fa-duotone fa-regular fa-circle-info"
                accent="purple"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Badge color="coral" size="sm">Owner</Badge>
                            <span className="text-sm font-bold text-dark">Team Owner</span>
                        </div>
                        <ul className="space-y-1">
                            {[
                                "Full access to all features",
                                "Manage team members",
                                "Configure split distributions",
                                "View all placements and revenue",
                                "Suspend or delete team",
                            ].map((perm) => (
                                <li key={perm} className="text-xs text-dark/60 flex items-center gap-2">
                                    <i className="fa-solid fa-check text-teal text-[10px]" />
                                    {perm}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Badge color="purple" size="sm">Admin</Badge>
                            <span className="text-sm font-bold text-dark">Team Admin</span>
                        </div>
                        <ul className="space-y-1">
                            {[
                                "Manage team members",
                                "View all placements and revenue",
                                "Invite new members",
                                "Cannot delete team or change owner",
                            ].map((perm) => (
                                <li key={perm} className="text-xs text-dark/60 flex items-center gap-2">
                                    <i className="fa-solid fa-check text-teal text-[10px]" />
                                    {perm}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Badge color="teal" size="sm">Member</Badge>
                            <span className="text-sm font-bold text-dark">Team Member</span>
                        </div>
                        <ul className="space-y-1">
                            {[
                                "View team placements",
                                "Participate in split distributions",
                                "Standard recruiting features",
                            ].map((perm) => (
                                <li key={perm} className="text-xs text-dark/60 flex items-center gap-2">
                                    <i className="fa-solid fa-check text-teal text-[10px]" />
                                    {perm}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Badge color="yellow" size="sm">Collaborator</Badge>
                            <span className="text-sm font-bold text-dark">Collaborator</span>
                        </div>
                        <ul className="space-y-1">
                            {[
                                "Limited access to team data",
                                "View shared placements only",
                                "Cannot manage team settings",
                            ].map((perm) => (
                                <li key={perm} className="text-xs text-dark/60 flex items-center gap-2">
                                    <i className="fa-solid fa-check text-teal text-[10px]" />
                                    {perm}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </DetailSection>

            {/* Invite Modal */}
            <ModalPortal>
                {showInviteModal && (
                    <InviteMemberModal
                        teamId={teamId}
                        onClose={() => setShowInviteModal(false)}
                        onSuccess={() => {
                            setShowInviteModal(false);
                            onRefresh();
                        }}
                    />
                )}
            </ModalPortal>

            {/* Confirmation Modal */}
            <Modal
                open={!!confirmModal}
                onClose={() => setConfirmModal(null)}
                title={confirmModal?.title || ""}
                closeOnBackdrop
            >
                <p className="text-sm text-dark/70 mb-6">
                    {confirmModal?.message}
                </p>
                <div className="flex gap-3 justify-end">
                    <Button
                        color="dark"
                        variant="ghost"
                        onClick={() => setConfirmModal(null)}
                    >
                        Cancel
                    </Button>
                    <Button color="coral" onClick={confirmModal?.onConfirm}>
                        Confirm
                    </Button>
                </div>
            </Modal>
        </div>
    );
}
