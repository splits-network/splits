"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { BaselStatusPill } from "@splits-network/basel-ui";
import type { IntegrationProvider, OAuthConnectionPublic } from "@splits-network/shared-types";

interface ProviderDetailModalProps {
    provider: IntegrationProvider;
    connection?: OAuthConnectionPublic;
    connecting: boolean;
    onConnect: () => void;
    onClose: () => void;
}

/** Human-readable scope descriptions */
const SCOPE_DESCRIPTIONS: Record<string, string> = {
    // Google Calendar
    "https://www.googleapis.com/auth/calendar": "View and manage your calendars",
    "https://www.googleapis.com/auth/calendar.events": "Create, edit, and delete calendar events",
    // Google Email
    "https://www.googleapis.com/auth/gmail.readonly": "Read your email messages",
    "https://www.googleapis.com/auth/gmail.send": "Send email on your behalf",
    // Microsoft
    "Calendars.ReadWrite": "View and manage your calendars",
    "Mail.ReadWrite": "Read and write your email",
    "Mail.Send": "Send email on your behalf",
    "User.Read": "Read your basic profile information",
    "offline_access": "Maintain access when you're not actively using the app",
};

/** Feature bullets per category */
const CATEGORY_FEATURES: Record<string, { icon: string; label: string }[]> = {
    calendar: [
        { icon: "fa-duotone fa-regular fa-calendar-plus", label: "Automatic interview scheduling" },
        { icon: "fa-duotone fa-regular fa-clock", label: "Real-time availability checking" },
        { icon: "fa-duotone fa-regular fa-bell", label: "Meeting reminders and follow-ups" },
        { icon: "fa-duotone fa-regular fa-arrows-rotate", label: "Two-way sync with your calendar" },
    ],
    email: [
        { icon: "fa-duotone fa-regular fa-envelope-open", label: "Track candidate conversations" },
        { icon: "fa-duotone fa-regular fa-timeline", label: "Activity timeline on candidate profiles" },
        { icon: "fa-duotone fa-regular fa-paper-plane", label: "Send emails from within Splits Network" },
        { icon: "fa-duotone fa-regular fa-shield-check", label: "Secure read-only access to relevant threads" },
    ],
    ats: [
        { icon: "fa-duotone fa-regular fa-arrows-rotate", label: "Bidirectional candidate sync" },
        { icon: "fa-duotone fa-regular fa-briefcase", label: "Job posting synchronization" },
        { icon: "fa-duotone fa-regular fa-code-branch", label: "Pipeline stage mapping" },
        { icon: "fa-duotone fa-regular fa-webhook", label: "Real-time webhook updates" },
    ],
};

export function ProviderDetailModal({
    provider,
    connection,
    connecting,
    onConnect,
    onClose,
}: ProviderDetailModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const isConnected = connection?.status === "active";
    const features = CATEGORY_FEATURES[provider.category] ?? [];
    const scopes = provider.oauth_scopes ?? [];

    /* ── GSAP entrance ───────────────────────────────────────────────── */

    useGSAP(
        () => {
            if (!overlayRef.current || !panelRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

            gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2 });
            gsap.fromTo(
                panelRef.current,
                { opacity: 0, x: 40 },
                { opacity: 1, x: 0, duration: 0.35, ease: "power3.out" },
            );
        },
        { scope: overlayRef },
    );

    /* ── Close on Escape ─────────────────────────────────────────────── */

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose]);

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex justify-end"
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-neutral/60 backdrop-blur-sm" onClick={onClose} />

            {/* Slide-over panel */}
            <div
                ref={panelRef}
                className="relative w-full max-w-lg bg-base-100 shadow-2xl overflow-y-auto"
            >
                {/* Header */}
                <div className="sticky top-0 z-10 bg-neutral text-neutral-content p-6">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-neutral-content/40 hover:text-neutral-content transition-colors"
                    >
                        <i className="fa-duotone fa-regular fa-xmark text-lg" />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 flex items-center justify-center shrink-0 ${
                            isConnected ? "bg-success/20 border border-success/30" : "bg-primary/20 border border-primary/30"
                        }`}>
                            <i className={`${provider.icon || "fa-duotone fa-regular fa-plug"} text-2xl ${
                                isConnected ? "text-success" : "text-primary"
                            }`} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-black tracking-tight">{provider.name}</h2>
                                {isConnected && <BaselStatusPill color="success">Connected</BaselStatusPill>}
                            </div>
                            <p className="text-sm text-neutral-content/50">{provider.description}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-8">
                    {/* Connected account info */}
                    {isConnected && connection && (
                        <div className="border-l-4 border-success bg-success/5 p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <i className="fa-duotone fa-regular fa-circle-check text-success" />
                                <span className="text-sm font-bold">Connected account</span>
                            </div>
                            {connection.provider_account_name && (
                                <p className="text-sm text-base-content/60 ml-6">
                                    {connection.provider_account_name}
                                </p>
                            )}
                            {connection.last_synced_at && (
                                <p className="text-xs text-base-content/40 ml-6 mt-1">
                                    Last synced {new Date(connection.last_synced_at).toLocaleDateString(undefined, {
                                        month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                                    })}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Features */}
                    {features.length > 0 && (
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-base-content/40 mb-4">
                                What you get
                            </h3>
                            <div className="space-y-3">
                                {features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                                            <i className={`${feature.icon} text-sm text-primary`} />
                                        </div>
                                        <span className="text-sm text-base-content/70 font-medium leading-relaxed pt-1">
                                            {feature.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Permissions / Scopes */}
                    {scopes.length > 0 && (
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-base-content/40 mb-4">
                                Permissions requested
                            </h3>
                            <div className="border border-base-300 divide-y divide-base-300">
                                {scopes.map((scope) => (
                                    <div key={scope} className="flex items-start gap-3 px-4 py-3">
                                        <i className="fa-duotone fa-regular fa-key text-xs text-base-content/30 mt-1" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-base-content/70">
                                                {SCOPE_DESCRIPTIONS[scope] ?? scope}
                                            </p>
                                            <p className="text-[11px] text-base-content/30 font-mono truncate mt-0.5">
                                                {scope}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Data handling notice */}
                    <div className="bg-base-200/50 border border-base-300 p-4">
                        <div className="flex items-start gap-3">
                            <i className="fa-duotone fa-regular fa-shield-check text-sm text-base-content/30 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-base-content/60 mb-1">
                                    Your data is secure
                                </p>
                                <p className="text-xs text-base-content/40 leading-relaxed">
                                    Splits Network uses OAuth 2.0 for secure authorization.
                                    We never store your password. You can disconnect at any time
                                    to revoke all access.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action button */}
                    <div className="pt-2">
                        {isConnected ? (
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="btn btn-outline btn-sm flex-1 rounded-none font-bold uppercase tracking-wider text-[11px]"
                                >
                                    Done
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={onConnect}
                                disabled={connecting}
                                className="btn btn-primary w-full rounded-none font-bold uppercase tracking-wider text-[11px]"
                            >
                                {connecting ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm" />
                                        Connecting to {provider.name}...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-duotone fa-regular fa-link" />
                                        Connect {provider.name}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
