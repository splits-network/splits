"use client";

import { useEffect, useState } from "react";

/**
 * Development-only floating dev tool for the Basel service status system.
 * Shows API connectivity, environment info, and inline banner previews
 * that do NOT affect page layout (no --banner-h mutation).
 */
export function ServiceStatusDebugger() {
    const [collapsed, setCollapsed] = useState(true);
    const [apiStatus, setApiStatus] = useState<"checking" | "ok" | "error">("checking");
    const [apiDetail, setApiDetail] = useState("");
    const [notifCount, setNotifCount] = useState(0);
    const [showPreviews, setShowPreviews] = useState(false);
    const [dismissedPreviews, setDismissedPreviews] = useState<Set<string>>(new Set());

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "(not set)";

    useEffect(() => {
        async function testApi() {
            try {
                const base = (process.env.NEXT_PUBLIC_API_URL || "")
                    .replace(/\/+$/, "")
                    .replace(/\/api(?:\/v[0-9]+)?$/, "");
                const res = await fetch(`${base}/api/v2/site-notifications`, {
                    cache: "no-store",
                });
                if (res.ok) {
                    const json = await res.json();
                    const count = json.data?.length || 0;
                    setNotifCount(count);
                    setApiStatus("ok");
                    setApiDetail(`${count} notification${count !== 1 ? "s" : ""}`);
                } else {
                    setApiStatus("error");
                    setApiDetail(`${res.status} ${res.statusText}`);
                }
            } catch (err) {
                setApiStatus("error");
                setApiDetail(err instanceof Error ? err.message : "Unknown error");
            }
        }
        testApi();
    }, []);

    if (process.env.NODE_ENV !== "development") return null;

    const statusDot =
        apiStatus === "ok" ? "bg-success" :
        apiStatus === "error" ? "bg-error" :
        "bg-warning animate-pulse";

    // ── Collapsed: small floating pill ──
    if (collapsed) {
        return (
            <button
                onClick={() => setCollapsed(false)}
                className="fixed bottom-4 right-4 z-[9999] h-8 px-3 bg-neutral text-neutral-content text-[11px] font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow"
                title="Service Status Debugger"
            >
                <span className={`w-2 h-2 ${statusDot} flex-shrink-0`} />
                <span>Status</span>
                {notifCount > 0 && (
                    <span className="min-w-4 h-4 flex items-center justify-center bg-primary text-primary-content text-[9px] font-bold px-1">
                        {notifCount}
                    </span>
                )}
            </button>
        );
    }

    // ── Preview banner data ──
    const previewBanners = [
        {
            id: "preview-critical",
            severity: "critical",
            label: "Critical",
            title: "API Gateway experiencing high latency",
            icon: "fa-duotone fa-regular fa-triangle-exclamation",
            iconBg: "bg-error/10",
            iconColor: "text-error",
            border: "border-error",
        },
        {
            id: "preview-warning",
            severity: "warning",
            label: "Warning",
            title: "Scheduled maintenance tonight 2-4 AM",
            icon: "fa-duotone fa-regular fa-wrench",
            iconBg: "bg-warning/10",
            iconColor: "text-warning",
            border: "border-warning",
        },
        {
            id: "preview-info",
            severity: "info",
            label: "Info",
            title: "New candidate matching algorithm available",
            icon: "fa-duotone fa-regular fa-megaphone",
            iconBg: "bg-info/10",
            iconColor: "text-info",
            border: "border-info",
        },
        {
            id: "preview-primary",
            severity: "primary",
            label: "Primary",
            title: "Platform update deployed successfully",
            icon: "fa-duotone fa-regular fa-bullhorn",
            iconBg: "bg-primary/10",
            iconColor: "text-primary",
            border: "border-primary",
        },
    ];

    const visiblePreviews = previewBanners.filter((b) => !dismissedPreviews.has(b.id));

    // ── Expanded panel ──
    return (
        <div className="fixed bottom-4 right-4 z-[9999] w-80 bg-neutral text-neutral-content shadow-xl flex flex-col max-h-[70vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-content/10">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 ${statusDot} flex-shrink-0`} />
                    <span className="text-xs font-bold tracking-wide uppercase">
                        Status Debugger
                    </span>
                </div>
                <button
                    onClick={() => setCollapsed(true)}
                    className="w-6 h-6 flex items-center justify-center text-neutral-content/40 hover:text-neutral-content transition-colors"
                    aria-label="Collapse"
                >
                    <i className="fa-solid fa-chevron-down text-[10px]" />
                </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 p-3 space-y-3">
                {/* API Status */}
                <div className="space-y-1.5">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-content/40">
                        API Connection
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <span className={`w-1.5 h-1.5 ${statusDot} flex-shrink-0`} />
                        <span className={apiStatus === "ok" ? "text-success" : apiStatus === "error" ? "text-error" : "text-warning"}>
                            {apiStatus === "ok" ? "Connected" : apiStatus === "error" ? "Failed" : "Checking..."}
                        </span>
                        <span className="text-neutral-content/40">{apiDetail}</span>
                    </div>
                    <div className="text-[10px] text-neutral-content/30 font-mono break-all">
                        {apiUrl}
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-neutral-content/10" />

                {/* Banner Previews */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-content/40">
                            Banner Previews
                        </div>
                        <button
                            onClick={() => {
                                setShowPreviews(!showPreviews);
                                setDismissedPreviews(new Set());
                            }}
                            className="text-[10px] font-bold text-primary hover:text-primary/80 transition-colors"
                        >
                            {showPreviews ? "Hide" : "Show"}
                        </button>
                    </div>

                    {showPreviews && visiblePreviews.length > 0 && (
                        <div className="space-y-1.5">
                            {visiblePreviews.map((b) => (
                                <div
                                    key={b.id}
                                    className={`bg-base-100 border-l-3 ${b.border} text-base-content`}
                                >
                                    <div className="flex items-center gap-2 px-2.5 py-2">
                                        <div className={`w-5 h-5 ${b.iconBg} flex items-center justify-center flex-shrink-0`}>
                                            <i className={`${b.icon} ${b.iconColor} text-[10px]`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-bold leading-tight truncate">
                                                {b.title}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => setDismissedPreviews((prev) => new Set([...prev, b.id]))}
                                            className="w-4 h-4 flex items-center justify-center text-base-content/30 hover:text-base-content/60 flex-shrink-0"
                                            aria-label="Dismiss"
                                        >
                                            <i className="fa-solid fa-xmark text-[8px]" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {showPreviews && visiblePreviews.length === 0 && (
                        <div className="text-[10px] text-neutral-content/30 py-1">
                            All dismissed.{" "}
                            <button
                                onClick={() => setDismissedPreviews(new Set())}
                                className="text-primary hover:underline"
                            >
                                Reset
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="px-3 py-2 border-t border-neutral-content/10 flex gap-2">
                <button
                    className="btn btn-xs btn-ghost text-neutral-content/50 hover:text-neutral-content flex-1"
                    onClick={() => window.location.reload()}
                >
                    <i className="fa-solid fa-rotate-right text-[10px]" />
                    <span className="text-[10px]">Reload</span>
                </button>
            </div>
        </div>
    );
}
