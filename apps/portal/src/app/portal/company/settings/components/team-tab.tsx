"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import {
    Input,
    Select,
    Button,
    Badge,
    DetailSection,
    Modal,
    EmptyState,
} from "@splits-network/memphis-ui";
import { ButtonLoading } from "@splits-network/shared-ui";
import type { TeamMember, Invitation } from "../types";

const ROLES = [
    { value: "hiring_manager", label: "Hiring Manager" },
    { value: "company_admin", label: "Admin" },
];

const SCOPES = [
    { value: "company", label: "This Company Only" },
    { value: "org", label: "Entire Organization" },
];

interface TeamTabProps {
    organizationId: string;
    companyId: string;
}

function getRoleBadgeColor(role: string): "primary" | "secondary" | "accent" {
    switch (role) {
        case "company_admin":
            return "primary";
        case "hiring_manager":
            return "secondary";
        default:
            return "accent";
    }
}

function getRoleLabel(role: string): string {
    switch (role) {
        case "company_admin":
            return "Admin";
        case "hiring_manager":
            return "Hiring Manager";
        default:
            return role;
    }
}

export function TeamTab({ organizationId, companyId }: TeamTabProps) {
    const auth = useAuth();
    const { getToken } = auth;
    const toast = useToast();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("hiring_manager");
    const [inviteScope, setInviteScope] = useState("company");
    const [inviting, setInviting] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);

    const fetchTeamMembers = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const response: any = await client.get(
                `/memberships?organization_id=${organizationId}&company_id=${companyId}`,
            );
            setMembers(response.data || []);
        } catch (error) {
            console.error("Failed to fetch team members:", error);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [organizationId, companyId]);

    const fetchInvitations = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const response: any = await client.get(
                `/invitations?organization_id=${organizationId}&status=pending`,
            );
            setInvitations(response.data || []);
        } catch (error) {
            console.error("Failed to fetch invitations:", error);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [organizationId]);

    useEffect(() => {
        fetchTeamMembers();
        fetchInvitations();
    }, [fetchTeamMembers, fetchInvitations]);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setInviting(true);

        try {
            const token = await getToken();
            if (!token) {
                toast.error("Authentication required");
                setInviting(false);
                return;
            }

            const { userId } = auth;
            if (!userId) {
                toast.error("User ID not found");
                setInviting(false);
                return;
            }

            const client = createAuthenticatedClient(token);
            const inviteCompanyId =
                inviteScope === "company" ? companyId : null;

            await client.post("/invitations", {
                email: inviteEmail.toLowerCase(),
                organization_id: organizationId,
                company_id: inviteCompanyId,
                role: inviteRole,
                invited_by: userId,
            });

            const scopeText =
                inviteScope === "company" ? "your company" : "the organization";
            toast.success(
                `Invitation sent to ${inviteEmail} for ${scopeText}.`,
            );
            setInviteEmail("");
            setInviteRole("hiring_manager");
            setInviteScope("company");
            fetchInvitations();
        } catch (error: any) {
            console.error("Failed to send invitation:", error);
            toast.error(error.message || "Failed to send invitation");
        } finally {
            setInviting(false);
        }
    };

    const handleRevokeInvitation = (invitationId: string, email: string) => {
        setConfirmModal({
            title: "Revoke Invitation",
            message: `Are you sure you want to revoke the invitation for ${email}?`,
            onConfirm: async () => {
                try {
                    const token = await getToken();
                    if (!token) return;
                    const client = createAuthenticatedClient(token);
                    await client.delete(`/invitations/${invitationId}`);
                    toast.success(`Revoked invitation for ${email}`);
                    fetchInvitations();
                } catch (error: any) {
                    console.error("Failed to revoke invitation:", error);
                    toast.error(error.message || "Failed to revoke invitation");
                } finally {
                    setConfirmModal(null);
                }
            },
        });
    };

    const handleRemoveMember = (membershipId: string, memberName: string) => {
        setConfirmModal({
            title: "Remove Team Member",
            message: `Are you sure you want to remove ${memberName} from your team?`,
            onConfirm: async () => {
                try {
                    const token = await getToken();
                    if (!token) return;
                    const client = createAuthenticatedClient(token);
                    await client.delete(`/memberships/${membershipId}`);
                    toast.success(`Removed ${memberName} from team`);
                    fetchTeamMembers();
                } catch (error: any) {
                    console.error("Failed to remove member:", error);
                    toast.error(
                        error.message || "Failed to remove team member",
                    );
                } finally {
                    setConfirmModal(null);
                }
            },
        });
    };

    const pendingInvitations = invitations.filter(
        (inv) => inv.status === "pending",
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="loading loading-spinner loading-lg" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Invite New Member */}
            <DetailSection
                title="Invite Team Member"
                icon="fa-duotone fa-regular fa-user-plus"
                accent="teal"
            >
                <form onSubmit={handleInvite} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Email Address"
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="colleague@example.com"
                            required
                            disabled={inviting}
                        />

                        <Select
                            label="Role"
                            value={inviteRole}
                            onChange={(e) => setInviteRole(e.target.value)}
                            options={ROLES}
                            disabled={inviting}
                        />

                        <div>
                            <Select
                                label="Access Scope"
                                value={inviteScope}
                                onChange={(e) => setInviteScope(e.target.value)}
                                options={SCOPES}
                                disabled={inviting}
                            />
                            <p className="text-xs text-dark/50 mt-1">
                                {inviteScope === "company"
                                    ? "User will only see this company's data"
                                    : "User will see all companies in the organization"}
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            color="teal"
                            disabled={inviting || !inviteEmail.trim()}
                        >
                            <ButtonLoading
                                loading={inviting}
                                text="Send Invitation"
                                loadingText="Sending..."
                                icon="fa-duotone fa-regular fa-paper-plane"
                            />
                        </Button>
                    </div>
                </form>
            </DetailSection>

            {/* Pending Invitations */}
            {pendingInvitations.length > 0 && (
                <DetailSection
                    title={`Pending Invitations (${pendingInvitations.length})`}
                    icon="fa-duotone fa-regular fa-clock"
                    accent="yellow"
                >
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr className="border-b-4 border-dark">
                                    <th className="text-xs font-black uppercase tracking-wider text-dark">
                                        Email
                                    </th>
                                    <th className="text-xs font-black uppercase tracking-wider text-dark">
                                        Role
                                    </th>
                                    <th className="text-xs font-black uppercase tracking-wider text-dark">
                                        Scope
                                    </th>
                                    <th className="text-xs font-black uppercase tracking-wider text-dark">
                                        Sent
                                    </th>
                                    <th className="text-xs font-black uppercase tracking-wider text-dark">
                                        Expires
                                    </th>
                                    <th className="text-xs font-black uppercase tracking-wider text-dark" />
                                </tr>
                            </thead>
                            <tbody>
                                {pendingInvitations.map((invitation) => (
                                    <tr
                                        key={invitation.id}
                                        className="border-b-2 border-cream"
                                    >
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <i className="fa-duotone fa-regular fa-envelope text-yellow" />
                                                <span className="text-sm font-bold text-dark">
                                                    {invitation.email}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <Badge
                                                color={getRoleBadgeColor(
                                                    invitation.role,
                                                )}
                                                size="sm"
                                            >
                                                {getRoleLabel(invitation.role)}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Badge
                                                color={
                                                    invitation.company_id
                                                        ? "purple"
                                                        : "teal"
                                                }
                                                size="sm"
                                                variant="outline"
                                            >
                                                {invitation.company_id
                                                    ? "Company"
                                                    : "Organization"}
                                            </Badge>
                                        </td>
                                        <td className="text-sm text-dark/50">
                                            {new Date(
                                                invitation.created_at,
                                            ).toLocaleDateString()}
                                        </td>
                                        <td className="text-sm text-dark/50">
                                            {new Date(
                                                invitation.expires_at,
                                            ).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <Button
                                                color="coral"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    handleRevokeInvitation(
                                                        invitation.id,
                                                        invitation.email,
                                                    )
                                                }
                                            >
                                                <i className="fa-duotone fa-regular fa-ban" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </DetailSection>
            )}

            {/* Team Members */}
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
                                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center border-4 border-err bg-coral">
                                    <span className="text-xs font-black text-white">
                                        {(
                                            member.users?.name ||
                                            member.users?.email ||
                                            "U"
                                        )
                                            .substring(0, 2)
                                            .toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-dark truncate">
                                        {member.users?.name || "Unknown"}
                                    </p>
                                    <p className="text-xs text-dark/50 truncate">
                                        {member.users?.email}
                                    </p>
                                </div>
                                <Badge
                                    color={getRoleBadgeColor(member.role_name)}
                                    size="sm"
                                    variant="outline"
                                >
                                    {getRoleLabel(member.role_name)}
                                </Badge>
                                <span className="text-xs text-dark/40">
                                    {new Date(
                                        member.created_at,
                                    ).toLocaleDateString()}
                                </span>
                                {member.role_name !== "company_admin" && (
                                    <Button
                                        color="coral"
                                        variant="ghost"
                                        size="xs"
                                        onClick={() =>
                                            handleRemoveMember(
                                                member.id,
                                                member.users?.name ||
                                                    member.users?.email ||
                                                    "user",
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
                        description="Invite colleagues to join your hiring team"
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
                            <Badge color="coral" size="sm">
                                Admin
                            </Badge>
                            <span className="text-sm font-bold text-dark">
                                Company Admin
                            </span>
                        </div>
                        <ul className="space-y-1">
                            {[
                                "Full access to all features",
                                "Manage team members",
                                "Create and manage roles",
                                "View all candidates and applications",
                                "Manage company settings",
                                "Approve placements and fees",
                            ].map((perm) => (
                                <li
                                    key={perm}
                                    className="text-xs text-dark/60 flex items-center gap-2"
                                >
                                    <i className="fa-solid fa-check text-teal text-[10px]" />
                                    {perm}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Badge color="teal" size="sm">
                                Hiring Manager
                            </Badge>
                            <span className="text-sm font-bold text-dark">
                                Hiring Manager
                            </span>
                        </div>
                        <ul className="space-y-1">
                            {[
                                "View assigned roles and candidates",
                                "Review applications",
                                "Schedule interviews",
                                "Move candidates through pipeline",
                                "Request pre-screens",
                                "Cannot manage team or settings",
                            ].map((perm) => (
                                <li
                                    key={perm}
                                    className="text-xs text-dark/60 flex items-center gap-2"
                                >
                                    <i className="fa-solid fa-check text-teal text-[10px]" />
                                    {perm}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </DetailSection>

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
