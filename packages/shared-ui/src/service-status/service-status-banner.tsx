"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    useSiteNotifications,
    type SiteNotification,
} from "./use-site-notifications";

export interface ServiceStatusBannerProps {
    statusHref?: string;
}

const SEVERITY_STYLES: Record<
    string,
    { text: string; border: string; icon: string; btnClass: string }
> = {
    critical: {
        text: "text-error",
        border: "border-error/20",
        icon: "fa-duotone fa-regular fa-triangle-exclamation fa-beat",
        btnClass: "btn-error btn-ghost",
    },
    error: {
        text: "text-error",
        border: "border-error/20",
        icon: "fa-duotone fa-regular fa-bug fa-beat",
        btnClass: "btn-error btn-ghost",
    },
    warning: {
        text: "text-warning",
        border: "border-warning/20",
        icon: "fa-duotone fa-regular fa-wrench",
        btnClass: "btn-warning btn-ghost",
    },
    info: {
        text: "text-info",
        border: "border-info/20",
        icon: "fa-duotone fa-regular fa-megaphone",
        btnClass: "btn-info btn-ghost",
    },
    primary: {
        text: "text-primary",
        border: "border-coral/20",
        icon: "fa-duotone fa-regular fa-bullhorn",
        btnClass: "btn-primary btn-ghost",
    },
    secondary: {
        text: "text-secondary",
        border: "border-secondary/20",
        icon: "fa-duotone fa-regular fa-sparkles",
        btnClass: "btn-secondary btn-ghost",
    },
    accent: {
        text: "text-accent",
        border: "border-yellow/20",
        icon: "fa-duotone fa-regular fa-star",
        btnClass: "btn-accent btn-ghost",
    },
    neutral: {
        text: "text-base-content",
        border: "border-base-content/20",
        icon: "fa-duotone fa-regular fa-circle-info",
        btnClass: "btn-ghost",
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
        <div className={`w-full p-2 ${style.text} border-b-4 ${style.border}`}>
            <div className="container mx-auto">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <i className={`${style.icon} text-xl`}></i>
                        <div>
                            <h3 className="font-bold">
                                Some features may be temporarily unavailable
                            </h3>
                            <div className="text-sm opacity-90">
                                {formatMessage()}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <Link
                            href={statusHref}
                            className={`btn btn-sm ${style.btnClass}`}
                        >
                            View Status
                        </Link>
                        {allDismissible && (
                            <button
                                onClick={onDismissAll}
                                className="btn btn-sm btn-circle btn-ghost"
                                aria-label="Dismiss notification"
                            >
                                <i className="fa-duotone fa-regular fa-xmark"></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/** Individual banner for non-disruption notifications (maintenance, announcements, etc.). */
function NotificationBannerItem({
    notification,
    statusHref,
    onDismiss,
}: {
    notification: SiteNotification;
    statusHref: string;
    onDismiss: (id: string) => void;
}) {
    const style = getStyle(notification.severity);

    return (
        <div className={`w-full p-2 ${style.text} border-b-4 ${style.border}`}>
            <div className="container mx-auto">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <i className={`${style.icon} text-xl`}></i>
                        <div>
                            <h3 className="font-bold">{notification.title}</h3>
                            {notification.message && (
                                <div className="text-sm opacity-90">
                                    {notification.message}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {notification.dismissible && (
                            <button
                                onClick={() => onDismiss(notification.id)}
                                className="btn btn-sm btn-circle btn-ghost"
                                aria-label="Dismiss notification"
                            >
                                <i className="fa-duotone fa-regular fa-xmark"></i>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export function SiteNotificationBanner({
    statusHref = "/status",
}: ServiceStatusBannerProps) {
    const { notifications, isLoading, dismiss } = useSiteNotifications({
        autoRefresh: true,
        refreshInterval: 60000,
    });

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Split notifications: service disruptions get consolidated, everything else is individual
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
        <>
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
                    statusHref={statusHref}
                    onDismiss={dismiss}
                />
            ))}
        </>
    );
}

// Backwards compatibility alias
export { SiteNotificationBanner as ServiceStatusBanner };
