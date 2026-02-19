"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

/** Minimal notification shape the banner needs to render. */
export interface BannerNotification {
    id: string;
    type: string;
    title: string;
    message: string | null;
    severity: string;
    dismissible: boolean;
    metadata?: {
        display_name?: string;
        [key: string]: any;
    };
}

export interface ServiceStatusBannerProps {
    statusHref?: string;
    notifications: BannerNotification[];
    isLoading: boolean;
    onDismiss: (id: string) => void;
}

/* ─── Severity → Basel editorial style mapping ──────────────────────────── */

const SEVERITY_STYLES: Record<
    string,
    { iconBg: string; border: string; iconColor: string; icon: string }
> = {
    critical: {
        iconBg: "bg-error/10",
        border: "border-error",
        iconColor: "text-error",
        icon: "fa-duotone fa-regular fa-triangle-exclamation",
    },
    error: {
        iconBg: "bg-error/10",
        border: "border-error",
        iconColor: "text-error",
        icon: "fa-duotone fa-regular fa-circle-exclamation",
    },
    warning: {
        iconBg: "bg-warning/10",
        border: "border-warning",
        iconColor: "text-warning",
        icon: "fa-duotone fa-regular fa-wrench",
    },
    info: {
        iconBg: "bg-info/10",
        border: "border-info",
        iconColor: "text-info",
        icon: "fa-duotone fa-regular fa-megaphone",
    },
    primary: {
        iconBg: "bg-primary/10",
        border: "border-primary",
        iconColor: "text-primary",
        icon: "fa-duotone fa-regular fa-bullhorn",
    },
    secondary: {
        iconBg: "bg-secondary/10",
        border: "border-secondary",
        iconColor: "text-secondary",
        icon: "fa-duotone fa-regular fa-sparkles",
    },
    accent: {
        iconBg: "bg-accent/10",
        border: "border-accent",
        iconColor: "text-accent",
        icon: "fa-duotone fa-regular fa-star",
    },
    neutral: {
        iconBg: "bg-neutral/10",
        border: "border-neutral",
        iconColor: "text-neutral",
        icon: "fa-duotone fa-regular fa-circle-info",
    },
};

function getStyle(severity: string) {
    return SEVERITY_STYLES[severity] || SEVERITY_STYLES.info;
}

function worstSeverity(notifications: BannerNotification[]): string {
    const order = ["critical", "error", "warning", "info"];
    for (const level of order) {
        if (notifications.some((n) => n.severity === level)) return level;
    }
    return "info";
}

/* ─── Consolidated disruption banner ────────────────────────────────────── */

