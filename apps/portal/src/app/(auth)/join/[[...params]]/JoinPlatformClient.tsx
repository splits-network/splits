"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
    createAuthenticatedClient,
    createUnauthenticatedClient,
} from "@/lib/api-client";
import { ButtonLoading } from "@splits-network/shared-ui";

interface InvitationLookup {
    id: string;
    invite_code: string;
    company_name_hint?: string;
    personal_message?: string;
    status: "pending" | "accepted" | "expired" | "revoked";
    expires_at: string;
    recruiter: {
        name: string;
    };
    is_valid: boolean;
    error_message?: string;
}

interface Props {
    token?: string;
    code?: string;
}

export default function JoinPlatformClient({ token, code }: Props) {
    const router = useRouter();
    const { getToken, isSignedIn } = useAuth();

    const [invitation, setInvitation] = useState<InvitationLookup | null>(null);
    const [loading, setLoading] = useState(!!token || !!code);
    const [accepting, setAccepting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Code entry state
    const [enteredCode, setEnteredCode] = useState("");
    const [lookingUpCode, setLookingUpCode] = useState(false);

    // Load invitation from URL params on mount
    useEffect(() => {
        if (!token && !code) return;

        async function lookupInvitation() {
            try {
                const client = createUnauthenticatedClient();
                const params = new URLSearchParams();
                if (token) params.set("token", token);
                if (code) params.set("code", code);

                const response = await client.get(
                    `/company-invitations/lookup?${params.toString()}`,
                );
                setInvitation(response.data.data);
            } catch (err: any) {
                setError(
                    "Failed to load invitation. Please check your link and try again.",
                );
            } finally {
                setLoading(false);
            }
        }

        lookupInvitation();
    }, [token, code]);

    const handleCodeLookup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!enteredCode.trim()) return;

        setLookingUpCode(true);
        setError(null);

        try {
            const client = createUnauthenticatedClient();
            const response = await client.get(
                `/company-invitations/lookup?code=${encodeURIComponent(enteredCode.trim())}`,
            );
            const result = response.data; //this is correct, do not change to response.data.data - the lookup endpoint returns { data: { ...invitation } } but we want the full object including is_valid and error_message

            // Check if invitation is valid before showing it
            if (!result.is_valid) {
                // Show user-friendly error messages inline
                const errorMessages: Record<string, string> = {
                    "This invitation has already been used":
                        "This code has already been used to create a company account.",
                    "This invitation has been revoked":
                        "This invitation was cancelled by the recruiter.",
                    "This invitation has expired":
                        "This invitation has expired. Please request a new one.",
                    "Invitation not found":
                        "We couldn't find an invitation with this code.",
                };
                setError(
                    errorMessages[result.error_message] ||
                        result.error_message ||
                        "This invitation is no longer valid.",
                );
                return;
            }

            setInvitation(result);
        } catch (err: any) {
            setError("Invalid invite code. Please check and try again.");
        } finally {
            setLookingUpCode(false);
        }
    };

    const handleAccept = async () => {
        if (!invitation) return;

        // If not signed in, redirect to sign-up with return URL
        if (!isSignedIn) {
            const currentUrl = invitation.invite_code
                ? `/join?code=${invitation.invite_code}`
                : `/join/${invitation.id}`;
            router.push(
                `/sign-up?redirect_url=${encodeURIComponent(currentUrl)}`,
            );
            return;
        }

        setAccepting(true);
        setError(null);

        try {
            const authToken = await getToken();
            if (!authToken) {
                throw new Error("Authentication error. Please try again.");
            }

            const client = createAuthenticatedClient(authToken);
            const response = await client.post(
                `/company-invitations/${invitation.id}/accept`,
            );

            // Redirect to dashboard - onboarding modal will open automatically
            const redirectTo =
                response.data?.data?.redirect_to || "/portal/dashboard";
            router.push(redirectTo);
        } catch (err: any) {
            const message =
                err?.response?.data?.error?.message ||
                err.message ||
                "Failed to accept invitation. Please try again.";
            setError(message);
            setAccepting(false);
        }
    };

    const handleClearInvitation = () => {
        setInvitation(null);
        setError(null);
        setEnteredCode("");
    };

    // Render the right-side card based on state
    const renderCard = () => {
        // Loading state
        if (loading) {
            return (
                <div className="card bg-base-100 shadow-2xl w-full max-w-md">
                    <div className="card-body">
                        <div className="flex flex-col items-center gap-4 py-8">
                            <span className="loading loading-spinner loading-lg text-primary"></span>
                            <p className="text-base-content/70">
                                Loading invitation...
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        // Invalid invitation from URL
        if (invitation && !invitation.is_valid) {
            const errorScenarios: Record<
                string,
                {
                    icon: string;
                    iconColor: string;
                    title: string;
                    message: string;
                }
            > = {
                "Invitation not found": {
                    icon: "fa-envelope-circle-check",
                    iconColor: "text-warning",
                    title: "Invitation Not Found",
                    message:
                        "This invitation doesn't exist. Please check with the recruiter who sent it.",
                },
                "This invitation has already been used": {
                    icon: "fa-circle-check",
                    iconColor: "text-success",
                    title: "Already Accepted",
                    message:
                        "This invitation has already been used to create a company account.",
                },
                "This invitation has been revoked": {
                    icon: "fa-ban",
                    iconColor: "text-error",
                    title: "Invitation Revoked",
                    message:
                        "This invitation was cancelled. Please contact the recruiter for a new one.",
                },
                "This invitation has expired": {
                    icon: "fa-clock-rotate-left",
                    iconColor: "text-warning",
                    title: "Invitation Expired",
                    message:
                        "This invitation has expired. Please contact the recruiter for a new one.",
                },
            };

            const scenario = errorScenarios[invitation.error_message || ""] || {
                icon: "fa-circle-exclamation",
                iconColor: "text-error",
                title: "Invalid Invitation",
                message:
                    invitation.error_message ||
                    "This invitation is not valid. Please check your link or code.",
            };

            return (
                <div className="card bg-base-100 shadow-2xl w-full max-w-md">
                    <div className="card-body text-center">
                        <div className="flex justify-center mb-4">
                            <i
                                className={`fa-duotone fa-regular ${scenario.icon} text-5xl ${scenario.iconColor}`}
                            ></i>
                        </div>

                        <h2 className="text-xl font-bold">{scenario.title}</h2>

                        <p className="text-base-content/70 text-sm mt-2">
                            {scenario.message}
                        </p>

                        <div className="mt-6">
                            <button
                                onClick={handleClearInvitation}
                                className="btn btn-primary w-full"
                            >
                                Try Another Code
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        // Valid invitation - show accept card
        if (invitation?.is_valid) {
            return (
                <div className="card bg-base-100 shadow-2xl w-full max-w-md">
                    <div className="card-body text-center">
                        <div className="mb-2">
                            <i className="fa-duotone fa-regular fa-handshake text-5xl text-primary"></i>
                        </div>

                        <h2 className="text-xl font-bold">You're Invited!</h2>

                        <p className="text-base-content/70 text-sm mt-1">
                            <strong>{invitation.recruiter.name}</strong> has
                            invited you to join as a company partner.
                        </p>

                        {invitation.company_name_hint && (
                            <div className="badge badge-lg badge-outline mt-3">
                                <i className="fa-duotone fa-regular fa-building mr-2"></i>
                                {invitation.company_name_hint}
                            </div>
                        )}

                        {invitation.personal_message && (
                            <div className="bg-base-200 rounded-lg p-3 mt-3 text-left">
                                <p className="text-sm italic text-base-content/80">
                                    "{invitation.personal_message}"
                                </p>
                                <p className="text-xs text-base-content/60 mt-1">
                                    — {invitation.recruiter.name}
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="alert alert-error text-sm py-2 mt-3">
                                <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="mt-4 space-y-2">
                            <button
                                className="btn btn-primary w-full"
                                onClick={handleAccept}
                                disabled={accepting}
                            >
                                <ButtonLoading
                                    loading={accepting}
                                    text={
                                        isSignedIn
                                            ? "Accept & Continue"
                                            : "Create Account & Join"
                                    }
                                    loadingText="Accepting..."
                                />
                            </button>

                            <button
                                className="btn btn-ghost btn-sm w-full"
                                onClick={handleClearInvitation}
                            >
                                Use a different code
                            </button>
                        </div>

                        <p className="text-xs text-base-content/40 mt-3">
                            Expires{" "}
                            {new Date(invitation.expires_at).toLocaleDateString(
                                "en-US",
                                {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                },
                            )}
                        </p>
                    </div>
                </div>
            );
        }

        // Default: Code entry card
        return (
            <div className="card bg-base-100 shadow-2xl w-full max-w-md">
                <div className="card-body">
                    <div className="text-center mb-4">
                        <i className="fa-duotone fa-regular fa-envelope-open-text text-5xl text-primary mb-3"></i>
                        <h2 className="text-xl font-bold">
                            Have an Invitation?
                        </h2>
                        <p className="text-base-content/70 text-sm mt-1">
                            Enter your code to see who invited you
                        </p>
                    </div>

                    <form onSubmit={handleCodeLookup} className="space-y-4">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                Invitation Code
                            </legend>
                            <input
                                type="text"
                                className="input w-full text-center font-mono text-lg tracking-wider"
                                placeholder="SPLITS-XXXXXX"
                                value={enteredCode}
                                onChange={(e) =>
                                    setEnteredCode(e.target.value.toUpperCase())
                                }
                                maxLength={13}
                                autoFocus
                            />
                        </fieldset>

                        {error && (
                            <div className="alert alert-warning text-sm py-2">
                                <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            disabled={lookingUpCode || !enteredCode.trim()}
                        >
                            <ButtonLoading
                                loading={lookingUpCode}
                                text="View Invitation"
                                loadingText="Looking up..."
                            />
                        </button>
                    </form>

                    <div className="divider text-xs text-base-content/40">
                        or use the link from your invite
                    </div>

                    <p className="text-center text-xs text-base-content/50">
                        Received a link? Just paste it in your browser's address
                        bar.
                    </p>
                </div>
            </div>
        );
    };

    // Single consistent layout for all states
    return (
        <div className="min-h-screen bg-gradient-to-br from-base-200 to-base-300">
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
                    {/* Left - Value Proposition (always visible) */}
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
                            <i className="fa-duotone fa-regular fa-sparkles"></i>
                            Join the Network
                        </div>

                        <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                            Find Top Talent Through{" "}
                            <span className="text-primary">
                                Trusted Recruiters
                            </span>
                        </h1>

                        <p className="text-lg text-base-content/70">
                            Splits Network connects your company with vetted
                            recruiters who specialize in your industry. Pay only
                            for successful placements with our split-fee model.
                        </p>

                        {/* Benefits */}
                        <div className="space-y-4 pt-4">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                                    <i className="fa-duotone fa-regular fa-shield-check text-success"></i>
                                </div>
                                <div>
                                    <h3 className="font-semibold">
                                        Guaranteed Placements
                                    </h3>
                                    <p className="text-sm text-base-content/60">
                                        Every placement comes with a guarantee
                                        period. If it doesn't work out, you
                                        don't pay.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center flex-shrink-0">
                                    <i className="fa-duotone fa-regular fa-handshake text-info"></i>
                                </div>
                                <div>
                                    <h3 className="font-semibold">
                                        Split-Fee Model
                                    </h3>
                                    <p className="text-sm text-base-content/60">
                                        Recruiters split fees, meaning
                                        competitive rates and access to a wider
                                        talent pool.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                                    <i className="fa-duotone fa-regular fa-user-check text-warning"></i>
                                </div>
                                <div>
                                    <h3 className="font-semibold">
                                        Vetted Recruiters
                                    </h3>
                                    <p className="text-sm text-base-content/60">
                                        Work with professionals who have been
                                        verified and rated by other companies.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right - Dynamic Card (changes based on state) */}
                    <div className="flex justify-center lg:justify-end">
                        {renderCard()}
                    </div>
                </div>

                {/* Trust indicators */}
                <div className="mt-16 pt-8 border-t border-base-content/10">
                    <div className="text-center mb-6">
                        <p className="text-sm text-base-content/50 uppercase tracking-wider font-medium">
                            Trusted by companies hiring across industries
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-8 text-base-content/30">
                        <div className="flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-microchip text-2xl"></i>
                            <span className="font-medium">Technology</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-heartbeat text-2xl"></i>
                            <span className="font-medium">Healthcare</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-chart-pie text-2xl"></i>
                            <span className="font-medium">Finance</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-industry text-2xl"></i>
                            <span className="font-medium">Manufacturing</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-graduation-cap text-2xl"></i>
                            <span className="font-medium">Education</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
