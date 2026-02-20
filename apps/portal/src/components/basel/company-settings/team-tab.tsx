"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import {
    BaselFormField,
    BaselStatusPill,
    BaselEmptyState,
    BaselConfirmModal,
} from "@splits-network/basel-ui";
import { ButtonLoading } from "@splits-network/shared-ui";
import type { TeamMember, Invitation } from "@/app/portal/company/settings/types";

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

function getRolePillColor(
    role: string,
): "error" | "success" | "primary" {
    switch (role) {
        case "company_admin":
            return "error";
        case "hiring_manager":
            return "success";
        default:
            return "primary";
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
                inviteScope === "company"
                    ? "your company"
                    : "the organization";
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
                    toast.error(
                        error.message || "Failed to revoke invitation",
                    );
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
        <div>
            <h2 className="text-xl font-black tracking-tight mb-1">
                Team Management
            </h2>
            <p className="text-sm text-base-content/50 mb-8">
                Invite colleagues and manage team access.
            </p>

            {/* ── Invite New Member ──────────────────────────────────────── */}
            <div className="bg-base-200 border border-base-300 p-6 mb-8">
                <h3 className="font-bold mb-4">Invite Team Member</h3>
                <form onSubmit={handleInvite}>
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <BaselFormField label="Email Address" required>
                            <input
                                type="email"
                                value={inviteEmail}
                                onChange={(e) =>
                                    setInviteEmail(e.target.value)
                                }
                                placeholder="colleague@example.com"
                                className="input input-bordered w-full"
                                required
                                disabled={inviting}
                            />
                        </BaselFormField>

                        <BaselFormField label="Role">
                            <select
                                value={inviteRole}
                                onChange={(e) =>
                                    setInviteRole(e.target.value)
                                }
                                className="select select-bordered w-full"
                                disabled={inviting}
                            >
                                {ROLES.map((r) => (
                                    <option key={r.value} value={r.value}>
                                        {r.label}
                                    </option>
                                ))}
                            </select>
                        </BaselFormField>

                        <BaselFormField
                            label="Access Scope"
                            hint={
                                inviteScope === "company"
                                    ? "User will only see this company's data"
                                    : "User will see all companies in the organization"
                            }
                        >
                            <select
                                value={inviteScope}
                                onChange={(e) =>
                                    setInviteScope(e.target.value)
                                }
                                className="select select-bordered w-full"
                                disabled={inviting}
                            >
                                {SCOPES.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                        </BaselFormField>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={inviting || !inviteEmail.trim()}
                        >
                            <ButtonLoading
                                loading={inviting}
                                text="Send Invitation"
                                loadingText="Sending..."
                                icon="fa-duotone fa-regular fa-paper-plane"
                            />
                        </button>
                    </div>
                </form>
            </div>

            {/* ── Pending Invitations ────────────────────────────────────── */}
            {pendingInvitations.length > 0 && (
                <div className="bg-base-200 border border-base-300 p-6 mb-8">
                    <h3 className="font-bold mb-4">
                        Pending Invitations ({pendingInvitations.length})
                    </h3>
                    <div className="space-y-0">
                        {pendingInvitations.map((invitation, idx) => (
                            <div
                                key={invitation.id}
                                className={`flex items-center justify-between py-3 ${
                                    idx < pendingInvitations.length - 1
                                        ? "border-b border-base-300"
                                        : ""
                                }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <i className="fa-duotone fa-regular fa-envelope text-base-content/30" />
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold truncate">
                                            {invitation.email}
                                        </p>
                                        <p className="text-xs text-base-content/40">
                                            Sent{" "}
                                            {new Date(
                                                invitation.created_at,
                                            ).toLocaleDateString()}{" "}
                                            &middot; Expires{" "}
                                            {new Date(
                                                invitation.expires_at,
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <BaselStatusPill
                                        color={getRolePillColor(
                                            invitation.role,
                                        )}
                                    >
                                        {getRoleLabel(invitation.role)}
                                    </BaselStatusPill>
                                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-base-300 text-base-content/60">
                                        {invitation.company_id
                                            ? "Company"
                                            : "Org"}
                                    </span>
                                    <button
                                        className="btn btn-xs btn-ghost text-error"
                                        onClick={() =>
                                            handleRevokeInvitation(
                                                invitation.id,
                                                invitation.email,
                                            )
                                        }
                                    >
                                        <i className="fa-duotone fa-regular fa-ban" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Team Members ───────────────────────────────────────────── */}
            <div className="bg-base-200 border border-base-300 p-6 mb-8">
                <h3 className="font-bold mb-4">
                    Team Members ({members.length})
                </h3>
                {members.length > 0 ? (
                    <div className="space-y-0">
                        {members.map((member, idx) => (
                            <div
                                key={member.id}
                                className={`flex items-center gap-4 py-4 ${
                                    idx < members.length - 1
                                        ? "border-b border-base-300"
                                        : ""
                                }`}
                            >
                                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-primary text-primary-content font-black text-xs">
                                    {(
                                        member.users?.name ||
                                        member.users?.email ||
                                        "U"
                                    )
                                        .substring(0, 2)
                                        .toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate">
                                        {member.users?.name || "Unknown"}
                                    </p>
                                    <p className="text-xs text-base-content/40 truncate">
                                        {member.users?.email}
                                    </p>
                                </div>
                                <BaselStatusPill
                                    color={getRolePillColor(member.role_name)}
                                >
                                    {getRoleLabel(member.role_name)}
                                </BaselStatusPill>
                                <span className="text-xs text-base-content/30">
                                    {new Date(
                                        member.created_at,
                                    ).toLocaleDateString()}
                                </span>
                                {member.role_name !== "company_admin" && (
                                    <button
                                        className="btn btn-xs btn-ghost text-error"
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
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <BaselEmptyState
                        icon="fa-duotone fa-regular fa-users"
                        title="No Team Members Yet"
                        subtitle="Invite colleagues to join your hiring team."
                    />
                )}
            </div>

            {/* ── Role Permissions ────────────────────────────────────────── */}
            <div className="bg-base-200 border border-base-300 p-6">
                <h3 className="font-bold mb-4">Role Permissions</h3>
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <BaselStatusPill color="error">Admin</BaselStatusPill>
                            <span className="text-sm font-semibold">
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
                                    className="text-xs text-base-content/50 flex items-center gap-2"
                                >
                                    <i className="fa-solid fa-check text-success text-[10px]" />
                                    {perm}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <BaselStatusPill color="success">
                                Hiring Manager
                            </BaselStatusPill>
                            <span className="text-sm font-semibold">
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
                                    className="text-xs text-base-content/50 flex items-center gap-2"
                                >
                                    <i className="fa-solid fa-check text-success text-[10px]" />
                                    {perm}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* ── Confirmation Modal ─────────────────────────────────────── */}
            <BaselConfirmModal
                isOpen={!!confirmModal}
                title={confirmModal?.title || ""}
                confirmLabel="Confirm"
                confirmColor="btn-error"
                onConfirm={() => confirmModal?.onConfirm()}
                onClose={() => setConfirmModal(null)}
            >
                <p className="text-sm text-base-content/70">
                    {confirmModal?.message}
                </p>
            </BaselConfirmModal>
        </div>
    );
}
