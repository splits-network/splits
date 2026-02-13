"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

// Scope mapping to human-readable permissions
const SCOPE_DISPLAY: Record<string, { label: string; icon: string }> = {
    "jobs:read": {
        label: "Search jobs",
        icon: "fa-magnifying-glass",
    },
    "applications:read": {
        label: "Check your applications",
        icon: "fa-list-check",
    },
    "applications:write": {
        label: "Submit applications",
        icon: "fa-paper-plane",
    },
    "resume:read": {
        label: "Analyze resume fit",
        icon: "fa-file-lines",
    },
};

export function ConsentClient() {
    const { isSignedIn, isLoaded, userId } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();

    // OAuth query parameters
    const responseType = searchParams.get("response_type");
    const clientId = searchParams.get("client_id");
    const redirectUri = searchParams.get("redirect_uri");
    const scope = searchParams.get("scope");
    const state = searchParams.get("state");
    const codeChallenge = searchParams.get("code_challenge");
    const codeChallengeMethod = searchParams.get("code_challenge_method");

    // State
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [existingScopes, setExistingScopes] = useState<string[]>([]);
    const [sessionCount, setSessionCount] = useState(0);

    // Parse scopes
    const requestedScopes = scope ? scope.split(" ").filter(Boolean) : [];
    const newScopes = requestedScopes.filter(
        (s) => !existingScopes.includes(s)
    );
    const alreadyGrantedScopes = requestedScopes.filter((s) =>
        existingScopes.includes(s)
    );

    // Check if all params are present
    const missingParams =
        !responseType || !clientId || !redirectUri || !scope || !state;

    useEffect(() => {
        // Wait for Clerk to finish loading before checking auth
        if (!isLoaded) return;

        // Redirect to sign-in if not authenticated
        if (!isSignedIn) {
            const currentQuery = searchParams.toString();
            const signInUrl = `/sign-in?redirect_url=${encodeURIComponent(`/authorize?${currentQuery}`)}`;
            router.push(signInUrl);
            return;
        }

        // Check for consent
        checkConsent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded, isSignedIn, userId]);

    const checkConsent = async () => {
        if (!userId || !scope) {
            setLoading(false);
            return;
        }

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:3000";
            const response = await fetch(
                `${apiUrl}/api/v1/gpt/oauth/consent-check?scopes=${encodeURIComponent(scope)}`,
                {
                    headers: {
                        "x-clerk-user-id": userId,
                    },
                }
            );

            if (!response.ok) {
                // API unavailable or error — fall through to show consent UI
                setLoading(false);
                return;
            }

            const result = await response.json();
            const { hasConsent, sessionCount: count, existingScopes: existing } = result.data;

            setSessionCount(count);
            setExistingScopes(existing || []);

            if (count >= 5) {
                setError("session_limit");
                setLoading(false);
                return;
            }

            if (hasConsent) {
                // Auto-approve: call authorize directly
                await handleAuthorize();
            } else {
                setLoading(false);
            }
        } catch (err) {
            console.error("Failed to check consent:", err);
            setLoading(false);
        }
    };

    const handleAuthorize = async () => {
        if (!userId || missingParams) {
            setError("Missing required parameters");
            return;
        }

        setSubmitting(true);
        setError("");

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:3000";
            const params = new URLSearchParams({
                response_type: responseType!,
                client_id: clientId!,
                redirect_uri: redirectUri!,
                scope: scope!,
                state: state!,
                code_challenge: codeChallenge || "",
                code_challenge_method: codeChallengeMethod || "",
            });

            const response = await fetch(
                `${apiUrl}/api/v1/gpt/oauth/authorize?${params.toString()}`,
                {
                    headers: {
                        "x-clerk-user-id": userId,
                    },
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Authorization failed");
            }

            const result = await response.json();
            const { code } = result.data;

            // Redirect to success page
            router.push(
                `/authorize/success?redirect_uri=${encodeURIComponent(redirectUri!)}&code=${encodeURIComponent(code)}&state=${encodeURIComponent(state!)}`
            );
        } catch (err: any) {
            console.error("Authorization failed:", err);
            const errorMessage = err.message || "Something went wrong";
            router.push(
                `/authorize/error?error=server_error&message=${encodeURIComponent(errorMessage)}&redirect_uri=${encodeURIComponent(redirectUri || "")}`
            );
        }
    };

    const handleCancel = () => {
        if (!redirectUri || !state) {
            router.push("/");
            return;
        }

        // Redirect to ChatGPT callback with access_denied error
        const callbackUrl = `${redirectUri}?error=access_denied&error_description=${encodeURIComponent("User denied consent")}&state=${state}`;
        window.location.href = callbackUrl;
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200">
                <div className="card bg-base-100 shadow-xl w-full max-w-md">
                    <div className="card-body text-center">
                        <span className="loading loading-spinner loading-lg mx-auto"></span>
                        <p className="text-base-content/70">Checking authorization...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Session limit error
    if (error === "session_limit") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
                <div className="card bg-base-100 shadow-xl w-full max-w-md">
                    <div className="card-body text-center">
                        <i className="fa-duotone fa-regular fa-circle-exclamation text-error text-5xl mb-4"></i>
                        <h2 className="card-title justify-center text-2xl">
                            Session Limit Reached
                        </h2>
                        <p className="text-base-content/70">
                            You have 5 active GPT sessions. Please revoke one from your
                            profile to authorize a new session.
                        </p>
                        <div className="card-actions justify-center mt-4">
                            <Link href="/portal/profile" className="btn btn-primary">
                                <i className="fa-duotone fa-regular fa-user"></i>
                                Go to Profile
                            </Link>
                            <button onClick={handleCancel} className="btn btn-outline">
                                Return to ChatGPT
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Missing parameters error
    if (missingParams) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
                <div className="card bg-base-100 shadow-xl w-full max-w-md">
                    <div className="card-body text-center">
                        <i className="fa-duotone fa-regular fa-circle-exclamation text-error text-5xl mb-4"></i>
                        <h2 className="card-title justify-center text-2xl">
                            Invalid Request
                        </h2>
                        <p className="text-base-content/70">
                            This authorization link is missing required parameters.
                            Please try again from ChatGPT.
                        </p>
                        <div className="card-actions justify-center mt-4">
                            <Link href="/" className="btn btn-primary">
                                Return Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Consent UI
    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
            <div className="card bg-base-100 shadow-xl w-full max-w-md">
                <div className="card-body">
                    {/* Logo / Branding */}
                    <div className="text-center mb-4">
                        <img src="/logo.png" alt="Applicant Network" className="h-10 mx-auto" />
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-center mb-2">
                        AI Job Copilot -- Applicant Network
                    </h2>
                    <p className="text-center text-base-content/70 mb-6">
                        wants to access your account
                    </p>

                    {/* Permissions */}
                    <div className="mb-6">
                        {newScopes.length > 0 && (
                            <div className="mb-4">
                                <h3 className="font-semibold mb-2">
                                    {alreadyGrantedScopes.length > 0
                                        ? "New permissions requested:"
                                        : "This Custom GPT will be able to:"}
                                </h3>
                                <ul className="space-y-2">
                                    {newScopes.map((scopeKey) => {
                                        const display = SCOPE_DISPLAY[scopeKey];
                                        if (!display) return null;
                                        return (
                                            <li
                                                key={scopeKey}
                                                className="flex items-center gap-3"
                                            >
                                                <i
                                                    className={`fa-duotone fa-regular ${display.icon} text-primary text-xl`}
                                                ></i>
                                                <span>{display.label}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}

                        {alreadyGrantedScopes.length > 0 && (
                            <div className="text-sm text-base-content/60">
                                <h4 className="font-semibold mb-1">
                                    Previously granted:
                                </h4>
                                <ul className="space-y-1">
                                    {alreadyGrantedScopes.map((scopeKey) => {
                                        const display = SCOPE_DISPLAY[scopeKey];
                                        if (!display) return null;
                                        return (
                                            <li
                                                key={scopeKey}
                                                className="flex items-center gap-2 ml-2"
                                            >
                                                <i
                                                    className={`fa-duotone fa-regular ${display.icon}`}
                                                ></i>
                                                <span>{display.label}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Learn More */}
                    <div className="text-center mb-6">
                        <Link
                            href="/authorize/learn-more"
                            className="link link-primary text-sm"
                        >
                            Learn more about this integration
                        </Link>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleCancel}
                            className="btn btn-outline flex-1"
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAuthorize}
                            className="btn btn-primary flex-1"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    Authorizing...
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-check"></i>
                                    Allow
                                </>
                            )}
                        </button>
                    </div>

                    {/* Session info */}
                    {sessionCount > 0 && (
                        <div className="text-center text-xs text-base-content/60 mt-4">
                            You have {sessionCount} active session{sessionCount !== 1 ? "s" : ""}.{" "}
                            <Link href="/portal/profile" className="link">
                                Manage sessions
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
