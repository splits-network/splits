"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";

export default function OAuthCallbackPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { getToken } = useAuth();

    const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
    const [error, setError] = useState("");

    useEffect(() => {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const errorParam = searchParams.get("error");

        if (errorParam) {
            setStatus("error");
            setError(searchParams.get("error_description") || errorParam);
            return;
        }

        if (!code || !state) {
            setStatus("error");
            setError("Missing authorization code or state parameter");
            return;
        }

        // Verify state matches what we stored
        const storedState = sessionStorage.getItem("oauth_state");
        if (storedState !== state) {
            setStatus("error");
            setError("Invalid state parameter — possible CSRF attack");
            return;
        }

        sessionStorage.removeItem("oauth_state");

        (async () => {
            try {
                const token = await getToken();
                if (!token) {
                    setStatus("error");
                    setError("Not authenticated");
                    return;
                }

                const client = createAuthenticatedClient(token);
                await client.post("/integrations/connections/callback", { code, state });

                setStatus("success");

                // Redirect back to profile integrations tab after brief delay
                setTimeout(() => {
                    router.push("/portal/profile?section=integrations");
                }, 1500);
            } catch (err: any) {
                setStatus("error");
                setError(err.message || "Failed to complete connection");
            }
        })();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <main className="min-h-screen bg-base-100 flex items-center justify-center">
            <div className="max-w-md w-full mx-auto px-6">
                <div className="border border-base-300 bg-base-100 shadow-md p-8 text-center">
                    {status === "processing" && (
                        <>
                            <span className="loading loading-spinner loading-lg mb-4" />
                            <h2 className="text-xl font-black tracking-tight mb-2">
                                Connecting...
                            </h2>
                            <p className="text-sm text-base-content/50">
                                Completing the authorization. This will only take a moment.
                            </p>
                        </>
                    )}

                    {status === "success" && (
                        <>
                            <div className="w-14 h-14 bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-4">
                                <i className="fa-duotone fa-regular fa-check text-2xl text-success" />
                            </div>
                            <h2 className="text-xl font-black tracking-tight mb-2">
                                Connected!
                            </h2>
                            <p className="text-sm text-base-content/50">
                                Redirecting you back to settings...
                            </p>
                        </>
                    )}

                    {status === "error" && (
                        <>
                            <div className="w-14 h-14 bg-error/10 border border-error/20 flex items-center justify-center mx-auto mb-4">
                                <i className="fa-duotone fa-regular fa-xmark text-2xl text-error" />
                            </div>
                            <h2 className="text-xl font-black tracking-tight mb-2">
                                Connection failed
                            </h2>
                            <p className="text-sm text-error mb-4">{error}</p>
                            <button
                                onClick={() => router.push("/portal/profile?section=integrations")}
                                className="btn btn-primary btn-sm rounded-none font-bold uppercase tracking-wider text-[11px]"
                            >
                                Back to settings
                            </button>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
