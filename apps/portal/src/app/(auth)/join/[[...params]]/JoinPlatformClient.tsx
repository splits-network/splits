"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
    createAuthenticatedClient,
    createUnauthenticatedClient,
} from "@/lib/api-client";
import { ButtonLoading } from "@splits-network/shared-ui";
import UserAvatar from "@/components/common/UserAvatar";

interface InvitationLookup {
    id: string;
    invite_code: string;
    company_name_hint?: string;
    personal_message?: string;
    status: "pending" | "accepted" | "expired" | "revoked";
    expires_at: string;
    recruiter: {
        name: string;
        tagline?: string;
        location?: string;
        years_experience?: number;
        industries?: string[];
        specialties?: string[];
        total_placements?: number;
        profile_image_url?: string;
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

    const [enteredCode, setEnteredCode] = useState("");
    const [lookingUpCode, setLookingUpCode] = useState(false);

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
                setInvitation(response.data);
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

            if (!result.is_valid) {
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

    // Loading
    if (loading) {
        return (
            <div className="flex flex-col items-center gap-4 py-8">
                <span className="loading loading-spinner loading-lg text-primary" />
                <p className="text-base-content/60 text-sm">
                    Loading invitation...
                </p>
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
            <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-base-200 flex items-center justify-center">
                    <i
                        className={`fa-duotone fa-regular ${scenario.icon} text-3xl ${scenario.iconColor}`}
                    />
                </div>

                <h1 className="text-2xl font-black tracking-tight mb-2">{scenario.title}</h1>

                <p className="text-base-content/60 text-sm mt-2 mb-8">
                    {scenario.message}
                </p>

                <button
                    onClick={handleClearInvitation}
                    className="btn btn-primary w-full"
                >
                    Try Another Code
                </button>
            </div>
        );
    }

    // Valid invitation - show recruiter details + accept
    if (invitation?.is_valid) {
        const recruiter = invitation.recruiter;

        return (
            <div className="py-4">
                {/* Recruiter Profile Header */}
                <div className="flex items-center gap-4 pb-4 border-b border-base-300">
                    <UserAvatar
                        user={{
                            name: recruiter.name,
                            profile_image_url:
                                recruiter.profile_image_url,
                        }}
                        size="lg"
                    />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-bold truncate">
                                {recruiter.name}
                            </h3>
                            {recruiter.years_experience &&
                                recruiter.years_experience > 0 && (
                                    <span className="badge badge-sm badge-primary gap-1">
                                        <i className="fa-duotone fa-regular fa-calendar-clock text-sm" />
                                        {recruiter.years_experience}+
                                        yrs
                                    </span>
                                )}
                        </div>
                        {recruiter.tagline && (
                            <p className="text-sm text-base-content/60 line-clamp-2 mt-0.5">
                                {recruiter.tagline}
                            </p>
                        )}
                        {recruiter.location && (
                            <p className="text-sm text-base-content/40 mt-1 flex items-center gap-1">
                                <i className="fa-duotone fa-regular fa-location-dot" />
                                {recruiter.location}
                            </p>
                        )}
                    </div>
                </div>

                {/* Credibility Badges */}
                {(recruiter.total_placements ||
                    (recruiter.specialties &&
                        recruiter.specialties.length > 0)) && (
                    <div className="flex flex-wrap gap-2 py-3">
                        {recruiter.total_placements &&
                            recruiter.total_placements > 0 && (
                                <span className="badge badge-sm badge-success badge-outline gap-1">
                                    <i className="fa-duotone fa-regular fa-trophy text-sm" />
                                    {recruiter.total_placements}{" "}
                                    placements
                                </span>
                            )}
                        {recruiter.specialties?.[0] && (
                            <span className="badge badge-sm badge-secondary badge-outline gap-1">
                                <i className="fa-duotone fa-regular fa-briefcase text-sm" />
                                {recruiter.specialties[0]}
                            </span>
                        )}
                    </div>
                )}

                {/* Invitation Header */}
                <div className="text-center py-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 mb-4">
                        <i className="fa-duotone fa-regular fa-envelope-open-text text-primary" />
                        <span className="text-sm font-semibold text-primary">
                            You're Invited
                        </span>
                    </div>

                    <h2 className="text-xl font-black tracking-tight">
                        Partner with {recruiter.name}
                    </h2>
                    <p className="text-sm text-base-content/50 mt-2 leading-relaxed">
                        Join Splits Network and access qualified
                        candidates vetted by {recruiter.name} and their
                        proven track record of successful placements.
                    </p>
                </div>

                {/* Company Name Hint */}
                {invitation.company_name_hint && (
                    <div className="flex justify-center mb-4">
                        <h2 className="text-xl font-bold gap-2 px-4">
                            <i className="fa-duotone fa-regular fa-building" />{" "}
                            {invitation.company_name_hint}
                        </h2>
                    </div>
                )}

                {/* Personal Message */}
                {invitation.personal_message && (
                    <div className="bg-base-200 p-4 mt-3 border-l-4 border-primary">
                        <p className="text-sm italic text-base-content/70 leading-relaxed">
                            &ldquo;{invitation.personal_message}&rdquo;
                        </p>
                        <p className="text-xs text-base-content/40 mt-2 flex items-center gap-1">
                            <i className="fa-duotone fa-regular fa-quote-left" />
                            {recruiter.name}
                        </p>
                    </div>
                )}

                {/* Industries/Specialties */}
                {((recruiter.industries &&
                    recruiter.industries.length > 0) ||
                    (recruiter.specialties &&
                        recruiter.specialties.length > 1)) && (
                    <div className="flex flex-wrap gap-1.5 justify-center pt-4">
                        {recruiter.industries?.map((industry) => (
                            <span
                                key={industry}
                                className="badge badge-sm badge-ghost"
                            >
                                {industry}
                            </span>
                        ))}
                        {recruiter.specialties
                            ?.slice(1)
                            .map((specialty) => (
                                <span
                                    key={specialty}
                                    className="badge badge-sm badge-outline"
                                >
                                    {specialty}
                                </span>
                            ))}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="alert alert-error text-sm mt-4" role="alert">
                        <i className="fa-duotone fa-regular fa-circle-exclamation" />
                        <span>{error}</span>
                    </div>
                )}

                {/* CTA */}
                <div className="mt-6 space-y-3">
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

                {/* Expiration */}
                <p className="text-xs text-base-content/30 text-center mt-6 flex items-center justify-center gap-1">
                    <i className="fa-duotone fa-regular fa-clock" />
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
        );
    }

    // Default: Code entry form
    return (
        <div className="py-4">
            <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 flex items-center justify-center">
                    <i className="fa-duotone fa-regular fa-envelope-open-text text-primary text-2xl" />
                </div>
                <h1 className="text-2xl font-black tracking-tight">
                    Have an Invitation?
                </h1>
                <p className="text-base-content/50 text-sm mt-2">
                    Enter your code to see who invited you
                </p>
            </div>

            <form onSubmit={handleCodeLookup} className="space-y-4">
                <fieldset>
                    <label className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-2 block">
                        Invitation Code
                    </label>
                    <input
                        type="text"
                        className="input input-bordered w-full text-center font-mono text-lg tracking-wider"
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
                    <div className="alert alert-warning text-sm" role="alert">
                        <i className="fa-duotone fa-regular fa-circle-exclamation" />
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

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-base-300" />
                <span className="text-xs text-base-content/30 uppercase tracking-widest">
                    or use the link from your invite
                </span>
                <div className="flex-1 h-px bg-base-300" />
            </div>

            <p className="text-center text-sm text-base-content/40">
                Received a link? Just paste it in your browser's address
                bar.
            </p>
        </div>
    );
}
