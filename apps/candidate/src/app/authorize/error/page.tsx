"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const ERROR_MESSAGES: Record<string, string> = {
    access_denied: "Authorization was cancelled",
    server_error: "Something went wrong. Please try again.",
    expired: "Link expired, please try again",
    session_limit: "Session limit reached. You have 5 active sessions.",
    invalid_scope: "Invalid permissions requested",
};

export default function AuthorizeErrorPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-base-200"><span className="loading loading-spinner loading-lg"></span></div>}>
            <AuthorizeErrorContent />
        </Suspense>
    );
}

function AuthorizeErrorContent() {
    const searchParams = useSearchParams();

    const error = searchParams.get("error");
    const message = searchParams.get("message");
    const redirectUri = searchParams.get("redirect_uri");

    // Determine the error message
    const errorMessage =
        (error && ERROR_MESSAGES[error]) || message || "An error occurred";

    const isSessionLimit = error === "session_limit";

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
            <div className="card bg-base-100 shadow-xl w-full max-w-md">
                <div className="card-body text-center">
                    {/* Error Icon */}
                    <i className="fa-duotone fa-regular fa-circle-exclamation text-error text-6xl mb-4"></i>

                    {/* Logo / Branding */}
                    <img src="/logo.png" alt="Applicant Network" className="h-8 mx-auto mb-2" />

                    {/* Error Title */}
                    <h1 className="text-2xl font-bold mb-4">
                        Authorization Error
                    </h1>

                    {/* Error Message */}
                    <p className="text-base-content/70 mb-6">{errorMessage}</p>

                    {/* Session Limit Specific Help */}
                    {isSessionLimit && (
                        <div className="alert alert-warning text-left mb-6">
                            <i className="fa-duotone fa-regular fa-info-circle"></i>
                            <div>
                                <p className="font-semibold">
                                    Too many active sessions
                                </p>
                                <p className="text-sm">
                                    Revoke a session from your profile to
                                    authorize a new one.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        {isSessionLimit ? (
                            <Link
                                href="/portal/profile"
                                className="btn btn-primary"
                            >
                                <i className="fa-duotone fa-regular fa-user"></i>
                                Go to Profile
                            </Link>
                        ) : (
                            <button
                                onClick={() => window.history.back()}
                                className="btn btn-primary"
                            >
                                <i className="fa-duotone fa-regular fa-rotate-left"></i>
                                Try Again
                            </button>
                        )}

                        {redirectUri && (
                            <a
                                href={redirectUri}
                                className="btn btn-outline"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-left"></i>
                                Return to ChatGPT
                            </a>
                        )}

                        <Link href="/" className="btn btn-ghost btn-sm">
                            Return Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
