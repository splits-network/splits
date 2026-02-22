"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type {
    OAuthConnectionPublic,
    LinkedInProfilePublic,
    LinkedInVerificationStatus,
} from "@splits-network/shared-types";

/* ─── Types ────────────────────────────────────────────────────────────── */

interface LinkedInVerificationBadgeProps {
    /** Compact inline badge mode */
    variant?: "badge" | "card";
    className?: string;
}

/* ─── Component ────────────────────────────────────────────────────────── */

export default function LinkedInVerificationBadge({
    variant = "badge",
    className = "",
}: LinkedInVerificationBadgeProps) {
    const { getToken } = useAuth();

    const [connection, setConnection] = useState<OAuthConnectionPublic | null>(null);
    const [verification, setVerification] = useState<LinkedInVerificationStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [error, setError] = useState("");

    /* ── Fetch LinkedIn connection ── */
    const fetchStatus = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);

            // Find LinkedIn connection
            const res = (await client.get("/integrations/connections")) as {
                data: OAuthConnectionPublic[];
            };
            const linkedinConn = (res.data ?? []).find(
                (c) => c.provider_slug === "linkedin" && c.status === "active",
            );

            if (!linkedinConn) {
                setConnection(null);
                setVerification(null);
                return;
            }

            setConnection(linkedinConn);

            // Fetch verification status
            const verRes = (await client.get(
                `/integrations/linkedin/${linkedinConn.id}/verification`,
            )) as { data: LinkedInVerificationStatus };
            setVerification(verRes.data);
        } catch (err: any) {
            setError("Failed to check LinkedIn status");
        } finally {
            setLoading(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    /* ── Connect ── */
    const handleConnect = async () => {
        setConnecting(true);
        setError("");
        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            const redirectUri = `${window.location.origin}/portal/integrations/callback`;

            const res = (await client.post("/integrations/connections/initiate", {
                provider_slug: "linkedin",
                redirect_uri: redirectUri,
            })) as { data: { authorization_url: string; state: string } };

            sessionStorage.setItem("oauth_state", res.data.state);
            window.location.href = res.data.authorization_url;
        } catch (err: any) {
            setError(err.message || "Failed to connect LinkedIn");
            setConnecting(false);
        }
    };

    /* ── Refresh profile ── */
    const handleRefresh = async () => {
        if (!connection) return;
        setRefreshing(true);
        setError("");
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            await client.post(`/integrations/linkedin/${connection.id}/refresh-profile`, {});
            await fetchStatus();
        } catch (err: any) {
            setError("Failed to refresh profile");
        } finally {
            setRefreshing(false);
        }
    };

    /* ── Badge variant ── */
    if (variant === "badge") {
        if (loading) {
            return (
                <span className={`inline-flex items-center gap-1 ${className}`}>
                    <span className="loading loading-spinner loading-xs" />
                </span>
            );
        }

        if (!connection) {
            return (
                <button
                    onClick={handleConnect}
                    disabled={connecting}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold text-base-content/40 hover:text-primary transition-colors ${className}`}
                    title="Connect LinkedIn to verify your identity"
                >
                    {connecting ? (
                        <span className="loading loading-spinner loading-xs" />
                    ) : (
                        <i className="fa-brands fa-linkedin" />
                    )}
                    <span>Verify LinkedIn</span>
                </button>
            );
        }

        if (verification?.verified) {
            return (
                <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold text-success ${className}`}
                    title={`LinkedIn verified: ${verification.profile?.name || "Connected"}`}
                >
                    <i className="fa-brands fa-linkedin" />
                    <i className="fa-solid fa-badge-check text-[10px]" />
                    <span>Verified</span>
                </span>
            );
        }

        return (
            <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold text-warning ${className}`}
                title="LinkedIn connected but not fully verified"
            >
                <i className="fa-brands fa-linkedin" />
                <span>Pending</span>
            </span>
        );
    }

    /* ── Card variant ── */
    return (
        <div className={`border border-base-300 bg-base-100 ${className}`}>
            <div className="px-4 py-3 border-b border-base-300 flex items-center gap-2">
                <i className="fa-brands fa-linkedin text-[#0A66C2]" />
                <h4 className="text-xs font-black uppercase tracking-wider">
                    LinkedIn Verification
                </h4>
            </div>

            <div className="px-4 py-4">
                {loading && (
                    <div className="flex items-center justify-center py-4">
                        <span className="loading loading-spinner loading-sm" />
                    </div>
                )}

                {error && (
                    <div className="bg-error/5 border-l-4 border-error px-3 py-2 mb-3">
                        <p className="text-xs font-semibold text-error">{error}</p>
                    </div>
                )}

                {!loading && !connection && (
                    <div className="text-center py-4">
                        <p className="text-xs text-base-content/50 mb-3">
                            Connect your LinkedIn account to verify your professional identity.
                        </p>
                        <button
                            onClick={handleConnect}
                            disabled={connecting}
                            className="btn btn-sm"
                            style={{
                                borderRadius: 0,
                                backgroundColor: "#0A66C2",
                                borderColor: "#0A66C2",
                                color: "white",
                            }}
                        >
                            {connecting ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <>
                                    <i className="fa-brands fa-linkedin mr-2" />
                                    Connect LinkedIn
                                </>
                            )}
                        </button>
                    </div>
                )}

                {!loading && connection && verification && (
                    <div className="space-y-3">
                        {/* Profile info */}
                        {verification.profile && (
                            <div className="flex items-center gap-3">
                                {verification.profile.picture ? (
                                    <img
                                        src={verification.profile.picture}
                                        alt={verification.profile.name || "LinkedIn"}
                                        className="w-10 h-10 object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 bg-[#0A66C2]/10 flex items-center justify-center">
                                        <i className="fa-brands fa-linkedin text-[#0A66C2]" />
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-bold">
                                        {verification.profile.name}
                                    </p>
                                    {verification.profile.email && (
                                        <p className="text-xs text-base-content/50">
                                            {verification.profile.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Status */}
                        <div className="flex items-center gap-2">
                            {verification.verified ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-success bg-success/10 px-2 py-1">
                                    <i className="fa-solid fa-badge-check" />
                                    Identity Verified
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-warning bg-warning/10 px-2 py-1">
                                    <i className="fa-solid fa-clock" />
                                    Verification Pending
                                </span>
                            )}
                        </div>

                        {/* Refresh button */}
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="btn btn-ghost btn-xs"
                            style={{ borderRadius: 0 }}
                        >
                            {refreshing ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-arrows-rotate mr-1" />
                                    Refresh Profile
                                </>
                            )}
                        </button>

                        {/* Last synced */}
                        {verification.last_synced_at && (
                            <p className="text-[10px] text-base-content/30">
                                Last synced:{" "}
                                {new Date(verification.last_synced_at).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
