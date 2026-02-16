"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
    useSiteNotifications,
    type SiteNotification,
} from "@splits-network/shared-ui";

export interface ServiceStatusBannerProps {
    statusHref?: string;
}

/**
 * Memphis severity → Tailwind classes.
 * Uses Memphis accent palette: coral (danger), yellow (warning), teal (info), purple (accent).
 */
const SEVERITY_STYLES: Record<
    string,
    { bg: string; text: string; border: string; icon: string }
> = {
    critical: {
        bg: "bg-coral",
        text: "text-dark",
        border: "border-dark",
        icon: "fa-duotone fa-regular fa-triangle-exclamation fa-beat",
    },
    error: {
        bg: "bg-coral",
        text: "text-dark",
        border: "border-dark",
        icon: "fa-duotone fa-regular fa-bug fa-beat",
    },
    warning: {
        bg: "bg-yellow",
        text: "text-dark",
        border: "border-dark",
        icon: "fa-duotone fa-regular fa-wrench",
    },
    info: {
        bg: "bg-teal",
        text: "text-dark",
        border: "border-dark",
        icon: "fa-duotone fa-regular fa-megaphone",
    },
    primary: {
        bg: "bg-coral",
        text: "text-dark",
        border: "border-dark",
        icon: "fa-duotone fa-regular fa-bullhorn",
    },
    secondary: {
        bg: "bg-purple",
        text: "text-dark",
        border: "border-dark",
        icon: "fa-duotone fa-regular fa-sparkles",
    },
    accent: {
        bg: "bg-teal",
        text: "text-dark",
        border: "border-dark",
        icon: "fa-duotone fa-regular fa-star",
    },
    neutral: {
        bg: "bg-dark",
        text: "text-cream",
        border: "border-cream/20",
        icon: "fa-duotone fa-regular fa-circle-info",
    },
};

function getStyle(severity: string) {
    return SEVERITY_STYLES[severity] || SEVERITY_STYLES.info;
}

/** Pick the worst severity from a set of disruption notifications. */
function worstSeverity(notifications: SiteNotification[]): string {
    const order = ["critical", "error", "warning", "info"];
    for (const level of order) {
        if (notifications.some((n) => n.severity === level)) return level;
    }
    return "error";
}

/** Memphis dismiss button — square, bordered, no rounded corners. */
function DismissButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="w-8 h-8 border-4 border-dark bg-transparent flex items-center justify-center font-black text-dark hover:bg-dark hover:text-cream transition-colors"
            aria-label="Dismiss notification"
        >
            <i className="fa-duotone fa-regular fa-xmark text-sm" />
        </button>
    );
}

/** Consolidated banner for one or more service_disruption notifications. */
function DisruptionBanner({
    disruptions,
    statusHref,
    onDismissAll,
    allDismissible,
}: {
    disruptions: SiteNotification[];
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
        const list =
            remaining > 0
                ? `${shown.join(", ")} and ${remaining} other${remaining > 1 ? "s" : ""}`
                : shown.length === 2
                  ? shown.join(" and ")
                  : `${shown.slice(0, -1).join(", ")} and ${shown[shown.length - 1]}`;
        return `We're currently experiencing issues with ${list}. Our team is looking into it.`;
    }

    return (
        <div
            className={`w-full px-4 py-3 ${style.bg} ${style.text} border-b-4 ${style.border}`}
        >
            <div className="container mx-auto">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <i className={`${style.icon} text-xl`} />
                        <div>
                            <h3 className="font-black text-sm uppercase tracking-wide">
                                Some features may be temporarily unavailable
                            </h3>
                            <div className="text-sm opacity-80 font-medium">
                                {formatMessage()}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={statusHref}
                            className="px-4 py-1.5 border-4 border-dark bg-dark text-cream text-xs font-black uppercase tracking-wider hover:bg-cream hover:text-dark transition-colors"
                        >
                            View Status
                        </Link>
                        {allDismissible && (
                            <DismissButton onClick={onDismissAll} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/** Individual banner for non-disruption notifications. */
function NotificationBannerItem({
    notification,
    onDismiss,
}: {
    notification: SiteNotification;
    onDismiss: (id: string) => void;
}) {
    const style = getStyle(notification.severity);

    return (
        <div
            className={`w-full px-4 py-3 ${style.bg} ${style.text} border-b-4 ${style.border}`}
        >
            <div className="container mx-auto">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <i className={`${style.icon} text-xl`} />
                        <div>
                            <h3 className="font-black text-sm uppercase tracking-wide">
                                {notification.title}
                            </h3>
                            {notification.message && (
                                <div className="text-sm opacity-80 font-medium">
                                    {notification.message}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {notification.dismissible && (
                            <DismissButton
                                onClick={() => onDismiss(notification.id)}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function ServiceStatusBanner({
    statusHref = "/status",
}: ServiceStatusBannerProps) {
    const { notifications, isLoading, dismiss } = useSiteNotifications({
        autoRefresh: true,
        refreshInterval: 60000,
    });

    const [mounted, setMounted] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Publish banner height as CSS variable so the fixed sidebar can account for it
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
        const disruptions: SiteNotification[] = [];
        const others: SiteNotification[] = [];
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
        <div ref={containerRef} className="sticky z-40" style={{ top: "var(--header-h, 0px)" }}>
            {disruptions.length > 0 && (
                <DisruptionBanner
                    disruptions={disruptions}
                    statusHref={statusHref}
                    onDismissAll={() =>
                        disruptions.forEach((n) => dismiss(n.id))
                    }
                    allDismissible={allDisruptionsDismissible}
                />
            )}
            {others.map((notification) => (
                <NotificationBannerItem
                    key={notification.id}
                    notification={notification}
                    onDismiss={dismiss}
                />
            ))}
        </div>
    );
}
