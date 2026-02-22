"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { createAuthenticatedClient } from "@/lib/api-client";
import { BaselStatusPill } from "@splits-network/basel-ui";
import type {
    IntegrationProvider,
    OAuthConnectionPublic,
    OAuthConnectionStatus,
} from "@splits-network/shared-types";
import { ProviderCard } from "./provider-card";
import { ConnectedCard } from "./connected-card";

export function IntegrationsSection() {
    const { getToken } = useAuth();
    const containerRef = useRef<HTMLDivElement>(null);

    const [providers, setProviders] = useState<IntegrationProvider[]>([]);
    const [connections, setConnections] = useState<OAuthConnectionPublic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [connecting, setConnecting] = useState<string | null>(null);
    const [disconnecting, setDisconnecting] = useState<string | null>(null);

    /* ── Fetch providers and connections ──────────────────────────────── */

    const fetchData = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            const [providersRes, connectionsRes] = await Promise.all([
                client.get("/integrations/providers") as Promise<{ data: IntegrationProvider[] }>,
                client.get("/integrations/connections") as Promise<{ data: OAuthConnectionPublic[] }>,
            ]);

            setProviders(providersRes.data ?? []);
            setConnections(connectionsRes.data ?? []);
        } catch (err: any) {
            setError(err.message || "Failed to load integrations");
        } finally {
            setLoading(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    /* ── GSAP stagger animation ──────────────────────────────────────── */

    useGSAP(
        () => {
            if (loading || !containerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                containerRef.current
                    .querySelectorAll("[class*='opacity-0']")
                    .forEach((el) => gsap.set(el, { opacity: 1 }));
                return;
            }

            const cards = containerRef.current.querySelectorAll(".integration-card");
            if (cards.length) {
                gsap.fromTo(
                    cards,
                    { opacity: 0, y: 24 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out" },
                );
            }
        },
        { scope: containerRef, dependencies: [loading] },
    );

    /* ── Connect handler ─────────────────────────────────────────────── */

    const handleConnect = async (providerSlug: string) => {
        setConnecting(providerSlug);
        setError("");

        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            const redirectUri = `${window.location.origin}/portal/integrations/callback`;

            const res = await client.post("/integrations/connections/initiate", {
                provider_slug: providerSlug,
                redirect_uri: redirectUri,
            }) as { data: { authorization_url: string; state: string } };

            // Store state for CSRF verification on callback
            sessionStorage.setItem("oauth_state", res.data.state);

            // Redirect to provider's OAuth consent screen
            window.location.href = res.data.authorization_url;
        } catch (err: any) {
            setError(err.message || "Failed to initiate connection");
            setConnecting(null);
        }
    };

    /* ── Disconnect handler ──────────────────────────────────────────── */

    const handleDisconnect = async (connectionId: string) => {
        setDisconnecting(connectionId);
        setError("");

        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);
            await client.delete(`/integrations/connections/${connectionId}`);
            await fetchData();
        } catch (err: any) {
            setError(err.message || "Failed to disconnect");
        } finally {
            setDisconnecting(null);
        }
    };

    /* ── Helpers ──────────────────────────────────────────────────────── */

    const getConnectionForProvider = (slug: string): OAuthConnectionPublic | undefined =>
        connections.find((c) => c.provider_slug === slug);

    const connectedProviders = providers.filter((p) => {
        const conn = getConnectionForProvider(p.slug);
        return conn && conn.status === "active";
    });

    const availableProviders = providers.filter((p) => {
        const conn = getConnectionForProvider(p.slug);
        return !conn || conn.status !== "active";
    });

    const statusLabel = (status: OAuthConnectionStatus): string => {
        const labels: Record<OAuthConnectionStatus, string> = {
            pending: "Pending",
            active: "Connected",
            expired: "Expired",
            revoked: "Disconnected",
            error: "Error",
        };
        return labels[status] ?? status;
    };

    const statusColor = (status: OAuthConnectionStatus): "success" | "warning" | "error" | "neutral" => {
        const colors: Record<OAuthConnectionStatus, "success" | "warning" | "error" | "neutral"> = {
            active: "success",
            pending: "warning",
            expired: "warning",
            error: "error",
            revoked: "neutral",
        };
        return colors[status] ?? "neutral";
    };

    /* ── Loading state ───────────────────────────────────────────────── */

    if (loading) {
        return (
            <div className="flex items-center gap-3 py-16">
                <span className="loading loading-spinner loading-md" />
                <span className="text-base-content/50 font-semibold">Loading integrations...</span>
            </div>
        );
    }

    /* ── Render ───────────────────────────────────────────────────────── */

    return (
        <div ref={containerRef}>
            {/* Section header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
                        Integrations
                    </p>
                    <div className="flex-1 h-px bg-base-300" />
                </div>
                <h2 className="text-2xl font-black tracking-tight mb-2">
                    Connected services
                </h2>
                <p className="text-sm text-base-content/50 max-w-lg">
                    Connect your calendar and email accounts to streamline interview
                    scheduling, track conversations, and keep everything in sync.
                </p>
            </div>

            {/* Error banner */}
            {error && (
                <div className="bg-error/5 border-l-4 border-error px-4 py-3 mb-6">
                    <p className="text-sm font-semibold text-error">{error}</p>
                </div>
            )}

            {/* Connected integrations */}
            {connectedProviders.length > 0 && (
                <div className="mb-10">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-base-content/40 mb-4">
                        Active connections
                    </h3>
                    <div className="grid gap-4">
                        {connectedProviders.map((provider) => {
                            const conn = getConnectionForProvider(provider.slug)!;
                            return (
                                <ConnectedCard
                                    key={provider.slug}
                                    provider={provider}
                                    connection={conn}
                                    statusLabel={statusLabel(conn.status)}
                                    statusColor={statusColor(conn.status)}
                                    disconnecting={disconnecting === conn.id}
                                    onDisconnect={() => handleDisconnect(conn.id)}
                                />
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Available integrations */}
            {availableProviders.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-base-content/40 mb-4">
                        Available integrations
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {availableProviders.map((provider) => (
                            <ProviderCard
                                key={provider.slug}
                                provider={provider}
                                connecting={connecting === provider.slug}
                                onConnect={() => handleConnect(provider.slug)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {providers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-base-200 border border-base-300 flex items-center justify-center mb-6">
                        <i className="fa-duotone fa-regular fa-plug text-2xl text-base-content/30" />
                    </div>
                    <h3 className="text-xl font-black tracking-tight mb-2">
                        No integrations available
                    </h3>
                    <p className="text-sm text-base-content/50 max-w-sm">
                        Integration providers will appear here once configured.
                    </p>
                </div>
            )}
        </div>
    );
}
