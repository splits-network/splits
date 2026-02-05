"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useToast } from "@/lib/toast-context";
import Link from "next/link";

interface TeamMember {
    id: string;
    user_id: string;
    organization_id: string;
    role: string;
    user?: {
        id: string;
        name?: string;
        email: string;
    };
    created_at: string;
}

interface Invitation {
    id: string;
    email: string;
    role: string;
    status: string;
    company_id: string | null;
    created_at: string;
    expires_at: string;
}

interface TeamManagementContentProps {
    organizationId: string;
    companyId: string;
}

export default function TeamManagementContent({
    organizationId,
    companyId,
}: TeamManagementContentProps) {
    const auth = useAuth();
    const { getToken } = auth;
    const toast = useToast();
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [loading, setLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("hiring_manager");
    const [inviteScope, setInviteScope] = useState<"company" | "org">(
        "company",
    );
    const [inviting, setInviting] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{
        show: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
    } | null>(null);

    useEffect(() => {
        fetchTeamMembers();
        fetchInvitations();
    }, []);

    const fetchTeamMembers = async () => {
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
    };

    const fetchInvitations = async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            // Fetch all pending invitations for this organization
            // This includes both company-scoped (company_id set) and org-scoped (company_id null)
            const response: any = await client.get(
                `/invitations?organization_id=${organizationId}&status=pending`,
            );
            setInvitations(response.data || []);
        } catch (error) {
            console.error("Failed to fetch invitations:", error);
        }
    };

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

            // Get current user ID from auth
            const { userId } = auth;
            if (!userId) {
                toast.error("User ID not found");
                setInviting(false);
                return;
            }

            const client = createAuthenticatedClient(token);

            // Determine company_id based on scope
            const inviteCompanyId =
                inviteScope === "company" ? companyId : null;

            // Create invitation using V2 API
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
                `Invitation sent to ${inviteEmail} for ${scopeText}. They will receive an email with instructions to join.`,
            );
            setInviteEmail("");
            setInviteRole("hiring_manager");
            setInviteScope("company");

            // Refresh invitations list
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
            show: true,
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
            show: true,
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

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "company_admin":
                return "badge-primary";
            case "hiring_manager":
                return "badge-secondary";
            default:
                return "badge-ghost";
        }
    };

    const getRoleLabel = (role: string) => {
        switch (role) {
            case "company_admin":
                return "Admin";
            case "hiring_manager":
                return "Hiring Manager";
            default:
                return role;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Invite New Member */}
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <h2 className="card-title">
                        <i className="fa-duotone fa-regular fa-user-plus"></i>
                        Invite Team Member
                    </h2>

                    <form onSubmit={handleInvite} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Email Address
                                </legend>
                                <input
                                    type="email"
                                    className="input w-full"
                                    value={inviteEmail}
                                    onChange={(e) =>
                                        setInviteEmail(e.target.value)
                                    }
                                    placeholder="colleague@example.com"
                                    required
                                    disabled={inviting}
                                />
                            </fieldset>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Role
                                </legend>
                                <select
                                    className="select w-full"
                                    value={inviteRole}
                                    onChange={(e) =>
                                        setInviteRole(e.target.value)
                                    }
                                    disabled={inviting}
                                >
                                    <option value="hiring_manager">
                                        Hiring Manager
                                    </option>
                                    <option value="company_admin">Admin</option>
                                </select>
                            </fieldset>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    Access Scope
                                </legend>
                                <select
                                    className="select w-full"
                                    value={inviteScope}
                                    onChange={(e) =>
                                        setInviteScope(
                                            e.target.value as "company" | "org",
                                        )
                                    }
                                    disabled={inviting}
                                >
                                    <option value="company">
                                        This Company Only
                                    </option>
                                    <option value="org">
                                        Entire Organization
                                    </option>
                                </select>
                                <p className="fieldset-label text-base-content/60">
                                    {inviteScope === "company"
                                        ? "User will only see this company's data"
                                        : "User will see all companies in the organization"}
                                </p>
                            </fieldset>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={inviting || !inviteEmail.trim()}
                            >
                                {inviting ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-duotone fa-regular fa-paper-plane"></i>
                                        Send Invitation
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Pending Invitations */}
            {invitations.length > 0 && (
                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <h2 className="card-title">
                            <i className="fa-duotone fa-regular fa-clock"></i>
                            Pending Invitations (
                            {
                                invitations.filter(
                                    (inv) => inv.status === "pending",
                                ).length
                            }
                            )
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Scope</th>
                                        <th>Sent</th>
                                        <th>Expires</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invitations
                                        .filter(
                                            (inv) => inv.status === "pending",
                                        )
                                        .map((invitation) => (
                                            <tr key={invitation.id}>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        <i className="fa-duotone fa-regular fa-envelope text-warning"></i>
                                                        {invitation.email}
                                                    </div>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`badge ${getRoleBadge(invitation.role)}`}
                                                    >
                                                        {getRoleLabel(
                                                            invitation.role,
                                                        )}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span
                                                        className={`badge ${invitation.company_id ? "badge-accent" : "badge-info"}`}
                                                    >
                                                        {invitation.company_id
                                                            ? "Company"
                                                            : "Organization"}
                                                    </span>
                                                </td>
                                                <td className="text-sm text-base-content/70">
                                                    {new Date(
                                                        invitation.created_at,
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td className="text-sm text-base-content/70">
                                                    {new Date(
                                                        invitation.expires_at,
                                                    ).toLocaleDateString()}
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() =>
                                                            handleRevokeInvitation(
                                                                invitation.id,
                                                                invitation.email,
                                                            )
                                                        }
                                                        className="btn btn-sm btn-ghost btn-error"
                                                        title="Revoke invitation"
                                                    >
                                                        <i className="fa-duotone fa-regular fa-ban"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Team Members List */}
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <h2 className="card-title">
                        <i className="fa-duotone fa-regular fa-users"></i>
                        Team Members ({members.length})
                    </h2>

                    {members.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {members.map((member) => (
                                        <tr key={member.id}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar avatar-placeholder">
                                                        <div className="bg-neutral text-neutral-content rounded-full w-10">
                                                            <span className="text-xs">
                                                                {(
                                                                    member.user
                                                                        ?.name ||
                                                                    member.user
                                                                        ?.email ||
                                                                    "U"
                                                                )
                                                                    .substring(
                                                                        0,
                                                                        2,
                                                                    )
                                                                    .toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">
                                                            {member.user
                                                                ?.name ||
                                                                "Unknown"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{member.user?.email}</td>
                                            <td>
                                                <span
                                                    className={`badge ${getRoleBadge(member.role)}`}
                                                >
                                                    {getRoleLabel(member.role)}
                                                </span>
                                            </td>
                                            <td>
                                                {new Date(
                                                    member.created_at,
                                                ).toLocaleDateString()}
                                            </td>
                                            <td>
                                                {member.role !==
                                                    "company_admin" && (
                                                    <button
                                                        className="btn btn-ghost btn-xs text-error"
                                                        onClick={() =>
                                                            handleRemoveMember(
                                                                member.id,
                                                                member.user
                                                                    ?.name ||
                                                                    member.user
                                                                        ?.email ||
                                                                    "user",
                                                            )
                                                        }
                                                    >
                                                        <i className="fa-duotone fa-regular fa-trash"></i>
                                                        Remove
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <i className="fa-duotone fa-regular fa-users text-6xl text-base-content/20"></i>
                            <h3 className="text-xl font-semibold mt-4">
                                No Team Members Yet
                            </h3>
                            <p className="text-base-content/70 mt-2">
                                Invite colleagues to join your hiring team
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Role Descriptions */}
            <div className="card bg-base-100 shadow">
                <div className="card-body">
                    <h2 className="card-title">
                        <i className="fa-duotone fa-regular fa-circle-info"></i>
                        Role Permissions
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold flex items-center gap-2">
                                <span className="badge badge-primary">
                                    Admin
                                </span>
                                Company Admin
                            </h3>
                            <ul className="list-disc list-inside text-sm text-base-content/70 mt-2 space-y-1">
                                <li>Full access to all features</li>
                                <li>Manage team members</li>
                                <li>Create and manage roles</li>
                                <li>View all candidates and applications</li>
                                <li>Manage company settings</li>
                                <li>Approve placements and fees</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold flex items-center gap-2">
                                <span className="badge badge-secondary">
                                    Hiring Manager
                                </span>
                                Hiring Manager
                            </h3>
                            <ul className="list-disc list-inside text-sm text-base-content/70 mt-2 space-y-1">
                                <li>View assigned roles and candidates</li>
                                <li>Review applications</li>
                                <li>Schedule interviews</li>
                                <li>Move candidates through pipeline</li>
                                <li>Request pre-screens</li>
                                <li>Cannot manage team or settings</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {confirmModal && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">
                            {confirmModal.title}
                        </h3>
                        <p className="py-4">{confirmModal.message}</p>
                        <div className="modal-action">
                            <button
                                className="btn btn-ghost"
                                onClick={() => setConfirmModal(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-error"
                                onClick={confirmModal.onConfirm}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
