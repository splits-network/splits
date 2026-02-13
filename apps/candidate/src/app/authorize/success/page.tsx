"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function AuthorizeSuccessPage() {
    const searchParams = useSearchParams();
    const [redirecting, setRedirecting] = useState(false);

    const redirectUri = searchParams.get("redirect_uri");
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    useEffect(() => {
        if (!redirectUri || !code || !state) {
            return;
        }

        // Auto-redirect after 1.5 seconds
        setRedirecting(true);
        const timer = setTimeout(() => {
            const callbackUrl = `${redirectUri}?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
            window.location.href = callbackUrl;
        }, 1500);

        return () => clearTimeout(timer);
    }, [redirectUri, code, state]);

    if (!redirectUri || !code || !state) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
                <div className="card bg-base-100 shadow-xl w-full max-w-md">
                    <div className="card-body text-center">
                        <i className="fa-duotone fa-regular fa-circle-exclamation text-error text-5xl mb-4"></i>
                        <h2 className="text-xl font-bold">Invalid Request</h2>
                        <p className="text-base-content/70">
                            Missing required parameters for redirect.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
            <div className="card bg-base-100 shadow-xl w-full max-w-md">
                <div className="card-body text-center">
                    {/* Success Icon */}
                    <i className="fa-duotone fa-regular fa-circle-check text-success text-7xl mb-4"></i>

                    {/* Logo / Branding */}
                    <div className="text-xl font-bold text-primary mb-2">
                        Applicant.Network
                    </div>

                    {/* Success Message */}
                    <h1 className="text-3xl font-bold mb-4">Connected!</h1>

                    <p className="text-base-content/70 mb-6">
                        Redirecting you back to ChatGPT...
                    </p>

                    {/* Loading indicator */}
                    {redirecting && (
                        <span className="loading loading-spinner loading-lg mx-auto"></span>
                    )}

                    {/* Fallback link */}
                    <div className="mt-6">
                        <a
                            href={`${redirectUri}?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`}
                            className="link link-primary text-sm"
                        >
                            Click here if you're not redirected automatically
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