function DisruptionBanner({
    disruptions,
    statusHref,
    onDismissAll,
    allDismissible,
}: {
    disruptions: BannerNotification[];
    statusHref: string;
    onDismissAll: () => void;
    allDismissible: boolean;
}) {
    const severity = worstSeverity(disruptions);
    const style = getStyle(severity);
    const serviceNames = disruptions.map(
        (n) => n.metadata?.display_name || n.title,
    );
    const count = disruptions.length;

    function formatMessage() {
        if (count === 1) {
            return `We're currently experiencing issues with ${serviceNames[0]}. Our team is looking into it.`;
        }
        const MAX_SHOWN = 3;
        const shown = serviceNames.slice(0, MAX_SHOWN);
        const remaining = count - MAX_SHOWN;
        if (remaining > 0) {
            return `We're currently experiencing issues with ${shown.join(", ")} and ${remaining} other${remaining > 1 ? "s" : ""}. Our team is looking into it.`;
        }
        if (shown.length === 2) {
            return `We're currently experiencing issues with ${shown.join(" and ")}. Our team is looking into it.`;
        }
        return `We're currently experiencing issues with ${shown.slice(0, -1).join(", ")} and ${shown[shown.length - 1]}. Our team is looking into it.`;
    }

    return (
        <div className={`w-full bg-base-100 border-l-4 ${style.border} text-base-content shadow-sm`}>
            <div className="container mx-auto px-6 py-3">
                <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 ${style.iconBg} flex items-center justify-center flex-shrink-0`}>
                        <i className={`${style.icon} ${style.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold leading-tight">
                            Some features may be temporarily unavailable
                        </p>
                        <p className="text-xs text-base-content/60 leading-relaxed mt-0.5">
                            {formatMessage()}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Link
                            href={statusHref}
                            className="btn btn-ghost btn-xs text-xs font-semibold"
                        >
                            <i className="fa-duotone fa-regular fa-chart-line" />
                            View Status
                        </Link>
                        {allDismissible && (
                            <button
                                onClick={onDismissAll}
                                className="btn btn-ghost btn-xs btn-square"
                                aria-label="Dismiss notification"
                            >
                                <i className="fa-duotone fa-regular fa-xmark text-base-content/40" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ─── Individual notification banner ────────────────────────────────────── */

function NotificationBannerItem({
    notification,
    onDismiss,
}: {
    notification: BannerNotification;
    onDismiss: (id: string) => void;
}) {
    const style = getStyle(notification.severity);

    return (
        <div className={`w-full bg-base-100 border-l-4 ${style.border} text-base-content shadow-sm`}>
            <div className="container mx-auto px-6 py-3">
                <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 ${style.iconBg} flex items-center justify-center flex-shrink-0`}>
                        <i className={`${style.icon} ${style.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold leading-tight">
                            {notification.title}
                        </p>
                        {notification.message && (
                            <p className="text-xs text-base-content/60 leading-relaxed mt-0.5">
                                {notification.message}
                            </p>
                        )}
                    </div>
                    {notification.dismissible && (
                        <button
                            onClick={() => onDismiss(notification.id)}
                            className="btn btn-ghost btn-xs btn-square flex-shrink-0"
                            aria-label="Dismiss notification"
                        >
                            <i className="fa-duotone fa-regular fa-xmark text-base-content/40" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─── Main banner container ─────────────────────────────────────────────── */

export function ServiceStatusBanner({
    statusHref = "/status",
    notifications,
    isLoading,
    onDismiss,
}: ServiceStatusBannerProps) {
    const [mounted, setMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Publish banner height as CSS variable for sidebar/layout coordination
    const updateBannerHeight = useCallback(() => {
        const h = containerRef.current?.offsetHeight ?? 0;
        document.documentElement.style.setProperty("--banner-h", `${h}px`);
    }, []);

    useEffect(() => {
        updateBannerHeight();
        if (!containerRef.current) return;
        const observer = new ResizeObserver(updateBannerHeight);
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [notifications, mounted, updateBannerHeight]);

    // Reset to 0 when there are no banners
    useEffect(() => {
        if (!mounted || isLoading || notifications.length === 0) {
            document.documentElement.style.setProperty("--banner-h", "0px");
        }
    }, [mounted, isLoading, notifications.length]);

    const { disruptions, others } = useMemo(() => {
        const disruptions: BannerNotification[] = [];
        const others: BannerNotification[] = [];
        for (const n of notifications) {
            if (n.type === "service_disruption") {
                disruptions.push(n);
            } else {
                others.push(n);
            }
        }
        return { disruptions, others };
    }, [notifications]);

    if (!mounted || isLoading) return null;
    if (notifications.length === 0) return null;

    const allDisruptionsDismissible =
        disruptions.length > 0 && disruptions.every((n) => n.dismissible);

    return (
        <div
            ref={containerRef}
            className="sticky z-40"
            style={{ top: "var(--header-h, 0px)" }}
        >
            {disruptions.length > 0 && (
                <DisruptionBanner
                    disruptions={disruptions}
                    statusHref={statusHref}
                    onDismissAll={() =>
                        disruptions.forEach((n) => onDismiss(n.id))
                    }
                    allDismissible={allDisruptionsDismissible}
                />
            )}
            {others.map((notification) => (
                <NotificationBannerItem
                    key={notification.id}
                    notification={notification}
                    onDismiss={onDismiss}
                />
            ))}
        </div>
    );
}
