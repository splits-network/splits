"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useUserProfile } from "@/contexts";

interface Invitation {
    id: string;
    email: string;
    organization_id: string;
    role: string;
    invited_by: string;
    status: string;
    expires_at: string;
    created_at: string;
}

interface Organization {
    id: string;
    name: string;
    slug: string;
    display_name?: string;
}

interface Props {
    invitationId: string;
    userId: string;
    userEmail: string;
}

export default function AcceptInvitationClient({
    invitationId,
    userId,
    userEmail,
}: Props) {
    const router = useRouter();
    const { getToken } = useAuth();
    const { refresh: refreshProfile } = useUserProfile();
    const [invitation, setInvitation] = useState<Invitation | null>(null);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [acceptedRole, setAcceptedRole] = useState<string | null>(null);

    const roleLabels: Record<string, string> = {
        company_admin: "Company Administrator",
        hiring_manager: "Hiring Manager",
        recruiter: "Recruiter",
    };

    useEffect(() => {
        async function fetchInvitationAndOrganization() {
            try {
                const token = await getToken();

                if (!token) {
                    setError("Authentication required");
                    setLoading(false);
                    return;
                }

                const client = createAuthenticatedClient(token);

                // Fetch invitation details
                const invitationResponse = await client.get(
                    `/invitations/${invitationId}?email=${encodeURIComponent(userEmail)}`,
                );

                const invitationData = invitationResponse.data;

                if (!invitationData) {
                    setError("Invitation not found");
                    setLoading(false);
                    return;
                }

                setInvitation(invitationData);

                // Check if invitation is still pending
                if (invitationData.status !== "pending") {
                    setLoading(false);
                    return; // Let the UI show the status message
                }

                // Check if invitation has expired
                const expiresAt = new Date(invitationData.expires_at);
                if (expiresAt < new Date()) {
                    setLoading(false);
                    return; // Let the UI show the expired message
                }

                // Check if user email matches invitation email
                if (
                    userEmail.toLowerCase() !==
                    invitationData.email.toLowerCase()
                ) {
                    setError(
                        `Email mismatch. This invitation was sent to ${invitationData.email}, but you're logged in as ${userEmail}.`,
                    );
                    setLoading(false);
                    return;
                }

                // Fetch organization details
                try {
                    const orgResponse = await client.get(
                        `/organizations/${invitationData.organization_id}`,
                    );
                    setOrganization(orgResponse.data);
                } catch (orgError) {
                    // We can still proceed without organization details
                }

                setLoading(false);
            } catch (err: any) {
                // Parse error to provide specific feedback
                let errorMessage = "Failed to load invitation details";

                if (err.response) {
                    // API returned an error response
                    const status = err.response.status;
                    const message = err.response.data?.message || err.message;

                    if (status === 404 || message?.includes("not found")) {
                        errorMessage = "invitation_not_found";
                    } else if (status === 403 || message?.includes("access")) {
                        errorMessage = "no_access";
                    } else if (status === 401) {
                        errorMessage = "authentication_required";
                    } else {
                        errorMessage = message || errorMessage;
                    }
                } else if (err.message) {
                    errorMessage = err.message;
                }

                setError(errorMessage);
                setLoading(false);
            }
        }

        fetchInvitationAndOrganization();
    }, [invitationId, getToken, userEmail]);

    function getRoleBasedRedirect(role: string): string {
        // All roles redirect to the main dashboard
        return "/portal/dashboard";
    }

    async function handleAccept() {
        if (!invitation) {
            return;
        }

        setAccepting(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) {
                throw new Error("Authentication token not available");
            }

            const client = createAuthenticatedClient(token);

            await client.post(`/invitations/${invitation.id}/accept`, {
                user_email: userEmail,
            });

            // Backend has set onboarding_status: 'completed' and created membership with roles
            // Refresh the UserProfileContext to get the updated profile with roles
            console.log(
                "[AcceptInvitation] Refreshing user profile to load new roles...",
            );
            await refreshProfile();
            console.log("[AcceptInvitation] Profile refreshed");

            // Show success modal
            setAcceptedRole(invitation.role);
            setShowSuccess(true);

            // Redirect after 2 seconds to role-specific landing page
            setTimeout(() => {
                const redirectPath = getRoleBasedRedirect(invitation.role);
                router.push(redirectPath);
            }, 2000);
        } catch (err: any) {
            setError(
                err.message ||
                    "An error occurred while accepting the invitation",
            );
            setAccepting(false);
        }
    }

    function handleDecline() {
        router.push("/");
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
                <div className="card bg-base-100 shadow max-w-md w-full">
                    <div className="card-body">
                        {/* Header skeleton */}
                        <div className="flex flex-col items-center gap-4">
                            <div className="skeleton h-16 w-16 rounded-full"></div>
                            <div className="skeleton h-8 w-48"></div>
                        </div>

                        {/* Content skeleton */}
                        <div className="space-y-4 mt-6">
                            <div className="skeleton h-4 w-full"></div>
                            <div className="skeleton h-4 w-3/4"></div>
                            <div className="skeleton h-12 w-full"></div>
                            <div className="skeleton h-12 w-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
                <div className="card bg-base-100 shadow max-w-md w-full">
                    <div className="card-body text-center">
                        <div className="flex justify-center mb-4">
                            <div className="rounded-full bg-success/10 p-6">
                                <i className="fa-duotone fa-regular fa-check-circle text-6xl text-success"></i>
                            </div>
                        </div>

                        <h1 className="card-title text-2xl justify-center mb-2">
                            Welcome to{" "}
                            {organization?.display_name ||
                                organization?.name ||
                                "the team"}
                            !
                        </h1>

                        <p className="text-base-content/70 mb-4">
                            You've successfully joined as a{" "}
                            <strong>
                                {roleLabels[acceptedRole || ""] || acceptedRole}
                            </strong>
                            .
                        </p>

                        <div className="flex items-center justify-center gap-2 text-sm text-base-content/60">
                            <span className="loading loading-spinner loading-sm"></span>
                            <span>Redirecting you to your dashboard...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        // Define specific error scenarios with helpful messaging
        const errorScenarios: Record<
            string,
            {
                icon: string;
                iconColor: string;
                title: string;
                message: string;
                actions: Array<{
                    label: string;
                    onClick: () => void;
                    variant?: string;
                }>;
            }
        > = {
            invitation_not_found: {
                icon: "fa-envelope-circle-check",
                iconColor: "text-warning",
                title: "Invitation Not Found",
                message:
                    "This invitation link appears to be invalid or may have been removed. This can happen if the invitation was cancelled or if the link was mistyped.",
                actions: [
                    {
                        label: "Go to Dashboard",
                        onClick: () => router.push("/portal/dashboard"),
                    },
                    {
                        label: "Contact Support",
                        onClick: () => router.push("/support"),
                        variant: "outline",
                    },
                ],
            },
            no_access: {
                icon: "fa-shield-exclamation",
                iconColor: "text-error",
                title: "Access Denied",
                message:
                    "You don't have permission to view this invitation. This invitation may be for a different email address.",
                actions: [
                    {
                        label: "Go to Dashboard",
                        onClick: () => router.push("/portal/dashboard"),
                    },
                    {
                        label: "Sign Out & Try Another Account",
                        onClick: () => router.push("/sign-out"),
                        variant: "outline",
                    },
                ],
            },
            authentication_required: {
                icon: "fa-user-lock",
                iconColor: "text-warning",
                title: "Authentication Required",
                message:
                    "Your session has expired. Please sign in again to view this invitation.",
                actions: [
                    {
                        label: "Sign In",
                        onClick: () =>
                            router.push(
                                `/sign-in?redirect_url=${encodeURIComponent(`/accept-invitation/${invitationId}`)}`,
                            ),
                        variant: "primary",
                    },
                ],
            },
        };

        const scenario = errorScenarios[error] || {
            icon: "fa-circle-exclamation",
            iconColor: "text-error",
            title: "Something Went Wrong",
            message:
                error ||
                "We encountered an unexpected error while loading your invitation. Please try again or contact support if the problem persists.",
            actions: [
                {
                    label: "Try Again",
                    onClick: () => window.location.reload(),
                    variant: "primary",
                },
                {
                    label: "Go to Dashboard",
                    onClick: () => router.push("/portal/dashboard"),
                    variant: "outline",
                },
                {
                    label: "Contact Support",
                    onClick: () => router.push("/support"),
                    variant: "ghost",
                },
            ],
        };

        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
                <div className="card bg-base-100 shadow max-w-md w-full">
                    <div className="card-body text-center">
                        <div className="flex justify-center mb-4">
                            <i
                                className={`fa-duotone fa-regular ${scenario.icon} text-6xl ${scenario.iconColor}`}
                            ></i>
                        </div>

                        <h1 className="card-title text-2xl justify-center mb-2">
                            {scenario.title}
                        </h1>

                        <p className="text-base-content/70 mb-6 leading-relaxed">
                            {scenario.message}
                        </p>

                        <div className="divider text-xs text-base-content/40">
                            What would you like to do?
                        </div>

                        <div className="flex flex-col gap-2 mt-4">
                            {scenario.actions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={action.onClick}
                                    className={`btn ${action.variant ? `btn-${action.variant}` : "btn-primary"} w-full`}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>

                        <p className="text-xs text-base-content/50 mt-6">
                            Invitation ID:{" "}
                            <code className="text-xs">{invitationId}</code>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!invitation) {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
                <div className="card bg-base-100 shadow max-w-md w-full">
                    <div className="card-body text-center">
                        <div className="flex justify-center mb-4">
                            <i className="fa-duotone fa-regular fa-envelope-circle-check text-6xl text-warning"></i>
                        </div>

                        <h1 className="card-title text-2xl justify-center mb-2">
                            Invitation Not Found
                        </h1>

                        <p className="text-base-content/70 mb-6 leading-relaxed">
                            This invitation link appears to be invalid or may
                            have been removed. This can happen if:
                        </p>

                        <ul className="text-left text-sm text-base-content/70 space-y-2 mb-6 list-disc list-inside">
                            <li>
                                The invitation was cancelled by the organization
                            </li>
                            <li>The link was mistyped or incomplete</li>
                            <li>The invitation already expired</li>
                        </ul>

                        <div className="divider text-xs text-base-content/40">
                            What would you like to do?
                        </div>

                        <div className="flex flex-col gap-2 mt-4">
                            <button
                                onClick={() => router.push("/portal/dashboard")}
                                className="btn btn-primary w-full"
                            >
                                Go to Dashboard
                            </button>
                            <button
                                onClick={() => router.push("/support")}
                                className="btn btn-outline w-full"
                            >
                                Contact Support
                            </button>
                        </div>

                        <p className="text-xs text-base-content/50 mt-6">
                            Invitation ID:{" "}
                            <code className="text-xs">{invitationId}</code>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Check if invitation is not pending
    if (invitation.status !== "pending") {
        const statusScenarios: Record<
            string,
            {
                icon: string;
                iconColor: string;
                title: string;
                message: string;
                details?: string;
            }
        > = {
            accepted: {
                icon: "fa-circle-check",
                iconColor: "text-success",
                title: "Already Accepted",
                message:
                    "This invitation has already been accepted. You're all set!",
                details:
                    "If you need to access this organization, go to your dashboard to see all your organizations.",
            },
            expired: {
                icon: "fa-clock-rotate-left",
                iconColor: "text-warning",
                title: "Invitation Expired",
                message: "This invitation expired and is no longer valid.",
                details:
                    "Contact the organization administrator to request a new invitation link.",
            },
            revoked: {
                icon: "fa-ban",
                iconColor: "text-error",
                title: "Invitation Revoked",
                message: "This invitation was cancelled by the organization.",
                details:
                    "If you believe this was a mistake, please contact the organization administrator.",
            },
        };

        const scenario =
            statusScenarios[invitation.status] || statusScenarios.revoked;

        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
                <div className="card bg-base-100 shadow max-w-md w-full">
                    <div className="card-body text-center">
                        <div className="flex justify-center mb-4">
                            <i
                                className={`fa-duotone fa-regular ${scenario.icon} text-6xl ${scenario.iconColor}`}
                            ></i>
                        </div>

                        <h1 className="card-title text-2xl justify-center mb-2">
                            {scenario.title}
                        </h1>

                        <p className="text-base-content/70 mb-3 leading-relaxed">
                            {scenario.message}
                        </p>

                        {scenario.details && (
                            <p className="text-sm text-base-content/60 mb-6 leading-relaxed">
                                {scenario.details}
                            </p>
                        )}

                        <div className="divider text-xs text-base-content/40">
                            What would you like to do?
                        </div>

                        <div className="flex flex-col gap-2 mt-4">
                            <button
                                onClick={() => router.push("/portal/dashboard")}
                                className="btn btn-primary w-full"
                            >
                                Go to Dashboard
                            </button>
                            {invitation.status === "expired" ||
                            invitation.status === "revoked" ? (
                                <button
                                    onClick={() => router.push("/support")}
                                    className="btn btn-outline w-full"
                                >
                                    Contact Support
                                </button>
                            ) : null}
                        </div>

                        <p className="text-xs text-base-content/50 mt-6">
                            Organization:{" "}
                            {organization?.display_name ||
                                organization?.name ||
                                "Unknown"}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Check if invitation has expired
    const expiresAt = new Date(invitation.expires_at);
    if (expiresAt < new Date()) {
        return (
            <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
                <div className="card bg-base-100 shadow max-w-md w-full">
                    <div className="card-body text-center">
                        <div className="flex justify-center mb-4">
                            <i className="fa-duotone fa-regular fa-clock-rotate-left text-6xl text-warning"></i>
                        </div>

                        <h1 className="card-title text-2xl justify-center mb-2">
                            Invitation Expired
                        </h1>

                        <p className="text-base-content/70 mb-3 leading-relaxed">
                            This invitation expired on{" "}
                            <strong>
                                {expiresAt.toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </strong>
                            .
                        </p>

                        <p className="text-sm text-base-content/60 mb-6 leading-relaxed">
                            Invitations have a limited validity period for
                            security reasons. Contact the organization
                            administrator to request a new invitation link.
                        </p>

                        <div className="divider text-xs text-base-content/40">
                            What would you like to do?
                        </div>

                        <div className="flex flex-col gap-2 mt-4">
                            <button
                                onClick={() => router.push("/portal/dashboard")}
                                className="btn btn-primary w-full"
                            >
                                Go to Dashboard
                            </button>
                            <button
                                onClick={() => router.push("/support")}
                                className="btn btn-outline w-full"
                            >
                                Contact Support
                            </button>
                        </div>

                        <p className="text-xs text-base-content/50 mt-6">
                            Organization:{" "}
                            {organization?.display_name ||
                                organization?.name ||
                                "Unknown"}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const roleLabel = roleLabels[invitation.role] || invitation.role;
    const orgName =
        organization?.display_name ||
        organization?.name ||
        organization?.slug ||
        "the organization";

    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
            <div className="card bg-base-100 shadow max-w-md w-full">
                <div className="card-body">
                    <div className="text-center mb-6">
                        <i className="fa-duotone fa-regular fa-envelope-open-text text-5xl text-primary mb-4"></i>
                        <h1 className="card-title text-2xl justify-center">
                            You've Been Invited!
                        </h1>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-base-content/60 mb-1">
                                Organization
                            </p>
                            <p className="text-lg font-semibold">{orgName}</p>
                        </div>

                        <div>
                            <p className="text-sm text-base-content/60 mb-1">
                                Your Role
                            </p>
                            <p className="text-lg">
                                <span className="badge badge-primary badge-lg">
                                    {roleLabel}
                                </span>
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-base-content/60 mb-1">
                                Invitation Expires
                            </p>
                            <p className="text-base">
                                {expiresAt.toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                })}
                            </p>
                        </div>
                    </div>

                    <div className="divider"></div>

                    {error && (
                        <div className="alert alert-error mb-4">
                            <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                            <span>{error}</span>
                        </div>
                    )}

                    <p className="text-sm text-base-content/70 text-center mb-4">
                        By accepting this invitation, you will become a member
                        of this organization with {roleLabel} privileges.
                    </p>

                    <div className="card-actions justify-center gap-3">
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={handleDecline}
                            disabled={accepting}
                        >
                            Decline
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleAccept}
                            disabled={accepting}
                        >
                            {accepting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Accepting...
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-check"></i>
                                    Accept Invitation
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
