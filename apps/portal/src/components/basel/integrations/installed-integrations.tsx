"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { BaselStatusPill } from "@splits-network/basel-ui";
import type {
    IntegrationProvider,
    OAuthConnectionPublic,
    OAuthConnectionStatus,
} from "@splits-network/shared-types";

interface InstalledIntegrationsProps {
    providers: IntegrationProvider[];
    connections: OAuthConnectionPublic[];
    disconnecting: string | null;
    onDisconnect: (connectionId: string) => void;
}

const STATUS_CONFIG: Record<OAuthConnectionStatus, { label: string; color: "success" | "warning" | "error" | "neutral" }> = {
    active: { label: "Connected", color: "success" },
    pending: { label: "Pending", color: "warning" },
    expired: { label: "Expired", color: "warning" },
    error: { label: "Error", color: "error" },
    revoked: { label: "Disconnected", color: "neutral" },
};

export function InstalledIntegrations({
    providers,
    connections,
    disconnecting,
    onDisconnect,
}: InstalledIntegrationsProps) {
    const listRef = useRef<HTMLDivElement>(null);

    const activeConnections = connections.filter((c) => c.status !== "revoked");

    const getProvider = (slug: string) => providers.find((p) => p.slug === slug);

    /* ── GSAP stagger ────────────────────────────────────────────────── */

    useGSAP(
        () => {
            if (!listRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                listRef.current
                    .querySelectorAll("[class*='opacity-0']")
                    .forEach((el) => gsap.set(el, { opacity: 1 }));
                return;
            }

            const rows = listRef.current.querySelectorAll(".installed-row");
            if (rows.length) {
                gsap.fromTo(
                    rows,
                    { opacity: 0, x: -20 },
                    { opacity: 1, x: 0, duration: 0.4, stagger: 0.06, ease: "power3.out" },
                );
            }
        },
        { scope: listRef },
    );

    /* ── Empty state ─────────────────────────────────────────────────── */

    if (activeConnections.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="w-16 h-16 bg-base-200 border border-base-300 flex items-center justify-center mx-auto mb-6">
                    <i className="fa-duotone fa-regular fa-plug text-2xl text-base-content/30" />
                </div>
                <h3 className="text-xl font-black tracking-tight mb-2">
                    No integrations installed
                </h3>
                <p className="text-sm text-base-content/50 max-w-sm mx-auto">
                    Browse the marketplace to connect your calendar, email, and recruiting tools.
                </p>
            </div>
        );
    }

    /* ── Render ───────────────────────────────────────────────────────── */

    return (
        <div ref={listRef}>
            {/* Header row */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-base-content/30 border-b border-base-300">
                <div className="col-span-5">Integration</div>
                <div className="col-span-3">Account</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Connection rows */}
            <div className="divide-y divide-base-300">
                {activeConnections.map((conn) => {
                    const provider = getProvider(conn.provider_slug);
                    const statusInfo = STATUS_CONFIG[conn.status] ?? STATUS_CONFIG.error;

                    return (
                        <div
                            key={conn.id}
                            className="installed-row opacity-0 grid sm:grid-cols-12 gap-4 items-center px-4 py-4 hover:bg-base-200/50 transition-colors"
                        >
                            {/* Provider info */}
                            <div className="sm:col-span-5 flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                    <i className={`${provider?.icon || "fa-duotone fa-regular fa-plug"} text-lg text-primary`} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold tracking-tight">
                                        {provider?.name ?? conn.provider_slug}
                                    </p>
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-base-content/40">
                                        {provider?.category ?? "Unknown"}
                                    </p>
                                </div>
                            </div>

                            {/* Account */}
                            <div className="sm:col-span-3">
                                <p className="text-xs text-base-content/60 font-medium truncate">
                                    {conn.provider_account_name || "—"}
                                </p>
                                {conn.last_synced_at && (
                                    <p className="text-[11px] text-base-content/30">
                                        Synced {new Date(conn.last_synced_at).toLocaleDateString(undefined, {
                                            month: "short", day: "numeric",
                                        })}
                                    </p>
                                )}
                            </div>

                            {/* Status */}
                            <div className="sm:col-span-2">
                                <BaselStatusPill color={statusInfo.color}>
                                    {statusInfo.label}
                                </BaselStatusPill>
                                {conn.last_error && (
                                    <p className="text-[11px] text-error mt-1 truncate" title={conn.last_error}>
                                        {conn.last_error}
                                    </p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="sm:col-span-2 flex justify-end">
                                <button
                                    onClick={() => onDisconnect(conn.id)}
                                    disabled={disconnecting === conn.id}
                                    className="btn btn-outline btn-error btn-xs rounded-none font-bold uppercase tracking-wider text-[10px]"
                                >
                                    {disconnecting === conn.id ? (
                                        <span className="loading loading-spinner loading-xs" />
                                    ) : (
                                        <>
                                            <i className="fa-duotone fa-regular fa-unlink text-[10px]" />
                                            Disconnect
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
