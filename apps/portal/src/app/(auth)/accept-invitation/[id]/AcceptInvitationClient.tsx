"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
    createAuthenticatedClient,
    createUnauthenticatedClient,
} from "@/lib/api-client";
import { useUserProfile } from "@/contexts";

// Public preview — only non-sensitive fields, no email exposed
interface InvitationPreview {
    id: string;
    organization_name: string | null;
    organization_slug: string | null;
    role: string;
    status: string;
    expires_at: string;
}

interface Props {
    invitationId: string;
    userId: string;
    userEmail: string;
}

const roleLabels: Record<string, string> = {
    company_admin: "Company Administrator",
    hiring_manager: "Hiring Manager",
    recruiter: "Recruiter",
};

export default function AcceptInvitationClient({
    invitationId,
    userId,
    userEmail,
}: Props) {
    const router = useRouter();
    const { getToken } = useAuth();
    const { refresh: refreshProfile } = useUserProfile();

    const isAuthenticated = !!userId;

    const [preview, setPreview] = useState<InvitationPreview | null>(null);
    const [previewLoading, setPreviewLoading] = useState(true);
    const [previewError, setPreviewError] = useState<
        "not_found" | "failed" | null
    >(null);

    const [accepting, setAccepting] = useState(false);
    const [acceptError, setAcceptError] = useState<string | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    // Validate that the signed-in user's email matches the invitation target
    const [emailMismatch, setEmailMismatch] = useState(false);

    // ── Step 1: Load public preview (no auth required) ───────────────────────
    useEffect(() => {
        async function loadPreview() {
            try {
                const client = createUnauthenticatedClient();
                const response = await client.get(
                    `/invitations/${invitationId}/preview`,
                );
                setPreview(response.data);
            } catch (err: any) {
                const status = err.response?.status;
                setPreviewError(status === 404 ? "not_found" : "failed");
            } finally {
                setPreviewLoading(false);
            }
        }

        loadPreview();
    }, [invitationId]);

    // ── Step 2: If authenticated, validate the invitation email matches ───────
    useEffect(() => {
        if (!isAuthenticated || !preview || !userEmail) return;

        async function validateEmail() {
            try {
                const token = await getToken();
                if (!token) return;

                const client = createAuthenticatedClient(token);
                const response = await client.get(
                    `/invitations/${invitationId}?email=${encodeURIComponent(userEmail)}`,
                );
                const invitation = response.data;

                if (
                    userEmail.toLowerCase() !==
                    invitation.email?.toLowerCase()
                ) {
                    setEmailMismatch(true);
                }
            } catch {
                // If validation fails, allow accept — the server enforces email match
            }
        }

        validateEmail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, preview, userEmail, invitationId]);

    async function handleAccept() {
        setAccepting(true);
        setAcceptError(null);

        try {
            const token = await getToken();
            if (!token) throw new Error("Authentication token not available");

            const client = createAuthenticatedClient(token);
            await client.post(`/invitations/${invitationId}/accept`, {
                user_email: userEmail,
            });

            await refreshProfile();
            setShowSuccess(true);

            setTimeout(() => {
                router.push("/portal/dashboard");
            }, 2000);
        } catch (err: any) {
            setAcceptError(
                err.message ||
                    "An error occurred while accepting the invitation",
            );
            setAccepting(false);
        }
    }

    // ── Loading ───────────────────────────────────────────────────────────────
    if (previewLoading) {
        return (
            <div className="py-8">
                <div className="flex flex-col items-center gap-4">
                    <div className="skeleton h-16 w-16"></div>
                    <div className="skeleton h-8 w-48"></div>
                </div>
                <div className="space-y-4 mt-6">
                    <div className="skeleton h-16 w-full"></div>
                    <div className="skeleton h-16 w-full"></div>
                    <div className="skeleton h-16 w-full"></div>
                </div>
            </div>
        );
    }

    // ── Not found ─────────────────────────────────────────────────────────────
    if (previewError === "not_found" || (!preview && !previewLoading)) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-base-200 flex items-center justify-center">
                    <i className="fa-duotone fa-regular fa-envelope-circle-check text-3xl text-warning" />
                </div>
                <h1 className="text-3xl font-black tracking-tight mb-2">
                    Invitation Not Found
                </h1>
                <p className="text-base-content/60 mb-8 leading-relaxed max-w-sm mx-auto">
                    This invitation link appears to be invalid or may have been
                    removed. This can happen if the invitation was cancelled or
                    the link was mistyped.
                </p>
                <p className="text-xs text-base-content/30 mt-8">
                    Invitation ID:{" "}
                    <code className="text-xs">{invitationId}</code>
                </p>
            </div>
        );
    }

    // ── General load error ────────────────────────────────────────────────────
    if (previewError === "failed") {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-base-200 flex items-center justify-center">
                    <i className="fa-duotone fa-regular fa-circle-exclamation text-3xl text-error" />
                </div>
                <h1 className="text-3xl font-black tracking-tight mb-2">
                    Something Went Wrong
                </h1>
                <p className="text-base-content/60 mb-8 leading-relaxed max-w-sm mx-auto">
                    We couldn't load this invitation. Please try again.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="btn btn-primary"
                >
                    Try Again
                </button>
            </div>
        );
    }

    // From here preview is guaranteed non-null
    const { role, status, expires_at } = preview!;
    const orgName =
        preview!.organization_name ||
        preview!.organization_slug ||
        "an organization";
    const roleLabel = roleLabels[role] || role;
    const expiresAt = new Date(expires_at);
    const isExpired = expiresAt < new Date();

    // ── Success ───────────────────────────────────────────────────────────────
    if (showSuccess) {
        return (
            <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-6 bg-success/10 flex items-center justify-center">
                    <i className="fa-duotone fa-regular fa-circle-check text-success text-4xl" />
                </div>
                <h1 className="text-3xl font-black tracking-tight mb-2">
                    Welcome to {orgName}!
                </h1>
                <p className="text-base-content/60 mb-6">
                    You've successfully joined as a{" "}
                    <strong className="text-base-content">{roleLabel}</strong>.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-base-content/50">
                    <span className="loading loading-spinner loading-sm" />
                    <span>Redirecting you to your dashboard...</span>
                </div>
            </div>
        );
    }

    // ── Status: expired or non-pending ────────────────────────────────────────
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
                "If you need to access this organization, go to your dashboard.",
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

    if (isExpired || status !== "pending") {
        const scenario =
            statusScenarios[isExpired ? "expired" : status] ||
            statusScenarios.revoked;
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-base-200 flex items-center justify-center">
                    <i
                        className={`fa-duotone fa-regular ${scenario.icon} text-3xl ${scenario.iconColor}`}
                    />
                </div>
                <h1 className="text-3xl font-black tracking-tight mb-2">
                    {scenario.title}
                </h1>
                <p className="text-base-content/60 mb-2 leading-relaxed">
                    {scenario.message}
                </p>
                {scenario.details && (
                    <p className="text-sm text-base-content/40 mb-8 leading-relaxed">
                        {scenario.details}
                    </p>
                )}
                {isAuthenticated && (
                    <div className="flex flex-col gap-3 max-w-xs mx-auto mt-6">
                        <button
                            onClick={() => router.push("/portal/dashboard")}
                            className="btn btn-primary w-full"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                )}
                <p className="text-xs text-base-content/30 mt-8">
                    Organization: {orgName}
                </p>
            </div>
        );
    }

    // ── Invitation card used in both authed and non-authed views ─────────────
    const invitationDetails = (
        <div className="space-y-3 mb-6">
            <div className="bg-base-200 p-4">
                <span className="text-[10px] uppercase tracking-widest text-base-content/40">
                    Organization
                </span>
                <p className="text-lg font-bold mt-1">{orgName}</p>
            </div>
            <div className="bg-base-200 p-4">
                <span className="text-[10px] uppercase tracking-widest text-base-content/40">
                    Your Role
                </span>
                <p className="mt-1">
                    <span className="badge badge-primary">{roleLabel}</span>
                </p>
            </div>
            <div className="bg-base-200 p-4">
                <span className="text-[10px] uppercase tracking-widest text-base-content/40">
                    Invitation Expires
                </span>
                <p className="text-sm font-semibold mt-1">
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
    );

    const redirectUrl = encodeURIComponent(
        `/accept-invitation/${invitationId}`,
    );

    // ── Not authenticated: preview + sign-in / create-account CTAs ───────────
    if (!isAuthenticated) {
        return (
            <div className="py-4">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 flex items-center justify-center">
                        <i className="fa-duotone fa-regular fa-envelope-open-text text-primary text-2xl" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight">
                        You've Been Invited!
                    </h1>
                    <p className="text-base-content/60 mt-2 text-sm">
                        Join{" "}
                        <strong className="text-base-content">{orgName}</strong>{" "}
                        as a{" "}
                        <strong className="text-base-content">
                            {roleLabel}
                        </strong>
                        .
                    </p>
                </div>

                {invitationDetails}

                <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-base-300" />
                    <span className="text-xs text-base-content/40 uppercase tracking-widest">
                        To Accept
                    </span>
                    <div className="flex-1 h-px bg-base-300" />
                </div>

                <div className="flex flex-col gap-3">
                    <a
                        href={`/sign-in?redirect_url=${redirectUrl}`}
                        className="btn btn-primary w-full"
                    >
                        <i className="fa-duotone fa-regular fa-arrow-right-to-bracket" />
                        Sign In to Accept
                    </a>
                    <a
                        href={`/sign-up?redirect_url=${redirectUrl}`}
                        className="btn btn-ghost w-full border border-base-300"
                    >
                        <i className="fa-duotone fa-regular fa-user-plus" />
                        Create Account
                    </a>
                </div>
            </div>
        );
    }

    // ── Authenticated: email mismatch ─────────────────────────────────────────
    if (emailMismatch) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-base-200 flex items-center justify-center">
                    <i className="fa-duotone fa-regular fa-shield-exclamation text-3xl text-error" />
                </div>
                <h1 className="text-3xl font-black tracking-tight mb-2">
                    Wrong Account
                </h1>
                <p className="text-base-content/60 mb-8 leading-relaxed max-w-sm mx-auto">
                    This invitation was sent to a different email address. Please
                    sign in with the account that received the invitation.
                </p>
                <div className="flex flex-col gap-3 max-w-xs mx-auto">
                    <a
                        href={`/sign-in?redirect_url=${redirectUrl}`}
                        className="btn btn-primary w-full"
                    >
                        Sign In with Another Account
                    </a>
                </div>
            </div>
        );
    }

    // ── Authenticated: accept / decline ───────────────────────────────────────
    return (
        <div className="py-4">
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 flex items-center justify-center">
                    <i className="fa-duotone fa-regular fa-envelope-open-text text-primary text-2xl" />
                </div>
                <h1 className="text-3xl font-black tracking-tight">
                    You've Been Invited!
                </h1>
            </div>

            {invitationDetails}

            <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-base-300" />
            </div>

            {acceptError && (
                <div className="alert alert-error mb-4" role="alert">
                    <i className="fa-duotone fa-regular fa-circle-exclamation" />
                    <span>{acceptError}</span>
                </div>
            )}

            <p className="text-sm text-base-content/60 text-center mb-6">
                By accepting, you will become a member of{" "}
                <strong className="text-base-content">{orgName}</strong> with{" "}
                {roleLabel} privileges.
            </p>

            <div className="flex gap-3">
                <button
                    type="button"
                    className="btn btn-ghost flex-1 border border-base-300"
                    onClick={() => router.push("/")}
                    disabled={accepting}
                >
                    Decline
                </button>
                <button
                    type="button"
                    className="btn btn-primary flex-1"
                    onClick={handleAccept}
                    disabled={accepting}
                >
                    {accepting ? (
                        <>
                            <span className="loading loading-spinner loading-sm" />
                            Accepting...
                        </>
                    ) : (
                        <>
                            <i className="fa-duotone fa-regular fa-check" />
                            Accept Invitation
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
